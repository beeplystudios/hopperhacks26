import { getLocalTimeZone, isToday } from "@internationalized/date";
import React from "react";
import {
  RangeCalendar as AriaRangeCalendar,
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  Heading,
} from "react-aria-components";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

export const DatePicker: React.FC<React.ComponentProps<typeof AriaCalendar>> = (
  props,
) => {
  return (
    <AriaCalendar className="w-full" {...props}>
      <header className="flex items-center py-2 w-full justify-between relative">
        <Button size="icon" slot="previous" variant="ghost">
          <ChevronLeftIcon />
        </Button>
        <Heading className="text-sm font-semibold my-2 absolute left-1/2 -translate-x-1/2" />
        <Button size="icon" slot="next" variant="ghost">
          <ChevronRightIcon />
        </Button>
      </header>
      <CalendarGrid className="w-full">
        {(date) => (
          <CalendarCell
            date={date}
            className={({
              date,
              isSelected,
              isHovered,
              isOutsideVisibleRange,
            }) =>
              cn(
                "p-2 text-center rounded-md text-sm font-medium cursor-default m-0.5 [td:first-child_&]:rounded-s-md [td:last-child_&]:rounded-e-md transition-colors",
                "focus:outline-none focus-visible:ring-[1.25px] focus-visible:ring-offset-0 focus-visible:ring-lime-800",
                {
                  "relative after:size-2 after:absolute after:bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:text-lime-600 after:content-['•']":
                    isToday(date, getLocalTimeZone()),
                  "text-neutral-400": isOutsideVisibleRange,
                  "bg-lime-500": isSelected || isHovered,
                },
              )
            }
          />
        )}
      </CalendarGrid>
    </AriaCalendar>
  );
};
