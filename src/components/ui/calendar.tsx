import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from "react";
import { DayPicker} from "react-day-picker";
import { cn } from "../../lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative mx-10 mb-1 flex h-9 items-center justify-center z-20",
    caption_label: "font-medium text-muted-foreground/80",
    nav: "absolute top-0 flex w-full justify-between z-10 border-b-2",
    button_previous: cn(
      "h-9 w-9 text-muted-foreground/80 hover:text-foreground p-0",
    ),
    button_next: cn(
      "h-9 w-9 text-muted-foreground/80 hover:text-foreground p-0",
    ),
    weekday: "h-9 w-9 p-0 text-xs font-medium",
    day_button:
      "relative flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-full p-0 text-foreground outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-red-500 group-data-[selected]:bg-red-500 hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-full group-[.range-end:not(.range-start)]:rounded-full group-[.range-middle]:rounded-full group-data-[selected]:group-[.range-middle]:bg-red-100 group-data-[selected]:group-[.range-middle]:text-foreground",
    day: "group h-9 w-9 p-1 text-sm",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:h-[3px] *:after:w-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors h-9 w-9 rounded-full",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
    week_number: "h-9 w-9 p-0 text-xs font-medium text-muted-foreground/80",
  };

  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as typeof defaultClassNames,
  );

  const defaultComponents = {
    Chevron: (props: any) => {
      if (props.orientation === "left") {
        return (
          <div className="flex justify-center items-center">
            <ChevronLeft 
              className="w-6 h-6 text-gray-400" 
              size={18} 
              strokeWidth={2} 
              {...props} 
              aria-hidden="true" 
            />
          </div>
        );
      }
      return (
        <div className="flex justify-center items-center">
          <ChevronRight 
            className="w-6 h-6 text-gray-400" 
            size={18} 
            strokeWidth={2} 
            {...props} 
            aria-hidden="true" 
          />
        </div>
      );
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };


  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      weekStartsOn={1}
      
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };