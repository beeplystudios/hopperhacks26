import { useTRPC } from "@/lib/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

// HH:MM:SS -> HH:MM am/pm
const formatPsqlTime = (time: string) => {
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12; // Convert to 12-hour format
  return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

/**
 * Create menus for time periods, configure menu items, add ingredients to menu items
 */
export default function ManageMenus() {
  const params = useParams({ from: "/manage/$id/menus" });
  const trpc = useTRPC();
  const menusQuery = useSuspenseQuery(
    trpc.menu.getAllMenus.queryOptions({ restaurantId: params.id }),
  );
  const menus = menusQuery.data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Menus</h1>
      {menus.length === 0 ? (
        <p>No menus found. Create a menu to get started.</p>
      ) : (
        <ul className="space-y-4">
          {menus.map((menu) => (
            <li key={menu.menuId} className="border p-4 rounded">
              <h2 className="text-xl font-semibold">{menu.name}</h2>
              {menu.startTime && menu.endTime ? (
                <p>
                  Available from {formatPsqlTime(menu.startTime)} to{" "}
                  {formatPsqlTime(menu.endTime)}
                </p>
              ) : (
                <p>Available all day</p>
              )}
              <h3 className="font-semibold mt-2">Menu Items:</h3>
              {menu.items.length === 0 ? (
                <p>No items in this menu.</p>
              ) : (
                <ul className="list-disc list-inside">
                  {menu.items.map((item) => (
                    <li key={item.id}>
                      <p className="font-medium">{item.name}</p>
                      <p>{item.description}</p>
                      <p>${item.price}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
