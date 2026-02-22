import { button, Button } from "@/components/ui/button";
import { CalendarIcon, PlusMicroIcon, UsersIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalHeading,
} from "@/components/ui/modal";
import { cn } from "@/lib/cn";
import { useTRPC } from "@/lib/trpc-client";
import {
  useMutation,
  useQueries,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { motion } from "motion/react";
import { DialogTrigger } from "react-aria-components";

const categories = [
  "Appetizers",
  "Soups",
  "Noodles",
  "Rice",
  "Meat",
  "Fish",
  "Grill",
  "Grill",
  "Grill",
  "Grill",
  "Grill",
  "Beverages",
  "Desserts",
];

export default function ReservationPage() {
  const param = useParams({
    from: "/_navlayout/restaurants/$id/reserve/$reservationId",
  });

  const trpc = useTRPC();
  const restaurant = useSuspenseQuery(
    trpc.restaurant.getById.queryOptions({ restaurantId: param.id }),
  );

  const reservation = useSuspenseQuery(
    trpc.reservation.getById.queryOptions({
      reservationId: param.reservationId,
    }),
  );

  const menus = useSuspenseQuery(
    trpc.menu.getReservationMenus.queryOptions({
      restaurantId: param.id,
      reservationId: param.reservationId,
      date: reservation.data.startTime,
    }),
  );

  const addMenuItem = useMutation(
    trpc.reservation.addMenuItem.mutationOptions({
      onSuccess(_, __, ___, context) {
        context.client.invalidateQueries({
          queryKey: trpc.menu.getReservationMenus.queryKey(),
        });
      },
    }),
  );

  const removeMenuItem = useMutation(
    trpc.reservation.removeMenuItem.mutationOptions({
      onSuccess(_, __, ___, context) {
        return context.client.invalidateQueries({
          queryKey: trpc.menu.pathKey(),
        });
      },
    }),
  );

  const orderItems = useQuery(
    trpc.reservation.getOrderItems.queryOptions({
      reservationId: param.reservationId,
    }),
  );

  const confirmReservation = useMutation(
    trpc.reservation.confirmReservation.mutationOptions({
      onSuccess(_, __, ___, context) {
        return context.client.invalidateQueries({
          queryKey: trpc.menu.pathKey(),
        });
      },
    }),
  );

  return (
    <div className="absolute top-1/8 left-1/2 -translate-x-1/2 w-3/4 lg:w-3/5 flex flex-col gap-4">
      <motion.div
        layoutId="restaurant-heading"
        className="bg-white shadow-xs rounded-md border-zinc-300/70 border-[0.0125rem] p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{restaurant.data.name}</h1>
            <p className="text-sm text-zinc-700">{restaurant.data.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium bg-zinc-50 p-2 rounded-full border-[0.0125rem] border-zinc-300/70">
              {reservation.data.status}
            </p>
            {reservation.data.status === "PENDING" && (
              <DialogTrigger>
                <Button variant="brand">Checkout</Button>
                <Modal>
                  <ModalBody>
                    <ModalHeader>
                      <ModalHeading>Confirm your Reservation</ModalHeading>
                      <ModalDescription>
                        You will be for the following amount listed below +
                        taxes and fees. A hold will be placed on your card until
                        your meal is completed.
                      </ModalDescription>
                    </ModalHeader>
                    {orderItems.data &&
                      orderItems.data.map((item) => (
                        <div className="flex items-center gap-2 justify-between pb-2">
                          <p className="font-medium text-sm">
                            {item.name} x{item.quantity}
                          </p>
                          <p className="font-mono text-sm text-neutral-600">
                            ${item.quantity * parseFloat(item.price)}
                          </p>
                        </div>
                      ))}

                    <div className="flex items-center gap-2 justify-between border-t-[0.0125rem] border-t-zinc-300/70 pt-4">
                      <p className="font-medium">Total</p>
                      <p className="font-mono text-sm text-neutral-600">
                        $
                        {orderItems.data
                          ?.map(
                            (item) => item.quantity * parseFloat(item.price),
                          )
                          .reduce((a, b) => a + b)}
                      </p>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      variant="brand"
                      onPress={() =>
                        confirmReservation.mutate({
                          reservationId: param.reservationId,
                        })
                      }
                    >
                      Confirm
                    </Button>
                  </ModalFooter>
                </Modal>
              </DialogTrigger>
            )}
          </div>
        </div>

        <div className="flex gap-2 my-2">
          <div
            className={cn(
              button({
                variant: "outline",
                fullWidth: true,
                isCircular: false,
              }),
              "h-12 active:scale-100 hover:border-zinc-300/70",
            )}
          >
            <CalendarIcon className="absolute top-1/2 -translate-y-1/2 left-2" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2">
              <p className="text-xs text-start text-zinc-500">Date</p>
              <p>
                {" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(reservation.data.startTime)}
              </p>
            </div>
          </div>
          <div
            className={cn(
              button({
                variant: "outline",
                fullWidth: true,
                isCircular: false,
              }),
              "h-12 active:scale-100 hover:border-zinc-300/70",
            )}
          >
            <UsersIcon className="absolute top-1/2 -translate-y-1/2 left-2" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2">
              <p className="text-xs text-start text-zinc-500">Guests</p>
              <p>{reservation.data.numberOfSeats} Guests</p>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, ease: "easeOut" }}
        className="bg-white shadow-xs rounded-md border-zinc-300/70 border-[0.0125rem] p-8"
      >
        <div className="flex items-center justify-between">
          <p className="font-medium text-xl">Menu</p>
          <Input placeholder="Search..." />
        </div>
        <div className="flex gap-4 mt-2 overflow-x-auto py-2">
          {menus.data.map((menu) => (
            <Link
              to="/restaurants/$id/reserve/$reservationId"
              from="/restaurants/$id/reserve/$reservationId"
              hashScrollIntoView={{ behavior: "smooth" }}
              hash={menu.name}
              key={menu.menuId}
              className="text-sm text-zinc-700 font-medium hover:underline"
            >
              {menu.name}
            </Link>
          ))}
        </div>
        {menus.data.map((menu) => (
          <div
            className="my-4 flex flex-col gap-2"
            id={menu.name}
            key={menu.menuId}
          >
            <p className="font-medium">{menu.name}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {menu.items.map((menuItem) => (
                <div
                  key={menuItem.id}
                  className="flex gap-4 items-center border-zinc-300/70 rounded-md border-[0.0125rem] justify-between"
                >
                  <div className="p-3">
                    <p className="font-medium">{menuItem.name}</p>
                    <p className="text-xs">${menuItem.price}</p>
                    <p className="text-sm text-neutral-700">
                      {menuItem.description}
                    </p>
                  </div>
                  <div className="h-full relative">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuVKl1mUH_ydB5c0ayg8E98Z_jtA5DHC5XHL9Lni8S_T6zgzduTPuVDyceDlB7jW0jiiIVCnYiKk7O6CpwlZKfVG3L4je-MeexRWzLCbyTQMKclmwAaA&s=10&ec=121532756"
                      alt=""
                      className="max-w-32 h-full object-cover rounded-md"
                    />
                    <motion.div className="absolute bottom-2 right-2 flex items-center gap-2 bg-zinc-100 rounded-full">
                      {menuItem.quantity && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            isLoading={removeMenuItem.isPending}
                            onPress={() =>
                              removeMenuItem.mutate({
                                menuItemId: menuItem.id,
                                quantity: 1,
                                reservationId: param.reservationId,
                              })
                            }
                          >
                            -
                          </Button>
                          <p className="text-sm font-medium">
                            {menuItem.quantity}
                          </p>
                        </div>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        isLoading={addMenuItem.isPending}
                        onPress={() =>
                          addMenuItem.mutate({
                            menuItemId: menuItem.id,
                            quantity: 1,
                            reservationId: param.reservationId,
                          })
                        }
                      >
                        <PlusMicroIcon />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
