import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { ModalPopover } from "@/components/ui/modal-popover";
import {
  Select,
  SelectBody,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useTRPC } from "@/lib/trpc-client";
import { CalendarDate, today } from "@internationalized/date";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DateValue, DialogTrigger } from "react-aria-components";
import useMeasure from "react-use-measure";

export default function Restaurants() {
  const param = useParams({ from: "/restaurants/$id" });

  const trpc = useTRPC();
  const restaurant = useSuspenseQuery(
    trpc.restaurant.getById.queryOptions({ id: param.id }),
  );

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [date, setDate] = useState<DateValue | null>(today(userTimeZone));
  const [triggerRef, { width: triggerWidth }] = useMeasure();

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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-3/4  lg:w-1/2 flex flex-col gap-4">
        <div className="bg-white shadow-xs rounded-md border-zinc-300/70 border-[0.0125rem] p-8">
          <div>
            <h1 className="text-xl font-semibold">{restaurant.data.name}</h1>
            <p className="text-sm text-zinc-700">{restaurant.data.address}</p>
          </div>
          <div className="flex gap-2 my-2">
            <DialogTrigger>
              <Button
                className="h-12"
                leadingVisual={<CalendarIcon className="absolute left-2" />}
                fullWidth
                variant="outline"
                isCircular={false}
              >
                <div className="absolute left-10 top-1/2 -translate-y-1/2">
                  <p className="text-xs text-start text-zinc-500">Date</p>
                  {date
                    ? new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(date.toDate(userTimeZone))
                    : "Select a Date"}
                </div>
              </Button>
              <ModalPopover>
                <div className="px-4 py-2">
                  <DatePicker value={date} onChange={(date) => setDate(date)} />
                </div>
              </ModalPopover>
            </DialogTrigger>
            <Select defaultValue="2">
              <SelectTrigger
                triggerRef={triggerRef}
                btnProps={{
                  className: "h-12",
                  variant: "outline",
                  isCircular: false,
                  fullWidth: true,
                  leadingVisual: <UsersIcon className="absolute left-2" />,
                }}
                textClassName="absolute left-10 top-1/2 -translate-y-1/2"
              />
              <SelectBody
                popoverProps={{
                  triggerWidth,
                }}
              >
                <SelectItem id="1">1 Guest</SelectItem>
                <SelectItem id="2">2 Guests</SelectItem>
                <SelectItem id="3">3 Guests</SelectItem>
                <SelectItem id="4">4 Guests</SelectItem>
                <SelectItem id="5">5 Guests</SelectItem>
                <SelectItem id="6">6 Guests</SelectItem>
                <SelectItem id="7">7 Guests</SelectItem>
                <SelectItem id="8">8 Guests</SelectItem>
                <SelectItem id="9">9 Guests</SelectItem>
                <SelectItem id="10">10 Guests</SelectItem>
                <SelectItem id="11">11 Guests</SelectItem>
                <SelectItem id="12">12 Guests</SelectItem>
              </SelectBody>
            </Select>
            <Button variant="brand" isCircular={false} className="h-12">
              Search
            </Button>
          </div>
        </div>
        {date && (
          <div className="bg-white shadow-xs rounded-md border-zinc-300/70 border-[0.0125rem] p-8">
            <div className="flex justify-between items-center">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDate((d) => d && d.add({ days: -1 }))}
              >
                <ChevronLeftIcon />
              </Button>
              <p className="text-sm font-medium text-zinc-500">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(date?.toDate("EST"))}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDate((d) => d && d.add({ days: 1 }))}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            <div className="flex gap-4 flex-wrap mt-4">
              {[...new Array(10)].map((_, idx) => (
                <div className="bg-(--light-restaurant-color) py-2 px-4 rounded-md">
                  <p className="text-sm font-medium">{idx}:00 AM</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
