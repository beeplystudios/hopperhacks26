import {
  ingredient,
  menu,
  menuItem,
  menuItemIngredient,
  menuItemToMenu,
} from "@/server/db/schema";
import { router } from "../trpc-config";
import { eq } from "drizzle-orm";
import type { DbType } from "@/server/db";

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

export const getRestaurantMenus = async (db: DbType, restaurantId: string) => {
  const records = await db
    .select({
      menuId: menu.id,
      menuName: menu.name,
    })
    .from(menu)
    .where(eq(menu.restaurantId, restaurantId))
    .innerJoin(menuItemToMenu, eq(menuItemToMenu.menuId, menu.id));

  return records;
};

export const menuRouter = router({});
