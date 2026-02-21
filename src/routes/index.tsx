import RestaurantCard from "@/components/pages/Restaurants/RestaurantCard";
import { useTRPC } from "@/lib/trpc-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const trpc = useTRPC();
  const restrauntQuery = useQuery(trpc.restaurant.getAll.queryOptions());

  return (
    <div className="text-center flex flex-col items-center w-full py-8">
      <h2 className="text-6xl font-bold text-left w-full px-8">Welcome!</h2>
      <div className="flex items-center w-full px-6 overflow-scroll gap-4 py-6">
        {restrauntQuery.data?.map((r) => (
          <RestaurantCard
            key={r.id}
            title={r.name}
            description={r.description ?? ""}
            logo={r.logoImage}
            id={r.id}
          />
        ))}
      </div>
    </div>
  );
}
