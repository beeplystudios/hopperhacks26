import UpcomingDashboard from "@/components/pages/Manage/Upcoming";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/$id/upcoming")({
  loader: ({ params: { id }, context: { trpc, queryClient } }) =>
    queryClient.ensureQueryData(
      trpc.restaurant.getAllReservations.queryOptions({
        restaurantId: id,
        startTime: new Date(0),
        endTime: new Date(3000, 0, 0),
      }),
    ),
  component: UpcomingDashboard,
});
