import ReservationPage from "@/components/pages/Restaurants/reservation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/restaurants/$id/reserve/$reservationId")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  return <ReservationPage />;
}
