"use client"

import { format, parse } from "date-fns"
import { CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value: string // DD/MM/YYYY
  onChange: (value: string) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  // Parse DD/MM/YYYY to Date
  const dateValue = value ? parse(value, "dd/MM/yyyy", new Date()) : undefined
  const isValid = dateValue && !isNaN(dateValue.getTime())

  function handleSelect(date: Date | undefined) {
    if (date) {
      onChange(format(date, "dd/MM/yyyy"))
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !isValid && "text-muted-foreground"
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {isValid ? format(dateValue, "dd MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <Calendar
          mode="single"
          selected={isValid ? dateValue : undefined}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
