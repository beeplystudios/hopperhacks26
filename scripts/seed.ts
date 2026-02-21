import { spanned } from "@/lib/logger";
import { db } from "../src/server/db";
import {
  menu,
  menuItem,
  menuItemToMenu,
  restaurant,
  table,
} from "@/server/db/schema";
import data from "./restaurants.json";

const logger = spanned("seed");
logger.info("seeding database...");

const startTime = Date.now();

await db.transaction(async (tx) => {
  await tx
    .insert(restaurant)
    .values(data.restaurant.map((r) => ({ id: r.id, name: r.name })))
    .onConflictDoNothing();
  logger.trace(`seeded ${data.restaurant.length} restaurants`);

  await tx
    .insert(menu)
    .values(
      data.menu.map((m) => ({
        id: m.id,
        name: m.name,
        restaurantId: m.restaurantId,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${data.menu.length} menu items`);

  await tx
    .insert(menuItem)
    .values(
      data.menuItem.map((mi) => ({
        id: mi.id,
        name: mi.name,
        price: mi.price,
        description: mi.description,
        image: mi.image,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${data.menuItem.length} menu items`);

  await tx
    .insert(menuItemToMenu)
    .values(
      data.menuItemToMenu.map((mim) => ({
        menuId: mim.menuId,
        menuItemId: mim.menuItemId,
      })),
    )
    .onConflictDoNothing();
  logger.trace(
    `seeded ${data.menuItemToMenu.length} menu item to menu relations`,
  );

  await tx
    .insert(table)
    .values(
      data.table.map((t) => ({
        id: t.id,
        name: t.name,
        maxSeats: t.maxSeats,
        restaurantId: t.restaurantId,
        maxReservationLength: t.maxReservationLength,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${data.table.length} tables`);
});

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);
logger.info(`finished seeding database in ${duration} seconds`);

db.$client.end();
