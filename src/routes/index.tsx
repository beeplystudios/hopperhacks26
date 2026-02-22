import { Navbar } from "@/components/pages/navbar";
import RestaurantCard from "@/components/pages/Restaurants/RestaurantCard";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/lib/trpc-client";
import { TRPCRouter } from "@/server/trpc/routes";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { inferRouterOutputs } from "@trpc/server";
import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import { useDebounceValue } from "usehooks-ts";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const trpc = useTRPC();

  const [debouncedQuery, setDebouncedQuery] = useDebounceValue("", 500, {
    trailing: true,
  });

  const allRestaurantQuery = useQuery(
    trpc.restaurant.getAll.queryOptions({ query: debouncedQuery }),
  );
  const pastRestaurantQuery = useQuery(
    trpc.restaurant.getPastRestraunts.queryOptions(),
  );

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  const [userCoords, setUserCoords] = useState({ lat: 0, lng: 0 });

  const nearbyRestaurantQuery = useQuery(
    trpc.restaurant.getNearby.queryOptions(userCoords),
  );

  useEffect(() => {
    if (isGeolocationAvailable && isGeolocationEnabled && coords) {
      setUserCoords({ lat: coords.latitude, lng: coords.longitude });
      nearbyRestaurantQuery.refetch();
    }
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  return (
    <>
      <Navbar />
      <div className="text-center flex flex-col items-center w-full py-4 pt-16">
        <h2 className="text-6xl font-bold text-left w-full px-8">Welcome!</h2>

        {(pastRestaurantQuery.data?.length ?? 0) > 0 && (
          <>
            <p className="text-left w-full">Visit Again</p>
            <RestaurantRow restaurants={pastRestaurantQuery.data ?? []} />
          </>
        )}

        {(nearbyRestaurantQuery.data?.length ?? 0) > 0 && (
          <>
            <p className="text-left w-full">Places Near You</p>
            <RestaurantRow restaurants={nearbyRestaurantQuery.data ?? []} />
          </>
        )}

        <p className="text-left w-full">Explore All</p>
        <Input
          className="max-w-sm mb-4"
          placeholder="Search..."
          onChange={(e) => setDebouncedQuery(e.target.value)}
        />
        <RestaurantRow restaurants={allRestaurantQuery.data ?? []} />
      </div>
    </>
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
