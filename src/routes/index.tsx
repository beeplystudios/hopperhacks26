import RestaurantCard from "@/components/pages/Restaurants/RestaurantCard";
import { signInOptions, signOutOptions } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc-client";
import { TRPCRouter } from "@/server/trpc/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { inferRouterOutputs } from "@trpc/server";
import { signInSocial, signOut } from "better-auth/api";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const trpc = useTRPC();
  const user = useQuery(trpc.me.queryOptions());

  const signIn = useMutation(signInOptions);
  const signOut = useMutation(signOutOptions);
  const restrauntQuery = useQuery(trpc.restaurant.getAll.queryOptions());

  return (
    <div className="text-center flex flex-col items-center w-full py-8">
      <h2 className="text-6xl font-bold text-left w-full px-8">Welcome!</h2>

      <p className="text-left">Order Again</p>
      <RestaurantRow restaurants={restrauntQuery.data ?? []} />

      <p className="text-left"></p>
      <RestaurantRow restaurants={restrauntQuery.data ?? []} />

      <p className="text-left">Explore All</p>
      <RestaurantRow restaurants={restrauntQuery.data ?? []} />

      <button onClick={() => signIn.mutate()}>Sign In</button>
      <p>{JSON.stringify(user.data)}</p>
      <button onClick={() => signOut.mutate()}>Sign Out</button>
    </div>
  );
}

const RestaurantRow: React.FC<{
  restaurants: inferRouterOutputs<TRPCRouter>["restaurant"]["getAll"];
}> = ({ restaurants }) => (
  <div className="flex items-center w-full px-6 overflow-scroll gap-4 py-6">
    {restaurants.map((r) => (
      <RestaurantCard
        key={r.id}
        title={r.name}
        description={r.description ?? ""}
        logo={r.logoImage}
        id={r.id}
      />
    ))}
  </div>
);
