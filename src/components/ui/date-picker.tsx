/**
 * DatePicker component
 * A reusable date picker using shadcn Calendar and Popover
 * Fully theme-responsive with proper dark mode support
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  closeOnSelect?: boolean;
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years';
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  closeOnSelect = false,
  captionLayout = 'label',
  fromYear,
  toYear,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (closeOnSelect) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal transition-colors',
            !date && 'text-muted-foreground',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            className
          )}
          disabled={disabled}
          aria-label={date ? format(date, 'PPP') : placeholder}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="rounded-md border-0"
          captionLayout={captionLayout}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  );
}
