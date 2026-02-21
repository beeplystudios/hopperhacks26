import { desc, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  real,
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
  seatsPerNight: text("seats_per_night").notNull(),
});

export const restaurantRelations = relations(restaurant, ({ many }) => ({
  menuItems: many(menuItem),
  reservations: many(reservation),
}));

export const reservation = pgTable("reservation", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  restaurantId: text("restaurant_id")
    .notNull()
    .references(() => restaurant.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().$type<ReservationStatus>(),
  time: timestamp("time").notNull(),
  numberOfSeats: text("number_of_seats").notNull(),
});

export const reservationRelations = relations(reservation, ({ one, many }) => ({
  restaurant: one(restaurant, {
    fields: [reservation.restaurantId],
    references: [restaurant.id],
  }),
  user: one(user, {
    fields: [reservation.userId],
    references: [user.id],
  }),
  orderItems: many(orderItem),
}));

export const menuItem = pgTable("menu_item", {
  id: text("id")
    .primaryKey()
    .$default(() => createId()),
  restaurantId: text("restaurant_id")
    .notNull()
    .references(() => restaurant.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: text("price").notNull(),
  description: text("description"),
  image: text("image"),
});

export const menuItemRelations = relations(menuItem, ({ one, many }) => ({
  restaurant: one(restaurant, {
    fields: [menuItem.restaurantId],
    references: [restaurant.id],
  }),
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
  quantity: text("quantity").notNull(),
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
