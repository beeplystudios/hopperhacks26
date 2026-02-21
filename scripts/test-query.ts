import { aggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurant } from "@/server/trpc/routes/restaurant";

aggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurant(
  "r-katz",
).then((res) => {
  console.log(
    "aggregated reservations by ingredients and buckets of time for restaurant:",
    res,
  );
  process.exit(0);
});
