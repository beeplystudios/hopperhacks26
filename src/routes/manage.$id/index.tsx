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

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const reservationsQuery = await queryClient.ensureQueryData(
      trpc.reservation.getInDateRange.queryOptions({
        restaurantId: id,
        startTime: today,
        endTime: tomorrow,
      }),
    );

    const restaurantQuery = await queryClient.ensureQueryData(
      trpc.restaurant.getById.queryOptions({
        restaurantId: id,
      }),
    );

    const restaurantCapacityQuery = await queryClient.ensureQueryData(
      trpc.restaurant.getCapacityInfo.queryOptions({
        restaurantId: id,
        date: new Date(),
      }),
    );

    return {
      dishesOverTime: dishesOverTimeQuery,
      reservations: reservationsQuery,
      restaurant: restaurantQuery,
      restaurantCapacity: restaurantCapacityQuery,
    };
  },

  component: ManageDashboard,
});
