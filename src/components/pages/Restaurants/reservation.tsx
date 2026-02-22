import { button, Button } from "@/components/ui/button";
import { CalendarIcon, UsersIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useTRPC } from "@/lib/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { motion } from "motion/react";

const categories = [
  "Appetizers",
  "Soups",
  "Noodles",
  "Rice",
  "Meat",
  "Fish",
  "Grill",
  "Grill",
  "Grill",
  "Grill",
  "Grill",
  "Beverages",
  "Desserts",
];

export default function ReservationPage() {
  const param = useParams({ from: "/restaurants/$id/reserve/$reservationId" });

  const trpc = useTRPC();
  const restaurant = useSuspenseQuery(
    trpc.restaurant.getById.queryOptions({ restaurantId: param.id }),
  );

  const reservation = useSuspenseQuery(
    trpc.reservation.getById.queryOptions({
      reservationId: param.reservationId,
    }),
  );

  return (
    <div className="absolute top-1/12 left-1/2 -translate-x-1/2 w-3/4 lg:w-3/5 flex flex-col gap-4">
      <motion.div
        layoutId="restaurant-heading"
        className="bg-white shadow-xs rounded-md border-zinc-300/70 border-[0.0125rem] p-8"
      >
        <div>
          <h1 className="text-xl font-semibold">{restaurant.data.name}</h1>
          <p className="text-sm text-zinc-700">{restaurant.data.address}</p>
        </div>
        <div className="flex gap-2 my-2">
          <div
            className={cn(
              button({
                variant: "outline",
                fullWidth: true,
                isCircular: false,
              }),
              "h-12 active:scale-100 hover:border-zinc-300/70",
            )}
          >
            <CalendarIcon className="absolute top-1/2 -translate-y-1/2 left-2" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2">
              <p className="text-xs text-start text-zinc-500">Date</p>
              <p>
                {" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(reservation.data.startTime)}
              </p>
            </div>
          </div>
          <div
            className={cn(
              button({
                variant: "outline",
                fullWidth: true,
                isCircular: false,
              }),
              "h-12 active:scale-100 hover:border-zinc-300/70",
            )}
          >
            <UsersIcon className="absolute top-1/2 -translate-y-1/2 left-2" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2">
              <p className="text-xs text-start text-zinc-500">Guests</p>
              <p>{reservation.data.numberOfSeats} Guests</p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, ease: "easeOut" }}
        className="bg-white shadow-xs rounded-md border-zinc-300/70 border-[0.0125rem] p-8"
      >
        <div className="flex items-center justify-between">
          <p className="font-medium text-xl">Menu</p>
          <Input placeholder="Search..." />
        </div>
        <div className="flex gap-4 justify-between mt-2 overflow-x-auto py-2">
          {categories.map((category, idx) => (
            <Link
              to="/restaurants/$id/reserve/$reservationId"
              from="/restaurants/$id/reserve/$reservationId"
              hashScrollIntoView={{ behavior: "smooth" }}
              hash={category}
              key={idx}
              className="text-sm text-zinc-700 font-medium hover:underline"
            >
              {category}
            </Link>
          ))}
        </div>
        <div className="my-4 flex flex-col gap-2">
          <p className="font-medium">Appetizers</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex gap-4 items-center border-zinc-300/70 rounded-md border-[0.0125rem]">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuVKl1mUH_ydB5c0ayg8E98Z_jtA5DHC5XHL9Lni8S_T6zgzduTPuVDyceDlB7jW0jiiIVCnYiKk7O6CpwlZKfVG3L4je-MeexRWzLCbyTQMKclmwAaA&s=10&ec=121532756"
                alt=""
                className="max-w-32 h-full object-cover rounded-md"
              />
              <div className="p-2">
                <p className="font-medium">Vegetable Samosa</p>
                <p className="text-xs">$3.50</p>
                <p className="text-sm text-neutral-700">
                  Spiced potatoes and vegetables filling in a savory deep fried
                  pastry
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center border-zinc-300/70 rounded-md border-[0.0125rem]">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuVKl1mUH_ydB5c0ayg8E98Z_jtA5DHC5XHL9Lni8S_T6zgzduTPuVDyceDlB7jW0jiiIVCnYiKk7O6CpwlZKfVG3L4je-MeexRWzLCbyTQMKclmwAaA&s=10&ec=121532756"
                alt=""
                className="max-w-32 h-full object-cover rounded-md"
              />
              <div className="p-2">
                <p className="font-medium">Vegetable Samosa</p>
                <p className="text-xs">$3.50</p>
                <p className="text-sm text-neutral-700">
                  Spiced potatoes and vegetables filling in a savory deep fried
                  pastry
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
