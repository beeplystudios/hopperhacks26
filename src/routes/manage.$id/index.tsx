import { createFileRoute } from "@tanstack/react-router";
import ManageDashboard from "@/components/pages/Manage/Dashboard";

export const Route = createFileRoute("/manage/$id/")({
  loader: ({ params: { id }, context: { trpc, queryClient } }) =>
    queryClient.ensureQueryData(
      trpc.restaurant.getAllReservations.queryOptions({
        restaurantId: id,
        startTime: new Date(0),
        endTime: new Date(3000, 0, 0),
      }),
    ),
  component: ManageDashboard,
});
