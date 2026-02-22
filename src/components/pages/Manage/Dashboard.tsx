import { DatePicker } from "@/components/ui/date-picker";
import { Route } from "@/routes/manage.$id/index";
import { Button } from "@/components/ui/button";
import { ModalPopover } from "@/components/ui/modal-popover";
import { CalendarIcon } from "@/components/ui/icons";
import { DateValue, DialogTrigger } from "react-aria-components";
import { useState } from "react";

export default function ManageDashboard() {
  const { timeBlocks, totalIngredients } = Route.useLoaderData();
  const [date, setDate] = useState<DateValue | null>(null);
  return (
    <div className="space-y-5">
      <div className="flex w-fit gap-2 items-center">
        <h1 className="text-xl">Dashboard</h1>
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
                  }).format(date.toDate("UTC"))
                : "Select a Date"}
            </div>
          </Button>
          <ModalPopover>
            <div className="px-4 py-2 ">
              <DatePicker value={date} onChange={(date) => setDate(date)} />
            </div>
          </ModalPopover>
        </DialogTrigger>
      </div>
      {[...timeBlocks.values()].map((timeblock, i) => {
        const time = new Date(timeblock.startTime);
        return (
          <div key={timeblock.startTime.toISOString() + "-" + i}>
            <h1 className="text-lg font-bold">
              Ingredients{" "}
              <span className="text-xs bg-lime-700 w-fit rounded-md p-1.5 text-lime-100">
                {time.toLocaleDateString()} {time.toLocaleTimeString()}
              </span>
            </h1>
            <table>
              <thead>
                <tr className="font-bold">
                  <td>Name</td>
                  <td>Quantity</td>
                </tr>
              </thead>
              <tbody>
                {timeblock.orders.map((o) =>
                  [...o.totalIngredients.values()].map(
                    ({ name, quantity }, i) => (
                      <tr key={o.id + i + name}>
                        <td className="pr-10">{name}</td>
                        <td>{quantity}</td>
                      </tr>
                    ),
                  ),
                )}
              </tbody>
            </table>
            <hr />
          </div>
        );
      })}
    </div>
  );
}
