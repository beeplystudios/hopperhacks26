import { createFileRoute } from "@tanstack/react-router";
import ManageDashboard from "@/components/pages/Manage/Dashboard";

export const Route = createFileRoute("/manage/$id/")({
  loader: async ({ params: { id }, context: { trpc, queryClient } }) => {
    const dishesOverTimeQuery = await queryClient.ensureQueryData(
      trpc.restaurant.getDishesOverTimeOnDate.queryOptions({
        date: new Date(),
        restaurantId: id,
      }),
    );

    const reservationsQuery = await queryClient.ensureQueryData(
      trpc.restaurant.getAllReservations.queryOptions({
        restaurantId: id,
        startTime: new Date(0),
        endTime: new Date(3000, 0, 0),
      }),
    );

    const restaurantQuery = await queryClient.ensureQueryData(
      trpc.restaurant.getById.queryOptions({
        restaurantId: id,
      }),
    );

    return {
      dishesOverTime: dishesOverTimeQuery,
      reservations: reservationsQuery,
      restaurant: restaurantQuery,
    };
  },

  component: ManageDashboard,
});
