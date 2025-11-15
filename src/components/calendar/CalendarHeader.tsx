/**
 * CalendarHeader - Page header with semantic HTML and ARIA
 */
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, CalendarRange } from 'lucide-react';

interface CalendarHeaderProps {
  rangeMode: boolean;
  onToggleRangeMode: () => void;
}

export function CalendarHeader({ rangeMode, onToggleRangeMode }: CalendarHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0" aria-hidden="true">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-foreground" />
          </div>
          <span className="truncate">Attendance Calendar</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          View attendance patterns and generate reports
        </p>
      </div>

      <Button
        variant={rangeMode ? 'default' : 'outline'}
        onClick={onToggleRangeMode}
        className="shrink-0 w-full sm:w-auto"
        size="sm"
        aria-pressed={rangeMode}
        aria-label={rangeMode ? 'Exit range selection mode' : 'Enter range selection mode'}
      >
        <CalendarRange className="h-4 w-4 mr-2" aria-hidden="true" />
        <span className="sm:inline">{rangeMode ? 'Exit Range' : 'Range Report'}</span>
      </Button>
    </header>
  );
}
