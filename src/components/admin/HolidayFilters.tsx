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
          <SelectTrigger aria-label="Tapis mengikut tahun" className="w-full">
            <SelectValue placeholder="Tapis mengikut tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
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
          <SelectTrigger aria-label="Tapis mengikut jenis" className="w-full">
            <SelectValue placeholder="Tapis mengikut jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            <SelectItem value="public">Cuti Umum</SelectItem>
            <SelectItem value="school">Cuti Sekolah</SelectItem>
            <SelectItem value="event">Acara Sekolah</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs md:text-sm text-muted-foreground text-center md:text-left md:whitespace-nowrap">
        Menunjukkan {filteredCount} daripada {totalHolidays} cuti
      </div>
    </div>
  );
}
