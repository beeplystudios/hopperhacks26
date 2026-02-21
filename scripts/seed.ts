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
import { inArray, sql } from "drizzle-orm";

const logger = spanned("seed");
logger.info("seeding database...");

const startTime = Date.now();

await db.execute(sql`CREATE EXTENSION IF NOT EXISTS postgis;`);

await db.transaction(async (tx) => {
  // delete records that are in the seed data but not in the database
  await tx.delete(menuItemToMenu).where(
    inArray(
      menuItemToMenu.menuId,
      data.menu.map((m) => m.id),
    ),
  );
  await tx.delete(menuItem).where(
    inArray(
      menuItem.id,
      data.menuItem.map((mi) => mi.id),
    ),
  );
  await tx.delete(menu).where(
    inArray(
      menu.id,
      data.menu.map((m) => m.id),
    ),
  );
  await tx.delete(table).where(
    inArray(
      table.id,
      data.table.map((t) => t.id),
    ),
  );
  await tx.delete(restaurant).where(
    inArray(
      restaurant.id,
      data.restaurant.map((r) => r.id),
    ),
  );
  logger.trace(`deleted records that are in the seed data`);

  await tx
    .insert(restaurant)
    .values(
      data.restaurant.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        location: sql.raw(`ST_Point(${r.location})`),
        description: r.description,
        color: r.color,
        bannerImage: r.bannerImage,
        logoImage: r.logoImage,
      })),
    )
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
