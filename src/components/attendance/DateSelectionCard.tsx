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
          Pilih Tarikh
        </CardTitle>
        <CardDescription>
          Pilih tarikh untuk penyerahan kehadiran. Penyerahan bertarikh mundur memerlukan sebab.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="attendance-date">Tarikh Kehadiran *</Label>
            <DatePicker
              date={selectedDate}
              onDateChange={(date) => date && onDateChange(date)}
              disabled={false}
              aria-label="Pilih tarikh kehadiran"
            />
            <p className="text-xs sm:text-sm text-muted-foreground" id="date-helper">
              Dipilih: {format(selectedDate, 'EEE, dd MMM yyyy')}
            </p>
          </div>

          {/* Date Status Indicators */}
          <div className="space-y-3">
            {isHolidayDate && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{holidayName}</strong> - Tidak boleh hantar kehadiran pada hari cuti
                </AlertDescription>
              </Alert>
            )}

            {existingSubmission && !isHolidayDate && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Kehadiran sudah diserahkan untuk tarikh ini. Menghantar semula akan menggantikan
                  data.
                </AlertDescription>
              </Alert>
            )}

            {showReasonField && !isHolidayDate && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Penyerahan bertarikh mundur - Sebab diperlukan di bawah
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Late Submission Reason */}
        {showReasonField && !isHolidayDate && (
          <div className="space-y-2">
            <Label htmlFor="late-reason">Sebab Penyerahan Lewat *</Label>
            <Textarea
              id="late-reason"
              placeholder="cth: Masalah sambungan internet, terlupa hantar, penyelenggaraan sistem"
              value={lateReason}
              onChange={(e) => onLateReasonChange(e.target.value)}
              rows={3}
              aria-required="true"
              aria-describedby="late-reason-desc"
              className={!lateReason.trim() ? 'border-destructive' : ''}
            />
            <p id="late-reason-desc" className="text-sm text-muted-foreground">
              Jelaskan mengapa kehadiran diserahkan selepas tarikh
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
