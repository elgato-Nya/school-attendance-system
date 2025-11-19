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
    return { variant: 'default' as const, label: 'Cemerlang' };
  }
  if (rate >= 75) {
    return { variant: 'secondary' as const, label: 'Baik' };
  }
  return { variant: 'destructive' as const, label: 'Berisiko' };
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
              `Kehadiran terperinci untuk ${format(singleDate, 'MMMM d, yyyy')}`}
            {viewMode === 'range' &&
              startDate &&
              endDate &&
              `Kehadiran terperinci dari ${format(startDate, 'MMM d')} hingga ${format(endDate, 'MMM d, yyyy')}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nombor IC:</span>
              <span className="font-medium">{student.icNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kelas:</span>
              <span className="font-medium">
                {classes.find((c) => c.id === student.classId)
                  ? `Tingkatan ${classes.find((c) => c.id === student.classId)!.grade} - ${
                      classes.find((c) => c.id === student.classId)!.name
                    }`
                  : 'T/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Penjaga:</span>
              <span className="font-medium">{student.guardianName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hubungan:</span>
              <span className="font-medium">{student.guardianContact}</span>
            </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ringkasan Kehadiran
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
                Tiada rekod kehadiran dijumpai untuk murid ini dalam julat tarikh yang dipilih.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(var(--success))' }} />
                <div>
                  <div className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>
                    {student.presentDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Hadir</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: 'hsl(var(--warning))' }} />
                <div>
                  <div className="text-lg font-bold" style={{ color: 'hsl(var(--warning))' }}>
                    {student.lateDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Lewat</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" style={{ color: 'hsl(var(--destructive))' }} />
                <div>
                  <div className="text-lg font-bold" style={{ color: 'hsl(var(--destructive))' }}>
                    {student.absentDays}
                  </div>
                  <div className="text-xs text-muted-foreground">Tidak Hadir</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-lg font-bold">{student.totalDays}</div>
                  <div className="text-xs text-muted-foreground">Hari Direkod</div>
                </div>
              </div>
            </div>
            {student.totalDays > 0 && (
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Hanya mengira hari di mana murid ini mempunyai rekod kehadiran (bukan hari sebelum
                pendaftaran).
              </p>
            )}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Kadar Kehadiran</span>
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
