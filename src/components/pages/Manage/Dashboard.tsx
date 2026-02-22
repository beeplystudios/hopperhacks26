import { Route as DashboardRoute } from "@/routes/manage.$id/index";
import { DishesOverTimeChart } from "./charts/dishes-over-time";
import { ReservationCapacityChart } from "./charts/reservation-capacity";
import Reservations from "./shared/reservations";

export default function ManageDashboard() {
  const { dishesOverTime, restaurant, restaurantCapacity, reservations } =
    DashboardRoute.useLoaderData();
  return (
    <div className="grid grid-cols-5 w-full h-full grid-rows-2 gap-8">
      <div className="col-span-3 flex flex-col items-center justify-start gap-4 rounded-xl p-4 border-zinc-300/50 border-[0.0125rem]">
        <h3 className="font-bold text-xl">Pre-Ordered Dishes</h3>
        <DishesOverTimeChart
          data={dishesOverTime}
          startTime={restaurant.openTime}
          endTime={restaurant.closeTime}
        />
      </div>
      <div className="col-span-2 flex flex-col items-center justify-start gap-4 rounded-xl p-4 border-zinc-300/50 border-[0.0125rem]">
        <h3 className="font-bold text-xl">Reservation Capacity</h3>
        <ReservationCapacityChart
          capacity={restaurantCapacity.capacity}
          seatsFilled={restaurantCapacity.seatsFilled}
        />
      </div>

      <div className="col-span-full h-full">
        <h1 className="text-2xl">Today's Reservations</h1>
        <Reservations reservations={reservations} />
      </div>
    </div>
  );
}
