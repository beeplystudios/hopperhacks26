import { useTRPC } from "@/lib/trpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";

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
