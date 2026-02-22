import UpcomingDashboard from "@/components/pages/Manage/Upcoming";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id/upcoming")({
  loader: async ({ params: { id }, context: { trpc, queryClient } }) => {
    const ingredientsQuery = await queryClient.ensureQueryData(
      trpc.restaurant.getAllReservations.queryOptions({
        restaurantId: id,
        startTime: new Date(0),
        endTime: new Date(3000, 0, 0),
      }),
    );

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const reservationsQuery = await queryClient.ensureQueryData(
      trpc.reservation.getInDateRange.queryOptions({
        restaurantId: id,
        startTime: today,
        endTime: nextWeek,
      }),
    );

    return {
      ingredients: ingredientsQuery,
      reservations: reservationsQuery,
    };
  },
  component: UpcomingDashboard,
});
