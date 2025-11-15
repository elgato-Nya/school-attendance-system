/**
 * MonthYearPicker Component
 * Professional month and year selector for quick calendar navigation
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface MonthYearPickerProps {
  currentDate: Date;
  onDateChange: (year: number, month: number) => void;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function MonthYearPicker({
  currentDate,
  onDateChange,
  minYear = 2020,
  maxYear = new Date().getFullYear() + 5,
}: MonthYearPickerProps) {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate year options
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const handleMonthChange = (monthStr: string) => {
    const month = parseInt(monthStr, 10);
    onDateChange(currentYear, month);
  };

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    onDateChange(year, currentMonth);
  };

  return (
    <div className="flex items-center gap-2 bg-foreground/5 px-3 py-2 rounded-lg border border-border shadow-sm">
      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />

      {/* Month Selector */}
      <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
        <SelectTrigger
          className="w-[130px] h-9 bg-background border-border"
          aria-label="Select month"
        >
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((month, index) => (
            <SelectItem key={index} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Selector */}
      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger
          className="w-[100px] h-9 bg-background border-border"
          aria-label="Select year"
        >
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.reverse().map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
