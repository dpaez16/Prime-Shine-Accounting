"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date;
    onChange: (newDate?: Date) => void;
    onlyMondays?: boolean;
    placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const date = props.value;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date && format(date, "MM/dd/yyyy")}
          {!date && props.placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={props.onChange}
          initialFocus
          disabled={{
            dayOfWeek: props.onlyMondays ? [0, 2, 3, 4, 5, 6] : [],
          }}
        />
      </PopoverContent>
    </Popover>
  );
};