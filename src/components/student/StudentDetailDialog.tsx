import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import type { Class } from '@/types';
import type { StudentWithStats } from './StudentListTable';

type ViewMode = 'single' | 'range';

interface StudentDetailDialogProps {
  student: StudentWithStats | null;
  classes: Class[];
  viewMode: ViewMode;
  singleDate: Date | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onClose: () => void;
}

function getAttendanceBadge(rate: number) {
  if (rate >= 90) {
    return { variant: 'default' as const, label: 'Excellent' };
  }
  if (rate >= 75) {
    return { variant: 'secondary' as const, label: 'Good' };
  }
  return { variant: 'destructive' as const, label: 'At Risk' };
}

export default function StudentDetailDialog({
  student,
  classes,
  viewMode,
  singleDate,
  startDate,
  endDate,
  onClose,
}: StudentDetailDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg"
        aria-describedby="student-detail-description"
      >
        <DialogHeader>
          <DialogTitle>{student.name}</DialogTitle>
          <DialogDescription id="student-detail-description">
            {viewMode === 'single' &&
              singleDate &&
              `Detailed attendance for ${format(singleDate, 'MMMM d, yyyy')}`}
            {viewMode === 'range' &&
              startDate &&
              endDate &&
              `Detailed attendance from ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IC Number:</span>
              <span className="font-medium">{student.icNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Class:</span>
              <span className="font-medium">
                {classes.find((c) => c.id === student.classId)
                  ? `Grade ${classes.find((c) => c.id === student.classId)!.grade} - ${
                      classes.find((c) => c.id === student.classId)!.name
                    }`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Guardian:</span>
              <span className="font-medium">{student.guardianName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{student.guardianContact}</span>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Attendance Summary
            </h4>
            {student.totalDays === 0 && (
              <p
                className="text-sm rounded p-2 border"
                style={{
                  backgroundColor: 'hsl(var(--warning) / 0.1)',
                  borderColor: 'hsl(var(--warning) / 0.3)',
                  color: 'hsl(var(--warning-foreground))',
                }}
              >
                No attendance records found for this student in the selected date range.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
                <div>
                  <div className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>
                    {student.presentDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: 'hsl(var(--warning))' }} />
                <div>
                  <div className="text-lg font-bold" style={{ color: 'hsl(var(--warning))' }}>
                    {student.lateDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Late</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" style={{ color: 'hsl(var(--destructive))' }} />
                <div>
                  <div className="text-lg font-bold" style={{ color: 'hsl(var(--destructive))' }}>
                    {student.absentDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">{student.totalDays}</div>
                  <div className="text-xs text-muted-foreground">Days Recorded</div>
                </div>
              </div>
            </div>
            {student.totalDays > 0 && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Only counting days where this student has an attendance record (not days before
                enrollment).
              </p>
            )}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Attendance Rate</span>
                <Badge
                  variant={getAttendanceBadge(student.attendanceRate).variant}
                  className="text-base"
                >
                  {student.attendanceRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
