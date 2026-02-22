import { DatePicker } from "@/components/ui/date-picker";
import { Route } from "@/routes/manage.$id/index";
import { Button } from "@/components/ui/button";
import { ModalPopover } from "@/components/ui/modal-popover";
import { CalendarIcon } from "@/components/ui/icons";
import LineChart from "./lineChart";
import { DateValue, DialogTrigger } from "react-aria-components";
import { useState } from "react";
import { DishesOverTimeChart } from "./charts/dishes-over-time";
import { useTRPC } from "@/lib/trpc-client";

export default function ManageDashboard() {
  const { dishesOverTime, reservations, restaurant } = Route.useLoaderData();
  const [date, setDate] = useState<DateValue | null>(null);
  return (
    <div>
      <DishesOverTimeChart
        data={dishesOverTime}
        startTime={restaurant.openTime}
        endTime={restaurant.closeTime}
      />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="italic text-lg text-nowrap">
              Coming up this week...
            </h1>
            <DialogTrigger>
              <Button
                className="h-12"
                leadingVisual={<CalendarIcon className="absolute left-1.5" />}
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

          <div>
            <h1 className="font-bold text-lg">Total Ingredients</h1>
            <div className="flex justify-between text-md flex-nowrap overflow-x-auto gap-2">
              {[...reservations.totalIngredients.values()].map((ingredient) => (
                <div>
                  <p className="font-semibold">{ingredient.name}</p>
                  <p>{ingredient.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {[...reservations.timeBlocks.values()].map((timeblock, i) => {
            const time = new Date(timeblock.startTime);
            return (
              <div key={timeblock.startTime.toISOString() + "-" + i}>
                <hr />
                <div className="flex gap-2 items-center py-2">
                  <h1 className="text-lg font-bold">Ingredients</h1>
                  <span className="text-xs bg-lime-700 w-fit rounded-full p-1.5 text-white">
                    {time.toLocaleDateString()} {time.toLocaleTimeString()}
                  </span>
                </div>
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
                  <tfoot>
                    <tr>
                      <td className="font-bold">Total</td>
                      <td className="font-bold">
                        {timeblock.orders
                          .flatMap((o) => [...o.totalIngredients.values()])
                          .reduce((acc, curr) => acc + curr.quantity, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>

        <div className="col-span-2">
          <LineChart />
        </div>
      </div>
    </div>
  );
}
