import {
  ingredient,
  menu,
  menuItem,
  menuItemIngredient,
  menuItemToMenu,
} from "@/server/db/schema";
import { router } from "../trpc-config";
import { and, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import type { DbType } from "@/server/db";
import { logger } from "@/lib/logger";

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
  time: Date;
}

export const getRestaurantMenus = async (
  db: DbType,
  options: GetRestaurantMenuOptions,
) => {
  const targetTime = sql`make_time(${options.time.getHours()}, ${options.time.getMinutes()}, 0)`;
  logger.trace(
    `getRestaurantMenus target time: ${options.time.getHours()}:${options.time.getMinutes()}`,
  );

  const records = await db
    .select({
      menuId: menu.id,
      menuName: menu.name,
      items: sql<
        {
          id: string;
          name: string;
          description: string;
          price: number;
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
        or(
          and(gte(targetTime, menu.startTime), lte(targetTime, menu.endTime)),
          and(isNull(menu.startTime), isNull(menu.endTime)),
        ),
      ),
    )
    .innerJoin(menuItemToMenu, eq(menuItemToMenu.menuId, menu.id))
    .innerJoin(menuItem, eq(menuItem.id, menuItemToMenu.menuItemId))
    .groupBy(menu.id);

  return records;
};

export const menuRouter = router({});
