import { spanned } from "@/lib/logger";
import { db } from "../src/server/db";
import {
  ingredient,
  menu,
  menuItem,
  menuItemIngredient,
  menuItemToMenu,
  orderItem,
  reservation,
  restaurant,
  table,
  user,
} from "@/server/db/schema";
import seedRestaurants from "./restaurants.json";
import {
  reservation as seedReservations,
  users as seedUsers,
  orderItems as seedOrderItems,
} from "./reservations.json";
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
      seedRestaurants.menu.map((m) => m.id),
    ),
  );
  await tx.delete(menuItem).where(
    inArray(
      menuItem.id,
      seedRestaurants.menuItem.map((mi) => mi.id),
    ),
  );
  await tx.delete(menu).where(
    inArray(
      menu.id,
      seedRestaurants.menu.map((m) => m.id),
    ),
  );
  await tx.delete(table).where(
    inArray(
      table.id,
      seedRestaurants.table.map((t) => t.id),
    ),
  );
  await tx.delete(restaurant).where(
    inArray(
      restaurant.id,
      seedRestaurants.restaurant.map((r) => r.id),
    ),
  );
  await tx.delete(reservation).where(
    inArray(
      reservation.restaurantId,
      seedRestaurants.restaurant.map((r) => r.id),
    ),
  );
  await tx.delete(user).where(
    inArray(
      user.id,
      seedReservations.map((r) => r.userId),
    ),
  );
  await tx.delete(orderItem).where(
    inArray(
      orderItem.reservation,
      seedReservations.map((r) => r.id),
    ),
  );
  logger.trace(`deleted records that are in the seed data`);

  await tx
    .insert(restaurant)
    .values(
      seedRestaurants.restaurant.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        location: sql.raw(`ST_Point(${r.location})`),
        description: r.description,
        color: r.color,
        bannerImage: r.bannerImage,
        logoImage: r.logoImage,
        openTime: r.openTime,
        closeTime: r.closeTime,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedRestaurants.restaurant.length} restaurants`);

  await tx
    .insert(menu)
    .values(
      seedRestaurants.menu.map((m) => ({
        id: m.id,
        name: m.name,
        restaurantId: m.restaurantId,
        startTime: m.startTime,
        endTime: m.endTime,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedRestaurants.menu.length} menu items`);

  await tx
    .insert(menuItem)
    .values(
      seedRestaurants.menuItem.map((mi) => ({
        id: mi.id,
        name: mi.name,
        price: mi.price,
        description: mi.description,
        image: mi.image,
        menuId: mi.menuId,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedRestaurants.menuItem.length} menu items`);

  await tx
    .insert(ingredient)
    .values(
      seedRestaurants.ingredient.map((i) => ({
        id: i.id,
        name: i.name,
        restaurant: i.restaurant,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedRestaurants.ingredient.length} ingredients`);

  await tx
    .insert(menuItemIngredient)
    .values(
      seedRestaurants.menuItemIngredient.map((mii) => ({
        menuItemId: mii.menuItemId,
        ingredientId: mii.ingredientId,
        quantity: mii.quantity,
        unit: mii.unit,
      })),
    )
    .onConflictDoNothing();
  logger.trace(
    `seeded ${seedRestaurants.menuItemIngredient.length} menu item ingredients`,
  );

  await tx
    .insert(menuItemToMenu)
    .values(
      seedRestaurants.menuItemToMenu.map((mim) => ({
        menuId: mim.menuId,
        menuItemId: mim.menuItemId,
      })),
    )
    .onConflictDoNothing();
  logger.trace(
    `seeded ${seedRestaurants.menuItemToMenu.length} menu item to menu relations`,
  );

  await tx
    .insert(table)
    .values(
      seedRestaurants.table.map((t) => ({
        id: t.id,
        name: t.name,
        maxSeats: t.maxSeats,
        restaurantId: t.restaurantId,
        maxReservationLength: t.maxReservationLength,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedRestaurants.table.length} tables`);

  await tx
    .insert(user)
    .values(
      seedUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedReservations.length} users`);

  await tx
    .insert(reservation)
    .values(
      seedReservations.map((r) => ({
        id: r.id,
        restaurantId: r.restaurantId,
        tableId: r.tableId,
        userId: r.userId,
        startTime: new Date(r.startTime),
        endTime: new Date(r.endTime),
        status: r.status as any,
        numberOfSeats: r.numberOfSeats,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedReservations.length} reservations`);

  await tx
    .insert(orderItem)
    .values(
      seedOrderItems.map((oi) => ({
        id: oi.id,
        reservation: oi.reservation,
        menuItem: oi.menuItem,
        quantity: oi.quantity,
      })),
    )
    .onConflictDoNothing();
  logger.trace(`seeded ${seedOrderItems.length} order items`);
});

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);
logger.info(`finished seeding database in ${duration} seconds`);

db.$client.end();
