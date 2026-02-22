import {
  ingredient,
  menu,
  menuItem,
  menuItemIngredient,
  menuItemToMenu,
  orderItem,
} from "@/server/db/schema";
import { publicProcedure, router } from "../trpc-config";
import { and, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import type { DbType } from "@/server/db";
import {
  authedProcedure,
  restaurantOwnerProcedure,
} from "../middleware/auth-middleware";
import z from "zod";

export const getRestaurantIngredients = async (
  db: DbType,
  restaurantId: string,
) => {
  const menuItems = await db
    .select({
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
    })
    .from(ingredient)
    .innerJoin(
      menuItemIngredient,
      eq(ingredient.id, menuItemIngredient.ingredientId),
    )
    .innerJoin(menuItem, eq(menuItemIngredient.menuItemId, menuItem.id))
    .innerJoin(menuItemToMenu, eq(menuItemToMenu.menuItemId, menuItem.id))
    .innerJoin(menu, eq(menu.id, menuItemToMenu.menuId))
    .where(eq(menu.restaurantId, restaurantId));

  return menuItems;
};

interface GetRestaurantMenuOptions {
  restaurantId: string;
  /**
   * Get which menus are active at a given time. Note that only the "hour" and "minute" of this time
   * is considered.
   */
  time?: Date;
}

export const getRestaurantMenus = async (
  db: DbType,
  options: GetRestaurantMenuOptions,
) => {
  const targetTime = options.time
    ? sql`make_time(${options.time.getHours()}, ${options.time.getMinutes()}, 0)`
    : null;

  const records = await db
    .select({
      menuId: menu.id,
      menuName: menu.name,
      startTime: menu.startTime,
      endTime: menu.endTime,
      name: menu.name,
      items: sql<
        {
          id: string;
          name: string;
          description: string;
          price: string;
        }[]
      >`jsonb_agg(
        jsonb_build_object(
          'id', ${menuItem.id},
          'name', ${menuItem.name},
          'description', ${menuItem.description},
          'price', ${menuItem.price},
          'image', CASE WHEN ${menuItem.image} IS NULL THEN NULL ELSE ${menuItem.image} END
        )
      )`.as("items"),
    })
    .from(menu)
    .where(
      and(
        eq(menu.restaurantId, options.restaurantId),
        // TODO: if we want to support menus across different time zones, the time conversion logic
        // would go here.
        targetTime === null
          ? sql`true`
          : or(
              and(
                gte(targetTime, menu.startTime),
                lte(targetTime, menu.endTime),
              ),
              and(isNull(menu.startTime), isNull(menu.endTime)),
            ),
      ),
    )
    .innerJoin(menuItemToMenu, eq(menuItemToMenu.menuId, menu.id))
    .innerJoin(menuItem, eq(menuItem.id, menuItemToMenu.menuItemId))
    .groupBy(menu.id);

  return records;
};

export const menuRouter = router({
  getIngredients: restaurantOwnerProcedure.query(async ({ ctx, input }) => {
    const ingredients = await getRestaurantIngredients(
      ctx.db,
      input.restaurantId,
    );
    return ingredients;
  }),

  getCurrentMenus: publicProcedure
    .input(z.object({ restaurantId: z.string(), date: z.date().optional() }))
    .query(async ({ ctx, input }) => {
      const menus = await getRestaurantMenus(ctx.db, {
        restaurantId: input.restaurantId,
        time: input.date ?? new Date(),
      });

      return menus;
    }),

  getReservationMenus: authedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        reservationId: z.string(),
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const menus = await getRestaurantMenus(ctx.db, {
        restaurantId: input.restaurantId,
        time: input.date ?? new Date(),
      });

      const orderItems = await ctx.db
        .select()
        .from(orderItem)
        .where(eq(orderItem.reservation, input.reservationId));

      const orderMap = new Map(
        orderItems.map((item) => [item.menuItem, item.quantity]),
      );

      return menus.map((menu) => ({
        ...menu,
        items: menu.items.map((item) => ({
          ...item,
          quantity: orderMap.get(item.id),
        })),
      }));
    }),

  getAllMenus: restaurantOwnerProcedure.query(async ({ ctx, input }) => {
    const menus = await getRestaurantMenus(ctx.db, {
      restaurantId: input.restaurantId,
    });

    return menus;
  }),
});
