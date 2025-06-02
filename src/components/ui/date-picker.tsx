
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, type CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: CalendarProps["disabled"];
  fromDate?: CalendarProps["fromDate"];
  toDate?: CalendarProps["toDate"];
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", disabled, fromDate, toDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          onClick={() => setIsOpen(true)} // Ensure button click opens popover
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(currentDay) => { // For mode="single", first arg is the selected date
            onChange(currentDay);    // Call the passed onChange handler
            setIsOpen(false);        // Close the popover
          }}
          initialFocus
          disabled={disabled}
          fromDate={fromDate}
          toDate={toDate}
        />
      </PopoverContent>
    </Popover>
  )
}
