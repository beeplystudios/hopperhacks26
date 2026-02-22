import { db } from "@/server/db";
import {
  ingredient,
  menu,
  menuItem,
  menuItemIngredient,
  menuItemToMenu,
  restaurant,
} from "@/server/db/schema";
import {
  getRestaurantIngredients,
  getRestaurantMenus,
} from "@/server/trpc/routes/menu";
import { eq } from "drizzle-orm";
// import { aggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurant } from "@/server/trpc/routes/restaurant";

// aggregateAllReservationsByIngredientsAndBucketsOfTimeForRestaurant({
//   restaurantId: "r-katz",
//   startTime: new Date("2024-01-01T00:00:00.000Z"),
//   endTime: new Date("2026-12-31T23:59:59.999Z"),
// }).then((res) => {
//   console.log(
//     "aggregated reservations by ingredients and buckets of time for restaurant:",
//     res,
//   );
//   process.exit(0);
// });

const time = new Date();
time.setHours(14);

getRestaurantMenus(db, {
  restaurantId: "r-blueribbon",
  time,
}).then((res) => {
  console.log(res);
  process.exit(0);
});
