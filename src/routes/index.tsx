import RestaurantCard from "@/components/pages/Restaurants/RestaurantCard";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, LogOutIcon } from "@/components/ui/icons";
import { MenuItem, SubmenuItem } from "@/components/ui/menu-item";
import { ModalPopover } from "@/components/ui/modal-popover";
import { signInOptions, signOutOptions } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc-client";
import { TRPCRouter } from "@/server/trpc/routes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { inferRouterOutputs } from "@trpc/server";
import { useEffect, useState } from "react";
import { Menu, MenuSection, MenuTrigger } from "react-aria-components";
import { useGeolocated } from "react-geolocated";

export const Route = createFileRoute("/")({
  component: App,
});

const Navbar: React.FC = () => {
  const trpc = useTRPC();
  const user = useQuery(trpc.me.queryOptions());

  const signIn = useMutation(signInOptions);
  const signOut = useMutation(signOutOptions);

  return (
    <nav className="w-full flex items-center px-8 pt-2 pb-8">
      <h1 className="font-medium text-2xl">Restrauntzulsàveplated</h1>

      <div className="ml-auto">
        {user.data && (
          <div>
            <MenuTrigger>
              <Button>
                {user.data.name} <ChevronDownIcon />
              </Button>
              <ModalPopover
                popoverProps={{
                  placement: "bottom right",
                }}
              >
                <Menu className="focus:outline-none min-w-42">
                  <MenuItem
                    onAction={() => {
                      navigator.geolocation.getCurrentPosition(() => {});
                    }}
                  >
                    Enable Location Services
                  </MenuItem>
                  <MenuItem
                    onAction={() => {
                      signOut.mutate();
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </Menu>
              </ModalPopover>
            </MenuTrigger>
          </div>
        )}
        {user.status === "success" && !user.data && (
          <Button onClick={() => signIn.mutate()}>Sign In</Button>
        )}
      </div>
    </nav>
  );
};

function App() {
  const trpc = useTRPC();
  const user = useQuery(trpc.me.queryOptions());

  const signIn = useMutation(signInOptions);
  const signOut = useMutation(signOutOptions);
  const allRestaurantQuery = useQuery(trpc.restaurant.getAll.queryOptions());
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
      console.log("User coordinates:", coords.latitude, coords.longitude);
      console.log("Nearby restaurants:", nearbyRestaurantQuery.data);
    }
  }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

  return (
    <div className="text-center flex flex-col items-center w-full py-8">
      <Navbar />
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
      <RestaurantRow restaurants={allRestaurantQuery.data ?? []} />

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
