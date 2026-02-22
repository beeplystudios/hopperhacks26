import { publicProcedure, router } from "../trpc-config";
import { db } from "@/server/db";
import {
  ingredient,
  menu,
  menuItem,
  menuItemIngredient,
  orderItem,
  reservation,
  restaurant,
  table,
} from "@/server/db/schema";
import { z } from "zod";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  lte,
  sql,
} from "drizzle-orm";
import {
  authedProcedure,
  restaurantOwnerProcedure,
} from "../middleware/auth-middleware";
import { timeStringToMinutes } from "@/lib/parse-time";

export interface TimeBlock {
  startTime: Date;
  orders: OrderDesc[];
}

export interface OrderDesc {
  id: string;
  // maps ingredient id --> ingredient description
  totalIngredients: Map<string, IngredientDesc>;
}

export interface IngredientDesc {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface ReservationDesc {
  // maps the start time of the time block (in ISO string format) --> the time block object
  timeBlocks: Map<string, TimeBlock>;
  // maps ingredient id --> ingredient description
  totalIngredients: Map<string, IngredientDesc>;
}

export interface AggregatedOrder {
  id: string;
  startTime: Date;
  endTime: Date;
  totalIngredients: Map<string, IngredientDesc>;
  unit: string;
}

interface AggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurantFilterOptions {
  restaurantId: string;
  startTime: Date;
  endTime: Date;
  filterPaidReservations?: boolean;
}

export const aggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurant =
  async (
    options: AggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurantFilterOptions,
  ): Promise<ReservationDesc> => {
    const records = await db
      .select({
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        ingredientQuantity: menuItemIngredient.quantity,
        ingredientUnit: menuItemIngredient.unit,
        reservationId: reservation.id,
        reservationStartTime: reservation.startTime,
      })
      .from(reservation)
      .where(
        and(
          eq(reservation.restaurantId, options.restaurantId),
          gte(reservation.startTime, options.startTime),
          lte(reservation.endTime, options.endTime),
          options.filterPaidReservations
            ? eq(reservation.status, "CONFIRMED")
            : undefined,
        ),
      )
      .innerJoin(orderItem, eq(reservation.id, orderItem.reservation))
      .innerJoin(menuItem, eq(orderItem.menuItem, menuItem.id))
      .innerJoin(
        menuItemIngredient,
        eq(menuItem.id, menuItemIngredient.menuItemId),
      )
      .innerJoin(ingredient, eq(menuItemIngredient.ingredientId, ingredient.id))
      .orderBy(asc(reservation.startTime));

    // maps ingredient id --> quantity of that ingredient
    const totalIngredientsMap = new Map<string, IngredientDesc>();
    // maps the start time of the time block (in ISO string format) --> the time block object
    const timeBlocksMap = new Map<string, TimeBlock>();
    // maps order ids to orders
    const ordersMap = new Map<string, AggregatedOrder>();

    for (const record of records) {
      if (!ordersMap.has(record.reservationId)) {
        ordersMap.set(record.reservationId, {
          id: record.reservationId,
          startTime: record.reservationStartTime,
          endTime: record.reservationStartTime,
          totalIngredients: new Map<string, IngredientDesc>(),
          unit: record.ingredientUnit,
        });
      }

      const order = ordersMap.get(record.reservationId)!;
      if (!order.totalIngredients.has(record.ingredientId)) {
        order.totalIngredients.set(record.ingredientId, {
          id: record.ingredientId,
          name: record.ingredientName,
          quantity: 0,
          unit: record.ingredientUnit,
        });
      }

      const ingredientDesc = order.totalIngredients.get(record.ingredientId)!;
      ingredientDesc.quantity += record.ingredientQuantity;
    }

    for (const order of ordersMap.values()) {
      for (const ingredientDesc of order.totalIngredients.values()) {
        if (!totalIngredientsMap.has(ingredientDesc.id)) {
          totalIngredientsMap.set(ingredientDesc.id, {
            id: ingredientDesc.id,
            name: ingredientDesc.name,
            quantity: 0,
            unit: ingredientDesc.unit,
          });
        }

        const totalIngredientDesc = totalIngredientsMap.get(ingredientDesc.id)!;
        totalIngredientDesc.quantity += ingredientDesc.quantity;
      }

      const timeBlockStartTime = order.startTime.toISOString();
      if (!timeBlocksMap.has(timeBlockStartTime)) {
        timeBlocksMap.set(timeBlockStartTime, {
          startTime: order.startTime,
          orders: [],
        });
      }

      const timeBlock = timeBlocksMap.get(timeBlockStartTime)!;
      timeBlock.orders.push({
        id: order.id,
        totalIngredients: order.totalIngredients,
      });
    }

    return {
      totalIngredients: totalIngredientsMap,
      timeBlocks: timeBlocksMap,
    };
  };

export const restaurantRouter = router({
  getAll: publicProcedure.query(async () => {
    return await db.select().from(restaurant);
  }),
  getPastRestraunts: authedProcedure.query(async ({ ctx }) => {
    return await db
      .select({ ...getTableColumns(restaurant) })
      .from(restaurant)
      .innerJoin(reservation, eq(restaurant.id, reservation.restaurantId))
      .where(
        and(
          eq(reservation.userId, ctx.user.id),
          lte(reservation.endTime, new Date()),
        ),
      );
  }),
  getCapacityInfo: restaurantOwnerProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        date: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const seatsFilled = (
        await db
          .select({ seatsFilled: sql`SUM(number_of_seats)` })
          .from(reservation)
          .where(
            and(
              eq(reservation.restaurantId, input.restaurantId),
              eq(reservation.status, "CONFIRMED"),
              gte(reservation.startTime, startOfDay),
              lte(reservation.endTime, endOfDay),
            ),
          )
      )[0].seatsFilled as number;

      const restaurantTimes = (
        await db
          .select({
            openTime: restaurant.openTime,
            closeTime: restaurant.closeTime,
          })
          .from(restaurant)
          .where(eq(restaurant.id, input.restaurantId))
          .limit(1)
      )[0];
      const startMinutes = timeStringToMinutes(restaurantTimes.openTime);
      const closeMinutes = timeStringToMinutes(restaurantTimes.closeTime);

      const tables = await db
        .select()
        .from(table)
        .where(eq(table.restaurantId, input.restaurantId));

      let capacity = 0;

      for (const table of tables) {
        capacity +=
          Math.floor(
            (closeMinutes - startMinutes) / table.maxReservationLength,
          ) * table.maxSeats;
      }

      return {
        seatsFilled: seatsFilled ?? 0,
        capacity: capacity,
      };
    }),
  getNearby: publicProcedure
    .input(z.object({ lat: z.number(), lng: z.number() }))
    .query(async ({ input }) => {
      const sqlPoint = sql`ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)`;

      try {
        const res = await db
          .select({
            ...getTableColumns(restaurant),
            distance: sql`ST_Distance(ST_SetSRID(${restaurant.location}, 4326), ${sqlPoint})`,
          })
          .from(restaurant)
          .orderBy(
            sql`ST_SetSRID(${restaurant.location}, 4326) <-> ${sqlPoint}`,
          );

        return res;
      } catch (err) {
        console.error("Nearby query failed:", err);
        throw err;
      }
    }),

  getById: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const res = (
        await db
          .select()
          .from(restaurant)
          .where(eq(restaurant.id, input.restaurantId))
          .limit(1)
      )[0];

      const maxTableSize = await db
        .select({ maxSeats: table.maxSeats })
        .from(table)
        .where(eq(table.restaurantId, input.restaurantId))
        .orderBy(desc(table.maxSeats))
        .limit(1);

      return { ...res, maxTableSize: maxTableSize[0]?.maxSeats ?? 0 };
    }),

  getAllReservations: restaurantOwnerProcedure
    .input(
      z.object({
        startTime: z.date().nullish(),
        endTime: z.date().nullish(),
      }),
    )
    .query(async ({ input }) => {
      return await aggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurant(
        {
          restaurantId: input.restaurantId,
          startTime: input.startTime ?? new Date(0),
          endTime: input.endTime ?? new Date(8640000000000000),
        },
      );
    }),

  getDishesOverTimeOnDate: restaurantOwnerProcedure
    .input(
      z.object({
        date: z.date(),
        restaurantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const restaurantTimes = (
        await db
          .select({
            openTime: restaurant.openTime,
            closeTime: restaurant.closeTime,
          })
          .from(restaurant)
          .where(eq(restaurant.id, input.restaurantId))
          .limit(1)
      )[0];

      const startMinutes = timeStringToMinutes(restaurantTimes.openTime);
      const endMinutes = timeStringToMinutes(restaurantTimes.closeTime);

      const allMenuItems = await db
        .select({ id: menuItem.id, name: menuItem.name })
        .from(menu)
        .where(eq(menu.restaurantId, input.restaurantId))
        .leftJoin(menuItem, eq(menu.id, menuItem.menuId));

      const menuItems = await db
        .select({
          name: menuItem.name,
          reservationStartTime: reservation.startTime,
          quantity: orderItem.quantity,
        })
        .from(reservation)
        .where(
          and(
            eq(reservation.restaurantId, input.restaurantId),
            gte(reservation.startTime, startOfDay),
            lte(reservation.startTime, endOfDay),
            eq(reservation.status, "CONFIRMED"),
          ),
        )
        .innerJoin(orderItem, eq(reservation.id, orderItem.reservation))
        .innerJoin(menuItem, eq(orderItem.menuItem, menuItem.id));

      const dishesOverTimeMap = new Map<string, number[]>();
      const arrSlots = (endMinutes - startMinutes) / 30 + 1;
      for (const menuItem of allMenuItems) {
        dishesOverTimeMap.set(menuItem.name ?? "", new Array(arrSlots).fill(0));
      }

      for (const menuItem of menuItems) {
        const recordStartMinutes =
          menuItem.reservationStartTime.getUTCHours() * 60 +
          menuItem.reservationStartTime.getUTCMinutes();
        console.log(recordStartMinutes, startMinutes, endMinutes);
        console.log(
          menuItem.reservationStartTime,
          restaurantTimes.openTime,
          restaurantTimes.closeTime,
        );
        const itemIdx = Math.floor((recordStartMinutes - startMinutes) / 30);
        const dishDesc = dishesOverTimeMap.get(menuItem.name)!;
        dishDesc[itemIdx] += menuItem.quantity;
      }

      return dishesOverTimeMap;
    }),

  getTablesForRestaurant: restaurantOwnerProcedure.query(async ({ input }) => {
    return await db
      .select()
      .from(table)
      .where(eq(table.restaurantId, input.restaurantId));
  }),
});
