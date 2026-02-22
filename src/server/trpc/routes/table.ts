import { table } from "@/server/db/schema";
import {
  authedProcedure,
  restaurantOwnerProcedure,
} from "../middleware/auth-middleware";
import { router } from "../trpc-config";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const tableRouter = router({
  /**
   * completely replaces the tables for a restaurant with the given tables.
   */
  bulkUpdate: restaurantOwnerProcedure
    .input(
      z.object({
        tables: z.array(
          z.object({
            name: z.string(),
            maxSeats: z.number().int().positive(),
            maxReservationLength: z.number().int().positive(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        // delete all existing tables for the restaurant
        await tx
          .delete(table)
          .where(eq(table.restaurantId, input.restaurantId));

        // insert new tables
        const insertedTables = await tx
          .insert(table)
          .values(
            input.tables.map((t) => ({
              name: t.name,
              maxSeats: t.maxSeats,
              maxReservationLength: t.maxReservationLength,
              restaurantId: input.restaurantId,
            })),
          )
          .returning();

        return insertedTables;
      });
    }),

  delete: restaurantOwnerProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // FIXME: check that only the restaurant owner can delete tables for their restaurant
      await ctx.db.delete(table).where(eq(table.id, input.tableId));
    }),

  getByRestaurant: authedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tables = await ctx.db
        .select()
        .from(table)
        .where(eq(table.restaurantId, input.restaurantId));

      return tables;
    }),
});
