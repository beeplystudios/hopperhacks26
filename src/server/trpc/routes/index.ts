import { extractAuth } from "../middleware/auth-middleware";
import { publicProcedure, router } from "../trpc-config";
import { menuRouter } from "./menu";
import { restaurantRouter } from "./restaurant";
import { tableRouter } from "./table";
import { reservationRouter } from "./reservation";

export const appRouter = router({
  test: publicProcedure.query(async () => "Hi from the server!"),

  me: publicProcedure
    .use(extractAuth)
    .query(async ({ ctx }) => ctx.user ?? null),

  table: tableRouter,
  restaurant: restaurantRouter,
  menu: menuRouter,
  reservation: reservationRouter,
});

// Export type router type signature,
// NOT the router itself.
export type TRPCRouter = typeof appRouter;
