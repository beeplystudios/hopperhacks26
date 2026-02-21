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
import { and, asc, eq } from "drizzle-orm";

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
      const allOrders = await db
        .select()
        .from(reservation)
        .where(eq(reservation.restaurantId, input.restaurantId))
        .innerJoin(orderItem, eq(reservation.id, orderItem.reservation))
        .innerJoin(menuItem, eq(orderItem.menuItem, menuItem.id))
        .innerJoin(
          menuItemIngredient,
          eq(menuItem.id, menuItemIngredient.menuItemId),
        )
        .innerJoin(
          ingredient,
          eq(menuItemIngredient.ingredientId, ingredient.id),
        )
        .orderBy(asc(reservation.startTime));
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
