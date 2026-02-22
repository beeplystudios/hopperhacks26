import RestaurantCard from "@/components/pages/Restaurants/RestaurantCard";
import { signInOptions, signOutOptions } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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

      <button onClick={() => signIn.mutate()}>Sign In</button>
      <p>{JSON.stringify(user.data)}</p>
      <button onClick={() => signOut.mutate()}>Sign Out</button>
    </div>
  );
}

// const RestaurantRow = (restaurants: )
