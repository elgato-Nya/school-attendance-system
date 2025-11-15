/**
 * Range Selection Info Component
 * Displays information about the current range selection state
 * Uses shadcn UI components with full ARIA support and semantic HTML
 */

import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
      className="border-primary/30 bg-primary/5"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Calendar className="h-4 w-4 text-primary hidden sm:block" aria-hidden="true" />

      <div className="flex items-start justify-between gap-2 sm:gap-4 flex-1">
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTitle className="mb-0 text-sm sm:text-base">Range Selection Mode</AlertTitle>
            <Badge
              variant="outline"
              className="text-xs shrink-0"
              aria-label={`Selection status: ${selectionState}`}
            >
              {selectionState === 'initial' && 'Step 1 of 2'}
              {selectionState === 'partial' && 'Step 2 of 2'}
              {selectionState === 'complete' && 'Complete'}
            </Badge>
          </div>

          <AlertDescription>
            {/* Initial state - no dates selected */}
            {selectionState === 'initial' && (
              <p className="text-sm">
                <Info className="inline h-3.5 w-3.5 mr-1" aria-hidden="true" />
                Click on a date to select the <strong className="font-semibold">
                  start date
                </strong>{' '}
                of your range.
              </p>
            )}

            {/* Partial state - start date selected */}
            {selectionState === 'partial' && (
              <div className="space-y-2" role="group" aria-label="Range selection progress">
                <dl className="text-xs sm:text-sm">
                  <div className="block sm:inline">
                    <dt className="inline text-muted-foreground">Start: </dt>
                    <dd
                      className="inline font-semibold break-words"
                      aria-label={`Start date: ${format(parseISO(rangeStart!), 'MMMM dd, yyyy')}`}
                    >
                      <time dateTime={rangeStart!}>
                        {format(parseISO(rangeStart!), 'MMM dd, yyyy')}
                      </time>
                    </dd>
                  </div>
                </dl>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <Info className="inline h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" aria-hidden="true" />
                  Now select the <strong className="font-semibold">end date</strong>.
                </p>
              </div>
            )}

            {/* Complete state - both dates selected */}
            {selectionState === 'complete' && (
              <div className="space-y-2" role="group" aria-label="Selected date range">
                <dl className="text-xs sm:text-sm">
                  <div>
                    <dt className="inline text-muted-foreground">Range: </dt>
                    <dd
                      className="inline font-semibold break-words"
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
                  className="text-xs sm:text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  Generating report...
                </p>
              </div>
            )}
          </AlertDescription>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0 h-7 w-7 sm:h-8 sm:w-8"
          aria-label="Cancel range selection mode"
          title="Cancel"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* Screen reader only status message */}
      <span className="sr-only" aria-live="assertive" aria-atomic="true">
        {getStatusMessage()}
      </span>
    </Alert>
  );
}
