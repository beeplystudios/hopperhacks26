import { extractAuth } from "../middleware/auth-middleware";
import { publicProcedure, router } from "../trpc-config";
import { restaurantRouter } from "./restraunts";

export const appRouter = router({
  test: publicProcedure.query(async () => "Hi from the server!"),

  me: publicProcedure
    .use(extractAuth)
    .query(async ({ ctx }) => ctx.user ?? null),

  restaurant: restaurantRouter,
});

// Export type router type signature,
// NOT the router itself.
export type TRPCRouter = typeof appRouter;
