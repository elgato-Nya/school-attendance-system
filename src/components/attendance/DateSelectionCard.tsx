/**
 * Date Selection Card Component
 * Handles date picker and validation display
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface DateSelectionCardProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isHolidayDate: boolean;
  holidayName: string;
  existingSubmission: boolean;
  showReasonField: boolean;
  lateReason: string;
  onLateReasonChange: (reason: string) => void;
}

export function DateSelectionCard({
  selectedDate,
  onDateChange,
  isHolidayDate,
  holidayName,
  existingSubmission,
  showReasonField,
  lateReason,
  onLateReasonChange,
}: DateSelectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" aria-hidden="true" />
          Select Date
        </CardTitle>
        <CardDescription>
          Choose the date for attendance submission. Backdated submissions require a reason.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="attendance-date">Attendance Date *</Label>
            <DatePicker
              date={selectedDate}
              onDateChange={(date) => date && onDateChange(date)}
              disabled={false}
              aria-label="Select attendance date"
            />
            <p className="text-xs sm:text-sm text-muted-foreground" id="date-helper">
              Selected: {format(selectedDate, 'EEE, dd MMM yyyy')}
            </p>
          </div>

          {/* Date Status Indicators */}
          <div className="space-y-3">
            {isHolidayDate && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{holidayName}</strong> - Cannot submit attendance on holidays
                </AlertDescription>
              </Alert>
            )}

            {existingSubmission && !isHolidayDate && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Attendance already submitted for this date. Submitting again will overwrite.
                </AlertDescription>
              </Alert>
            )}

            {showReasonField && !isHolidayDate && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>Backdated submission - Reason required below</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Late Submission Reason */}
        {showReasonField && !isHolidayDate && (
          <div className="space-y-2">
            <Label htmlFor="late-reason">Reason for Late Submission *</Label>
            <Textarea
              id="late-reason"
              placeholder="e.g., Internet connection issue, forgot to submit, system maintenance"
              value={lateReason}
              onChange={(e) => onLateReasonChange(e.target.value)}
              rows={3}
              aria-required="true"
              aria-describedby="late-reason-desc"
              className={!lateReason.trim() ? 'border-destructive' : ''}
            />
            <p id="late-reason-desc" className="text-sm text-muted-foreground">
              Explain why attendance is being submitted after the date
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
