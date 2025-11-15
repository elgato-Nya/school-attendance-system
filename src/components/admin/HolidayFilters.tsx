/**
 * HolidayFilters Component
 * Year and type filter controls for holiday management
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HolidayFiltersProps {
  filterYear: string;
  filterType: string;
  availableYears: string[];
  totalHolidays: number;
  filteredCount: number;
  onYearChange: (year: string) => void;
  onTypeChange: (type: string) => void;
}

export function HolidayFilters({
  filterYear,
  filterType,
  availableYears,
  totalHolidays,
  filteredCount,
  onYearChange,
  onTypeChange,
}: HolidayFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center">
      <div className="flex-1 min-w-0">
        <Select value={filterYear} onValueChange={onYearChange}>
          <SelectTrigger aria-label="Filter by year" className="w-full">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-0">
        <Select value={filterType} onValueChange={onTypeChange}>
          <SelectTrigger aria-label="Filter by type" className="w-full">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="public">Public Holiday</SelectItem>
            <SelectItem value="school">School Holiday</SelectItem>
            <SelectItem value="event">School Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left md:whitespace-nowrap">
        Showing {filteredCount} of {totalHolidays} holidays
      </div>
    </div>
  );
}
