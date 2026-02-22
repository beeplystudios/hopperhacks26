import { DateValue, DialogTrigger } from "react-aria-components";
import { Button } from "@/components/ui/button";
import { CalendarIcon, DownloadIcon } from "@/components/ui/icons";
import { ModalPopover } from "@/components/ui/modal-popover";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Route } from "@/routes/manage.$id/upcoming";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { today } from "@internationalized/date";
import { cn } from "@/lib/cn";

export default function UpcomingDashboard() {
  const {
    reservations,
    ingredients: { totalIngredients },
  } = Route.useLoaderData();
  const params = useParams({ from: "/manage/$id/upcoming" });

  const [date, setDate] = useState<DateValue | null>(today("UTC"));

  const formatDateValue = (d: DateValue) => {
    const v = d as any;
    return typeof v.toDate === "function"
      ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
          v.toDate(),
        )
      : String(d);
  };

  const ingredientData = Array.from(totalIngredients.values());

  return (
    <div className="grid grid-cols-5 w-full h-full gap-8">
      <div className="col-span-3 flex flex-col items-center justify-start gap-4 rounded-xl p-6 border-zinc-300/50 border-[0.0125rem]">
        <div className="flex items-center justify-between w-full">
          <DialogTrigger>
            <Button
              className="h-12 items-center"
              leadingVisual={<CalendarIcon />}
              variant="outline"
              isCircular={false}
            >
              <div>
                <p className="text-xs text-start text-zinc-500">Date</p>
                {date ? formatDateValue(date) : "Select a Date"}
              </div>
            </Button>
            <ModalPopover>
              <div className="px-4 py-2 ">
                <DatePicker value={date} onChange={(d) => setDate(d)} />
              </div>
            </ModalPopover>
          </DialogTrigger>
          <h3 className="font-bold text-xl">Ingredients Report</h3>
          <Button
            className="h-12 items-center"
            leadingVisual={<DownloadIcon />}
            onClick={() => alert("didnt implement! (> o <)")}
            variant="outline"
            isCircular={false}
          >
            Download
          </Button>
        </div>
        <Table className="">
          <TableHeader>
            <TableRow className="">
              <TableHead className="w-full font-bold">Item</TableHead>
              <TableHead className="font-bold">Amount</TableHead>
              <TableHead className="font-bold">Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {ingredientData.map((ingredient) => (
              <TableRow key={ingredient.name} className="border-zinc-300">
                <TableCell className="">{ingredient.name}</TableCell>
                <TableCell className="text-right">
                  {ingredient.quantity}
                </TableCell>
                <TableCell className="text-right">{ingredient.unit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="col-span-2 flex flex-col items-center justify-start gap-6 rounded-xl p-4 border-zinc-300/50 border-[0.0125rem]">
        <div className="h-12 flex items-center justify-center">
          <h3 className="font-bold text-xl">Reservations</h3>
        </div>
        {reservations.map((reservation) => (
          <div key={reservation.id} className="w-full flex flex-col gap-2 px-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start justify-start">
                <p className="font-medium">
                  {new Date(reservation.startTime).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  -{" "}
                  {new Date(reservation.endTime).toLocaleString("en-US", {
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-sm text-zinc-500">
                  {reservation.numberOfSeats} Seat
                  {reservation.numberOfSeats !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center px-2 gap-2 border border-zinc-300 rounded-xl">
                <span
                  className={cn(
                    "rounded-full h-2 aspect-square",
                    reservation.status === "PENDING"
                      ? "bg-yellow-500"
                      : reservation.status === "CONFIRMED"
                        ? "bg-green-500"
                        : reservation.status === "CANCELLED"
                          ? "bg-red-500"
                          : reservation.status === "UNPAID"
                            ? "bg-orange-500"
                            : "bg-gray-500",
                  )}
                ></span>
                <p className="text-sm text-gray-700">
                  {reservation.status.charAt(0).toUpperCase() +
                    reservation.status.slice(1).toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
