/**
 * Class Detail Dialog - Shows student attendance details for a class
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { LoadingState } from '@/components/attendance/LoadingState';
import { getAttendanceByClassAndDate } from '@/services/attendance.service';
import type { Attendance } from '@/types';
import { CheckCircle2, Clock, XCircle, Users, Calendar as CalendarIcon } from 'lucide-react';

interface ClassDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  date?: string; // optional initial date
}

export function ClassDetailDialog({
  open,
  onOpenChange,
  classId,
  className,
  date,
}: ClassDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(date ? new Date(date) : new Date());

  useEffect(() => {
    if (open && classId) {
      loadData();
    }
  }, [open, classId, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const attendanceData = await getAttendanceByClassAndDate(classId, dateStr);
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error loading class details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'excused':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
      present: 'success',
      late: 'warning',
      absent: 'destructive',
      excused: 'default',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {className} - Butiran Murid
          </DialogTitle>
          <DialogDescription>Lihat butiran kehadiran untuk tarikh tertentu</DialogDescription>
        </DialogHeader>

        {/* Date Picker */}
        <div className="space-y-2">
          <Label
            htmlFor="detail-date"
            className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
          >
            <CalendarIcon className="h-4 w-4" />
            Pilih Tarikh
          </Label>
          <DatePicker
            date={selectedDate}
            onDateChange={(date) => date && setSelectedDate(date)}
            placeholder="Pilih tarikh"
            closeOnSelect={true}
          />
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, 'MMMM dd, yyyy')} •{' '}
            {attendance ? `${attendance.records.length} murid` : 'Memuatkan...'}
          </p>
        </div>

        {loading ? (
          <div className="py-8">
            <LoadingState message="Memuatkan butiran kehadiran..." />
          </div>
        ) : !attendance ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Tiada rekod kehadiran untuk tarikh ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-900 dark:text-green-100">
                    Hadir
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {attendance.summary.present}
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-900 dark:text-amber-100">
                    Lewat
                  </span>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {attendance.summary.late}
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-900 dark:text-red-100">
                    Tidak Hadir
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {attendance.summary.absent}
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-primary/5">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Kadar Kehadiran
                </div>
                <div className="text-2xl font-bold text-primary">{attendance.summary.rate}%</div>
              </div>
            </div>

            {/* Student List */}
            <div className="rounded-md border overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 border-b font-medium text-sm">
                <div className="w-8 shrink-0">#</div>
                <div className="flex-1 min-w-0">Murid</div>
                <div className="hidden md:block w-32 shrink-0">Nombor IC</div>
                <div className="w-24 shrink-0">Status Kehadiran</div>
              </div>

              {/* Body */}
              {attendance.records.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Tiada murid dalam kelas ini
                </div>
              ) : (
                <div className="divide-y">
                  {attendance.records.map((record, index) => (
                    <div
                      key={record.icNumber || index}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 px-4 py-3">
                        <div className="w-8 shrink-0 font-medium">{index + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{record.studentName}</div>
                          <div className="text-xs text-muted-foreground md:hidden mt-0.5">
                            {record.icNumber}
                          </div>
                        </div>
                        <div className="hidden md:block w-32 shrink-0 text-sm">
                          {record.icNumber}
                        </div>
                        <div className="w-24 shrink-0 flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <span className="sm:hidden">{getStatusBadge(record.status)}</span>
                          <span className="hidden sm:inline capitalize text-sm">
                            {record.status}
                          </span>
                        </div>
                      </div>
                      {record.remarks && (
                        <div className="px-4 pb-3 pt-0">
                          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
                            <span className="opacity-60 mt-0.5">💬</span>
                            <span className="flex-1">{record.remarks}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Info */}
            {attendance.submittedByName && (
              <div className="text-xs text-muted-foreground">
                Diserahkan oleh <span className="font-medium">{attendance.submittedByName}</span>{' '}
                pada {format(attendance.timestamp.toDate(), 'MMM dd, yyyy at h:mm a')}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
