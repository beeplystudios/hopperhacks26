import RestaurantCard from "@/components/pages/Restaurants/RestaurantCard";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockMicroIcon,
  LogOutIcon,
  MenuIcon,
  UsersIcon,
  UsersMicroIcon,
} from "@/components/ui/icons";
import { MenuItem, SubmenuItem } from "@/components/ui/menu-item";
import { ModalPopover } from "@/components/ui/modal-popover";
import { signInOptions, signOutOptions } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc-client";
import { TRPCRouter } from "@/server/trpc/routes";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { inferRouterOutputs } from "@trpc/server";
import { signOut } from "better-auth/api";
import { useEffect, useState } from "react";
import { Menu, MenuSection, MenuTrigger } from "react-aria-components";
import { useGeolocated } from "react-geolocated";
import { Drawer } from "vaul";

export const Route = createFileRoute("/")({
  component: App,
});

const SidebarMenu = () => {
  const trpc = useTRPC();
  const userQuery = useSuspenseQuery(trpc.me.queryOptions());

  const signOut = useMutation(signOutOptions);
  const [isOpen, setIsOpen] = useState(false);

  const reservations = useSuspenseQuery(
    trpc.reservation.getMine.queryOptions(),
  );

  if (!userQuery.data) throw new Error("Impossible state!");

  return (
    <Drawer.Root direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <Button size="icon" variant="ghost" onPress={() => setIsOpen(true)}>
        <MenuIcon />
      </Button>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/20 z-50" />
        <Drawer.Content
          className="right-0 top-0 bottom-0 fixed z-[1000] outline-none w-2/7 flex"
          // The gap between the edge of the screen and the drawer is 8px in this case.
          style={
            { "--initial-transform": "calc(100% + 8px)" } as React.CSSProperties
          }
        >
          <div className="bg-white text-black border-l-[0.0125rem] shadow-xs border-zinc-300/70 h-full w-full grow p-5 flex flex-col rounded-l-lg font-sans">
            <div className="max-w-md flex flex-col gap-4 h-full justify-between">
              <div className="flex items-center gap-3 pb-4 flex-1/12">
                <img
                  src={userQuery.data.image ?? ""}
                  className="rounded-full w-10"
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <div className="leading-4">
                  <p className="font-medium">{userQuery.data.name}</p>
                  <p className="text-zinc-700 text-sm">
                    {userQuery.data.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-11/12 overflow-y-auto">
                <p className="font-medium text-xl">Your Reservations</p>
                <div className="flex flex-col gap-4">
                  {reservations.data.map((reservation) => (
                    <Link
                      to="/restaurants/$id/reserve/$reservationId"
                      params={{
                        id: reservation.restaurantId,
                        reservationId: reservation.id,
                      }}
                      className="flex gap-2 items-center bg-zinc-50 border-[0.0125rem] border-zinc-300/70 rounded-lg group"
                    >
                      <img
                        src={reservation.logoImage ?? ""}
                        className="size-16 rounded-l-lg h-full object-cover"
                        alt=""
                      />
                      <div className="p-4">
                        <div className="flex gap-2 items-center">
                          <p className="text-lg font-medium">
                            {reservation.name}
                          </p>
                          <p className="text-xs">{reservation.status}</p>
                        </div>
                        <p className="text-xs text-neutral-700">
                          {reservation.address}
                        </p>
                        <div className="flex gap-4 my-1">
                          <div className="flex items-center text-xs gap-2 w-fit">
                            <UsersMicroIcon />
                            <p>
                              {reservation.numberOfSeats} Guest
                              {reservation.numberOfSeats === 1 ? "" : "s"}
                            </p>
                          </div>
                          <div className="flex items-center text-xs gap-2 w-fit">
                            <ClockMicroIcon />
                            <p>
                              {new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(reservation.startTime)}
                            </p>
                          </div>
                        </div>
                        {/* <p>{reservation.startTime.toTimeString()}</p> */}
                      </div>
                      <div className="invisible group-hover:visible">
                        <ChevronRightIcon />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex-1/12">
                <Button onPress={() => signOut.mutate()} fullWidth>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

const Navbar: React.FC = () => {
  const trpc = useTRPC();
  const user = useQuery(trpc.me.queryOptions());

  const signIn = useMutation(signInOptions);
  const signOut = useMutation(signOutOptions);

  return (
    <nav className="w-full flex items-center px-8 pt-2 pb-8">
      <h1 className="font-medium text-2xl">Restrauntzulsàveplated</h1>

      <div className="ml-auto">
        {user.data && <SidebarMenu />}
        {/* {user.data && (
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
        )} */}
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
