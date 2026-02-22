import { useTRPC } from "@/lib/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/restaurants/$id")({
  loader: async ({ context, params }) =>
    context.queryClient.ensureQueryData(
      context.trpc.restaurant.getById.queryOptions({
        restaurantId: params.id,
      }),
    ),
  component: RouteComponent,
});

function RouteComponent() {
  const param = useParams({ from: "/restaurants/$id" });

  const trpc = useTRPC();
  const restaurant = useSuspenseQuery(
    trpc.restaurant.getById.queryOptions({ restaurantId: param.id }),
  );

  useEffect(() => {
    const color = restaurant.data.color ?? "0.648 0.2 131.684";
    const [l, c, h] = color.split(" ").map(Number.parseFloat);

    document.documentElement.style.setProperty(
      "--light-restaurant-color",
      `oklch(${l + 0.45} ${c} ${h})`,
    );
    document.documentElement.style.setProperty(
      "--base-restaurant-color",
      `oklch(${l} ${c} ${h})`,
    );
    document.documentElement.style.setProperty(
      "--hover-restaurant-color",
      `oklch(${l + 0.1} ${c} ${h})`,
    );
  }, [restaurant.data]);

  return (
    <div>
      <img
        src={restaurant.data.bannerImage!}
        alt=""
        className="h-[50vh] w-screen object-cover"
      />

      <Outlet />
    </div>
  );
}
