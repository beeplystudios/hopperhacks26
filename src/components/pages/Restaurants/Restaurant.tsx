import { useTRPC } from "@/lib/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export default function Restaurant() {
  const trpc = useTRPC();
  const date = useMemo(() => new Date(), []);
  const restrauntQuery = useQuery(
    trpc.reservation.getAvailableTimes.queryOptions({
      date: date,
      partySize: 1,
      restaurantId: "r-katz",
    }),
  );

  console.log(restrauntQuery.data);

  return <p>Restaurant</p>;
}
