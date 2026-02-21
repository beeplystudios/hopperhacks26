import { table } from "@/server/db/schema";
import { authedProcedure } from "../middleware/auth-middleware";
import { router } from "../trpc-config";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const tableRouter = router({
  create: authedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        name: z.string(),
        maxSeats: z.number().int().positive(),
        maxReservationLength: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // FIXME: check that only the restaurant owner can create tables for their restaurant
      const newTable = await ctx.db
        .insert(table)
        .values({
          restaurantId: input.restaurantId,
          name: input.name,
          maxSeats: input.maxSeats,
          maxReservationLength: input.maxReservationLength,
        })
        .returning()
        .then((rows) => rows[0]);

      return newTable;
    }),

  delete: authedProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // FIXME: check that only the restaurant owner can delete tables for their restaurant
      await ctx.db.delete(table).where(eq(table.id, input.tableId));
    }),

  update: authedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().optional(),
        maxSeats: z.number().int().positive().optional(),
        maxReservationLength: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // FIXME: check that only the restaurant owner can update tables for their restaurant
      const updatedTable = await ctx.db
        .update(table)
        .set({
          name: input.name,
          maxSeats: input.maxSeats,
          maxReservationLength: input.maxReservationLength,
        })
        .where(eq(table.id, input.tableId))
        .returning()
        .then((rows) => rows[0]);

      return updatedTable;
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
