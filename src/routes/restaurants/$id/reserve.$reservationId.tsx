import ReservationPage from "@/components/pages/Restaurants/reservation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/restaurants/$id/reserve/$reservationId")(
  {
    loader: async ({ context, params }) =>
      context.queryClient.ensureQueryData(
        context.trpc.reservation.getById.queryOptions({
          reservationId: params.reservationId,
        }),
      ),
    component: RouteComponent,
  },
);

function RouteComponent() {
  return <ReservationPage />;
}
