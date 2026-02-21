import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { CalendarIcon, UsersIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { ModalPopover } from "@/components/ui/modal-popover";
import {
  Select,
  SelectBody,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { CalendarDate } from "@internationalized/date";
import { useRef, useState } from "react";
import { DateValue, DialogTrigger } from "react-aria-components";
import useMeasure from "react-use-measure";

export default function Restaurants() {
  const [date, setDate] = useState<DateValue | null>(null);
  const [triggerRef, { width: triggerWidth }] = useMeasure();

  return (
    <div>
      <img
        src="https://tb-static.uber.com/prod/image-proc/processed_images/7cbce67acc1f2b55b631f370cfcb71eb/5283d81c664b43c5f57a3a186d273063.jpeg"
        alt=""
        className="h-[50vh] w-screen object-cover"
      />
      <div className="absolute bg-white shadow-xs rounded-md border-zinc-300/70 border-[0.0125rem] p-8 top-1/3 left-1/2 -translate-x-1/2 w-1/2">
        <div>
          <h1 className="text-xl font-semibold">Chipotle Mexican Grill</h1>
          <p className="text-sm text-zinc-700">
            123 Park Ave, New York, NY 10017
          </p>
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
                    }).format(date.toDate("UTC"))
                  : "Select a Date"}
              </div>
            </Button>
            <ModalPopover>
              <div className="px-4 py-2">
                <DatePicker value={date} onChange={(date) => setDate(date)} />
              </div>
            </ModalPopover>
          </DialogTrigger>
          <Select>
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
              <SelectItem>1 Guest</SelectItem>
              <SelectItem>2 Guests</SelectItem>
              <SelectItem>3 Guests</SelectItem>
              <SelectItem>4 Guests</SelectItem>
              <SelectItem>5 Guests</SelectItem>
              <SelectItem>6 Guests</SelectItem>
              <SelectItem>7 Guests</SelectItem>
              <SelectItem>8 Guests</SelectItem>
              <SelectItem>9 Guests</SelectItem>
              <SelectItem>10+ Guests</SelectItem>
            </SelectBody>
          </Select>
          <Button variant="brand" isCircular={false} className="h-12">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
