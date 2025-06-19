"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {  CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export const DatePickerInput = ({
    date,
    setDateAction,
    placeholder,
  }: {
    date: Date | null;
    setDateAction: (date: Date | null) => void;
    placeholder: string;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-[200px] justify-start text-left font-normal", {
              "text-muted-foreground": !date,
            })}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(day) => setDateAction(day || null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };
  