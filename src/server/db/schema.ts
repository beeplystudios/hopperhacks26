import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  real,
  time,
  integer,
  geometry,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),

    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),

    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ACTUAL DATA
export type ReservationStatus =
  | "PENDING"
  | "UNPAID"
  | "CONFIRMED"
  | "CANCELLED";

export const restaurant = pgTable("restaurant", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  name: text("name").notNull(),
  address: text("address").notNull(),
  location: geometry("location", { type: "point" }).notNull(),
  description: text("description"),
  color: text("color"),
  bannerImage: text("banner_image"),
  logoImage: text("logo_image"),
});

export const restaurantRelations = relations(restaurant, ({ many }) => ({
  menuItems: many(menuItem),
  reservations: many(reservation),
  tables: many(table),
}));

export const table = pgTable("table", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  name: text("name").notNull(),
  maxSeats: integer("max_seats").notNull(),
  restaurantId: text("restaurant_id")
    .notNull()
    .references(() => restaurant.id, { onDelete: "cascade" }),
  /**
   * The number of minutes that a reservation is made for.
   */
  maxReservationLength: integer("max_reservation_length").notNull(),
});

export const reservation = pgTable("reservation", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  restaurantId: text("restaurant_id")
    .notNull()
    .references(() => restaurant.id, { onDelete: "cascade" }),
  tableId: text("table_id")
    .notNull()
    .references(() => table.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<ReservationStatus>(),
  numberOfSeats: integer("number_of_seats").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
});

export const reservationRelations = relations(reservation, ({ one, many }) => ({
  restaurant: one(restaurant, {
    fields: [reservation.restaurantId],
    references: [restaurant.id],
  }),
  table: one(table, {
    fields: [reservation.tableId],
    references: [table.id],
  }),
  user: one(user, {
    fields: [reservation.userId],
    references: [user.id],
  }),
  orderItems: many(orderItem),
}));

/**
 * A restaurant can have multiple menus: "Lunch", "Dinner", "Drinks", etc.
 */
export const menu = pgTable("menu", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  restaurantId: text("restaurant_id")
    .notNull()
    .references(() => restaurant.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  /**
   * The time of day that the menu is available (TIME ONLY). For example, the "Lunch" menu can be
   * made available from 11:00:00 to 13:00:00.
   *
   * If neither are provided, it is assumed that the menu is available all day.
   */
  startTime: time("start_time"),
  endTime: time("end_time"),
});

export const menuRelations = relations(menu, ({ one, many }) => ({
  restaurant: one(restaurant, {
    fields: [menu.restaurantId],
    references: [restaurant.id],
  }),
  menuItems: many(menuItem),
}));

/**
 * A menu item can belong to multiple menus. For example, a "Diet Coke" menu item will likely appear
 * on both the "Lunch" and "Dinner" menus. This table represents the many-to-many relationship
 * between menu items and menus.
 */
export const menuItemToMenu = pgTable("menu_item_to_menu", {
  menuId: text("menu_id")
    .notNull()
    .references(() => menu.id, { onDelete: "cascade" }),
  menuItemId: text("menu_item_id")
    .notNull()
    .references(() => menuItem.id, { onDelete: "cascade" }),
});

export const menuItemToMenuRelations = relations(menuItemToMenu, ({ one }) => ({
  menu: one(menu, {
    fields: [menuItemToMenu.menuId],
    references: [menu.id],
  }),
  menuItem: one(menuItem, {
    fields: [menuItemToMenu.menuItemId],
    references: [menuItem.id],
  }),
}));

export const menuItem = pgTable("menu_item", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  name: text("name").notNull(),
  price: text("price").notNull(),
  description: text("description"),
  image: text("image"),
});

export const menuItemRelations = relations(menuItem, ({ many }) => ({
  ingredients: many(menuItemIngredient),
}));

export const ingredient = pgTable("ingredient", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  restaurant: text("restaurant_id")
    .notNull()
    .references(() => restaurant.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const ingredientRelations = relations(ingredient, ({ one, many }) => ({
  restaurant: one(restaurant, {
    fields: [ingredient.restaurant],
    references: [restaurant.id],
  }),
  menuItems: many(menuItemIngredient),
}));

export const menuItemIngredient = pgTable("menu_item_ingredient", {
  menuItemId: text("menu_item_id")
    .notNull()
    .references(() => menuItem.id, { onDelete: "cascade" }),
  ingredientId: text("ingredient_id")
    .notNull()
    .references(() => ingredient.id, { onDelete: "cascade" }),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(),
});

export const orderItem = pgTable("order_item", {
  reservation: text("reservation")
    .notNull()
    .references(() => reservation.id, { onDelete: "cascade" }),
  menuItem: text("menu_item")
    .notNull()
    .references(() => menuItem.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
});

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  reservation: one(reservation, {
    fields: [orderItem.reservation],
    references: [reservation.id],
  }),
  menuItem: one(menuItem, {
    fields: [orderItem.menuItem],
    references: [menuItem.id],
  }),
}));
