/**
 * Student Attendance Card Component
 * Handles individual student attendance marking
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AttendanceRecord } from '@/types';

interface StudentAttendanceCardProps {
  record: AttendanceRecord;
  index: number;
  totalRecords: number;
  onStatusChange: (status: 'present' | 'absent' | 'late') => void;
  onLateTimeChange: (time: string) => void;
  onRemarksChange: (remarks: string) => void;
  showSeparator: boolean;
}

export function StudentAttendanceCard({
  record,
  index,
  totalRecords,
  onStatusChange,
  onLateTimeChange,
  onRemarksChange,
  showSeparator,
}: StudentAttendanceCardProps) {
  return (
    <div
      className="border rounded-lg p-3 sm:p-4 space-y-3"
      role="group"
      aria-label={`Kehadiran untuk ${record.studentName}`}
    >
      {/* Student Name & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <p className="font-medium">{record.studentName}</p>
          <p className="text-sm text-muted-foreground">
            Murid {index + 1} daripada {totalRecords}
          </p>
        </div>

        <Select value={record.status} onValueChange={onStatusChange}>
          <SelectTrigger
            className="w-full sm:w-[180px]"
            aria-label={`Pilih status untuk ${record.studentName}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="present">✅ Hadir</SelectItem>
            <SelectItem value="late">⏰ Lewat</SelectItem>
            <SelectItem value="absent">❌ Tidak Hadir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Late Time Input - Only show for Late status */}
      {record.status === 'late' && (
        <div className="grid gap-2">
          <Label htmlFor={`late-time-${index}`}>Masa Ketibaan Lewat *</Label>
          <Input
            id={`late-time-${index}`}
            type="time"
            value={record.lateTime || ''}
            onChange={(e) => onLateTimeChange(e.target.value)}
            aria-required="true"
            aria-describedby={`late-time-desc-${index}`}
          />
          <p id={`late-time-desc-${index}`} className="text-sm text-muted-foreground">
            Masukkan masa murid tiba
          </p>
        </div>
      )}

      {/* Remarks - Only show for Late or Absent */}
      {(record.status === 'late' || record.status === 'absent') && (
        <div className="grid gap-2">
          <Label htmlFor={`remarks-${index}`}>Catatan (Pilihan)</Label>
          <Input
            id={`remarks-${index}`}
            placeholder="cth: Jumpa doktor, kecemasan keluarga"
            value={record.remarks || ''}
            onChange={(e) => onRemarksChange(e.target.value)}
            aria-describedby={`remarks-desc-${index}`}
          />
          <p id={`remarks-desc-${index}`} className="text-sm text-muted-foreground">
            Tambah catatan tentang kehadiran murid ini
          </p>
        </div>
      )}

      {showSeparator && <Separator />}
    </div>
  );
}
