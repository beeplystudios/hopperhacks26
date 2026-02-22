import { formatPsqlTime } from "@/lib/parse-time";
import { useTRPC } from "@/lib/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

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
      {menus.length === 0 ? (
        <p>No menus found. Create a menu to get started.</p>
      ) : (
        <div className="grid grid-cols-2 w-full h-full gap-8">
          {menus.map((menu) => (
            <div className="flex flex-col items-start justify-start gap-6 rounded-xl py-6 px-8 border-zinc-300/50 border-[0.0125rem]">
              <h2 className="text-xl font-semibold">{menu.name}</h2>
              {menu.startTime && menu.endTime ? (
                <p>
                  Available from {formatPsqlTime(menu.startTime)} to{" "}
                  {formatPsqlTime(menu.endTime)}
                </p>
              ) : (
                <p>Available all day</p>
              )}
              {menu.items.length === 0 ? (
                <p>No items in this menu.</p>
              ) : (
                <ul className="space-y-4">
                  {menu.items.map((item) => (
                    <li key={item.id} className="">
                      <p className="font-semibold">{item.name}</p>
                      <p>{item.description}</p>
                      <p>${item.price}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
