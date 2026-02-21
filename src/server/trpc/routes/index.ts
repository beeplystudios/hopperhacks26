import { router } from "../trpc-config";
import { restaurantRouter } from "./restraunts";

export const appRouter = router({
  restaurant: restaurantRouter,
});

// Export type router type signature,
// NOT the router itself.
export type TRPCRouter = typeof appRouter;
