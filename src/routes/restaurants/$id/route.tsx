import Restaurants from "@/components/pages/Restaurants";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/restaurants/$id")({
  loader: async ({ context, params }) =>
    context.queryClient.ensureQueryData(
      context.trpc.restaurant.getById.queryOptions({
        restaurantId: params.id,
      }),
    ),
  component: Restaurants,
});
