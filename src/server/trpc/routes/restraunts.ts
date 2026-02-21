import { get } from "http";
import { authedProcedure } from "../middleware/auth-middleware";
import { publicProcedure, router } from "../trpc-config";
import { db } from "@/server/db";
import { restaurant } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

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
});
