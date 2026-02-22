import { button, Button } from "@/components/ui/button";
import { CalendarIcon, UsersIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useTRPC } from "@/lib/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { motion } from "motion/react";

export default function ReservationPage() {
  const param = useParams({ from: "/restaurants/$id" });

  const trpc = useTRPC();
  const restaurant = useSuspenseQuery(
    trpc.restaurant.getById.queryOptions({ restaurantId: param.id }),
  );

  return (
    <div className="absolute top-1/12 left-1/2 -translate-x-1/2 w-3/4  lg:w-1/2 flex flex-col gap-4">
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
              <p>Feb 21, 2026</p>
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
              <p>4 Guests</p>
            </div>
          </div>
        </div>
      </motion.div>
      <div></div>
    </div>
  );
}
