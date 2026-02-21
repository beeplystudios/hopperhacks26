import { publicProcedure, router } from "../trpc-config";
import { db } from "@/server/db";
import {
  ingredient,
  menuItem,
  menuItemIngredient,
  orderItem,
  reservation,
  restaurant,
  table,
} from "@/server/db/schema";
import { z } from "zod";
import { and, asc, eq, gte, lte } from "drizzle-orm";

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
        });
      }

      const order = ordersMap.get(record.reservationId)!;
      if (!order.totalIngredients.has(record.ingredientId)) {
        order.totalIngredients.set(record.ingredientId, {
          id: record.ingredientId,
          name: record.ingredientName,
          quantity: 0,
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

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const res = await db
        .select()
        .from(restaurant)
        .where(eq(restaurant.id, input.id))
        .limit(1);

      return res[0];
    }),

  // FIXME: this should be a procedure that is only visible to restaurant owners
  getAllReservations: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        startTime: z.date().nullish(),
        endTime: z.date().nullish(),
      }),
    )
    .query(async ({ input }) => {
      return await aggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurant(
        {
          restaurantId: input.restaurantId,
          // TODO: adjust this
          startTime: input.startTime ?? new Date(0),
          endTime: input.endTime ?? new Date(8640000000000000),
        },
      );
    }),

  getTablesForRestaurant: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await db
        .select()
        .from(table)
        .where(eq(table.restaurantId, input.restaurantId));
    }),
});
