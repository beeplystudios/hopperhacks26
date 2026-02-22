import Ingredients from "@/components/pages/Manage/Ingredients";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id/ingredients")({
  component: Ingredients,
  loader: async ({ params: { id }, context: { trpc, queryClient } }) => {
    const ingredients = await queryClient.ensureQueryData(
      trpc.menu.getIngredients.queryOptions({ restaurantId: id }),
    );
    return { ingredients };
  },
});
