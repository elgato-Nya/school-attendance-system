/**
 * Range Selection Info Component
 * Displays information about the current range selection state
 * Uses shadcn UI components with full ARIA support and semantic HTML
 */

import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, X, Info } from 'lucide-react';

interface RangeSelectionInfoProps {
  rangeStart: string | null;
  rangeEnd: string | null;
  onCancel: () => void;
}

export function RangeSelectionInfo({ rangeStart, rangeEnd, onCancel }: RangeSelectionInfoProps) {
  // Determine the current selection state
  const selectionState = !rangeStart ? 'initial' : rangeEnd ? 'complete' : 'partial';

  // Create accessible status message
  const getStatusMessage = () => {
    if (selectionState === 'initial') {
      return 'Click on a date to select the start date of your range';
    }
    if (selectionState === 'partial') {
      return `Start date selected: ${format(parseISO(rangeStart!), 'MMMM dd, yyyy')}. Now select an end date`;
    }
    return 'Range selected. Generating report';
  };

  return (
    <Alert
      className="border-primary/30 bg-primary/5 p-3 sm:p-4 grid-cols-[0_1fr]! sm:grid-cols-[calc(var(--spacing)*4)_1fr]!"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Calendar className="h-4 w-4 text-primary hidden sm:block" aria-hidden="true" />

      <div className="flex items-start justify-between gap-2 sm:gap-4 w-full col-start-2">
        <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="mb-0 text-xs sm:text-base leading-tight font-medium tracking-tight">
              Range Selection Mode
            </div>
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs shrink-0 px-1.5 py-0.5"
              aria-label={`Selection status: ${selectionState}`}
            >
              {selectionState === 'initial' && 'Step 1 of 2'}
              {selectionState === 'partial' && 'Step 2 of 2'}
              {selectionState === 'complete' && 'Complete'}
            </Badge>
          </div>

          <div className="text-xs sm:text-sm wrap-break-word text-muted-foreground">
            {/* Initial state - no dates selected */}
            {selectionState === 'initial' && (
              <p className="leading-relaxed flex items-start gap-1">
                <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="flex-1 min-w-0">
                  Tap a date to select the <strong className="font-semibold">start date</strong>
                </span>
              </p>
            )}

            {/* Partial state - start date selected */}
            {selectionState === 'partial' && (
              <div
                className="space-y-1.5 sm:space-y-2"
                role="group"
                aria-label="Range selection progress"
              >
                <dl className="text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
                    <dt className="text-muted-foreground text-[11px] sm:text-xs">Start:</dt>
                    <dd
                      className="font-semibold wrap-break-words"
                      aria-label={`Start date: ${format(parseISO(rangeStart!), 'MMMM dd, yyyy')}`}
                    >
                      <time dateTime={rangeStart!}>
                        {format(parseISO(rangeStart!), 'MMM dd, yyyy')}
                      </time>
                    </dd>
                  </div>
                </dl>
                <p className="text-muted-foreground leading-relaxed flex items-start gap-1">
                  <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 min-w-0">
                    Now tap the <strong className="font-semibold">end date</strong>
                  </span>
                </p>
              </div>
            )}

            {/* Complete state - both dates selected */}
            {selectionState === 'complete' && (
              <div
                className="space-y-1.5 sm:space-y-2"
                role="group"
                aria-label="Selected date range"
              >
                <dl className="text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
                    <dt className="text-muted-foreground text-[11px] sm:text-xs">Range:</dt>
                    <dd
                      className="font-semibold wrap-break-word"
                      aria-label={`Date range from ${format(parseISO(rangeStart!), 'MMMM dd, yyyy')} to ${format(parseISO(rangeEnd!), 'MMMM dd, yyyy')}`}
                    >
                      <time dateTime={rangeStart!}>{format(parseISO(rangeStart!), 'MMM dd')}</time>
                      {' - '}
                      <time dateTime={rangeEnd!}>
                        {format(parseISO(rangeEnd!), 'MMM dd, yyyy')}
                      </time>
                    </dd>
                  </div>
                </dl>
                <p
                  className="text-muted-foreground leading-relaxed"
                  role="status"
                  aria-live="polite"
                >
                  Generating report...
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0 h-8 w-8 sm:h-8 sm:w-8 -mt-1 -mr-1 touch-manipulation"
          aria-label="Cancel range selection mode"
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Screen reader only status message */}
      <span className="sr-only" aria-live="assertive" aria-atomic="true">
        {getStatusMessage()}
      </span>
    </Alert>
  );
}
