/**
 * CalendarView Component - Rewritten for reliable color updates
 * FullCalendar wrapper with attendance color coding and responsive theme support
 */

import { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import type { Holiday } from '@/types';
import { MonthYearPicker } from './MonthYearPicker';

interface CalendarViewProps {
  onDateClick: (dateStr: string) => void;
  onMonthChange: (date: Date) => void;
  getDateInfo: (dateStr: string) => { color: string; textColor: string; tooltip?: string };
  holidays: Holiday[];
  rangeMode?: boolean;
  rangeStart?: string | null;
  rangeEnd?: string | null;
  isLoadingData?: boolean; // New prop to show loading indicator
}

export function CalendarView({
  onDateClick,
  onMonthChange,
  getDateInfo,
  rangeMode = false,
  rangeStart = null,
  rangeEnd = null,
  isLoadingData = false,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update all cell colors - called whenever we need to refresh
  const updateAllCellColors = () => {
    const dayCells = document.querySelectorAll('.fc-daygrid-day');
    dayCells.forEach((cell) => {
      const dateStr = cell.getAttribute('data-date');
      if (dateStr) {
        const dateInfo = getDateInfo(dateStr);
        (cell as HTMLElement).style.backgroundColor = dateInfo.color;
        (cell as HTMLElement).style.color = dateInfo.textColor;

        if (dateInfo.tooltip) {
          cell.setAttribute('title', dateInfo.tooltip);
        }
      }
    });
  };

  const handleDateClick = (info: any) => {
    onDateClick(info.dateStr);
  };

  const handleMonthYearChange = (year: number, month: number) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const newDate = new Date(year, month, 1);
      calendarApi.gotoDate(newDate);
      setCurrentViewDate(newDate);
      onMonthChange(newDate);
    }
  };

  const handleDatesSet = (info: any) => {
    const actualMonthStart = info.view.currentStart;
    setCurrentViewDate(actualMonthStart);
    onMonthChange(actualMonthStart);
  };

  // Update colors whenever getDateInfo changes (new data loaded)
  useEffect(() => {
    // Wait a bit for DOM to be ready
    const timer = setTimeout(() => {
      updateAllCellColors();
    }, 100);

    return () => clearTimeout(timer);
  }, [getDateInfo]);

  // Check if date is in range selection
  const isInRange = (dateStr: string): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    return dateStr >= rangeStart && dateStr <= rangeEnd;
  };

  const isRangeStartDate = (dateStr: string): boolean => {
    return rangeStart === dateStr;
  };

  const isRangeEndDate = (dateStr: string): boolean => {
    return rangeEnd === dateStr;
  };

  return (
    <Card>
      <CardContent className={isMobile ? 'p-2' : 'p-4 sm:p-6'}>
        {/* Loading indicator - non-blocking */}
        {isLoadingData && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading attendance data...</span>
          </div>
        )}

        {/* Month/Year Picker */}
        <div className="mb-4 flex justify-center">
          <MonthYearPicker currentDate={currentViewDate} onDateChange={handleMonthYearChange} />
        </div>

        <div className="calendar-container max-w-[1400px] mx-auto">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'today',
            }}
            buttonText={{
              today: 'Today',
            }}
            titleFormat={
              isMobile ? { year: 'numeric', month: 'short' } : { year: 'numeric', month: 'long' }
            }
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            dayCellDidMount={(info) => {
              const dateStr = format(info.date, 'yyyy-MM-dd');
              const dateInfo = getDateInfo(dateStr);

              // Apply background color
              info.el.style.backgroundColor = dateInfo.color;
              info.el.style.color = dateInfo.textColor;

              // Add smooth transition
              info.el.style.transition =
                'background-color 0.2s ease, color 0.2s ease, border 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, transform 0.2s ease';

              // Improve cell sizing
              info.el.style.minHeight = isMobile ? '60px' : '100px';
              info.el.style.maxHeight = isMobile ? '80px' : '140px';

              // Check if this is a date from another month
              const cellMonth = info.date.getMonth();
              const currentViewMonth = info.view.currentStart.getMonth();
              const isOtherMonth = cellMonth !== currentViewMonth;

              // Range mode visual feedback
              if (rangeMode) {
                info.el.style.cursor = 'crosshair';

                if (isRangeStartDate(dateStr)) {
                  info.el.style.border = '3px solid hsl(var(--accent))';
                  info.el.style.boxShadow = '0 0 0 3px hsl(var(--accent) / 0.2)';
                  info.el.style.position = 'relative';
                  info.el.style.zIndex = '10';
                } else if (isRangeEndDate(dateStr)) {
                  info.el.style.border = '3px solid hsl(var(--accent))';
                  info.el.style.boxShadow = '0 0 0 3px hsl(var(--accent) / 0.2)';
                  info.el.style.position = 'relative';
                  info.el.style.zIndex = '10';
                } else if (isInRange(dateStr)) {
                  info.el.style.boxShadow = 'inset 0 0 0 2px hsl(var(--accent) / 0.3)';
                  info.el.style.border = '2px solid hsl(var(--accent) / 0.5)';
                  info.el.style.backgroundColor = `color-mix(in srgb, ${dateInfo.color} 70%, hsl(var(--accent)) 30%)`;
                } else {
                  info.el.style.border = '1px solid hsl(var(--border))';
                  info.el.style.opacity = '0.7';
                }
              } else {
                info.el.style.cursor = 'pointer';
                info.el.style.border = '1px solid hsl(var(--border))';
                info.el.style.borderRadius = '4px';

                // Only add hover effects for dates in current month
                if (!isOtherMonth) {
                  let isHovering = false;

                  const handleMouseEnter = () => {
                    isHovering = true;
                    info.el.style.opacity = '0.85';
                    info.el.style.boxShadow = '0 2px 8px hsl(var(--primary) / 0.15)';
                    info.el.style.transform = 'translateY(-1px)';
                    info.el.style.borderColor = 'hsl(var(--primary) / 0.5)';
                  };

                  const handleMouseLeave = () => {
                    isHovering = false;
                    requestAnimationFrame(() => {
                      if (!isHovering) {
                        info.el.style.opacity = '1';
                        info.el.style.boxShadow = 'none';
                        info.el.style.transform = 'translateY(0)';
                        info.el.style.borderColor = 'hsl(var(--border))';
                      }
                    });
                  };

                  info.el.addEventListener('mouseenter', handleMouseEnter);
                  info.el.addEventListener('mouseleave', handleMouseLeave);

                  // Cleanup on unmount
                  const observer = new MutationObserver(() => {
                    if (!document.body.contains(info.el)) {
                      info.el.removeEventListener('mouseenter', handleMouseEnter);
                      info.el.removeEventListener('mouseleave', handleMouseLeave);
                      observer.disconnect();
                    }
                  });
                  observer.observe(document.body, { childList: true, subtree: true });
                }
              }

              // Add tooltip
              if (dateInfo.tooltip) {
                info.el.setAttribute('title', dateInfo.tooltip);
              }

              // Improve text styling
              info.el.style.fontWeight = '600';
              const dayNumber = info.el.querySelector('.fc-daygrid-day-number');
              if (dayNumber) {
                (dayNumber as HTMLElement).style.fontSize = isMobile ? '0.875rem' : '1rem';
                (dayNumber as HTMLElement).style.padding = isMobile ? '4px' : '8px';
              }
            }}
            height="auto"
            aspectRatio={isMobile ? 0.85 : 1.4}
            contentHeight="auto"
            dayMaxEvents={isMobile ? 0 : 2}
            dayHeaderFormat={isMobile ? { weekday: 'narrow' } : { weekday: 'short' }}
            fixedWeekCount={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
