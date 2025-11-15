import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, FileQuestion } from 'lucide-react';
import type { AttendanceRecord } from '@/types';
import { ATTENDANCE_STATUS } from '@/utils/constants';

interface Student {
  id: string;
  name: string;
  icNumber?: string;
}

interface AttendanceGridProps {
  students: Student[];
  attendanceRecords: Map<string, AttendanceRecord>;
  onMarkAttendance: (studentId: string, status: string) => void;
  isLoading: boolean;
}

export function AttendanceGrid({
  students,
  attendanceRecords,
  onMarkAttendance,
  isLoading,
}: AttendanceGridProps) {
  const getStatusButton = (studentId: string, status: string) => {
    const record = attendanceRecords.get(studentId);
    const isActive = record?.status === status;

    const statusConfig: Record<string, { icon: typeof Check; color: string; activeColor: string }> =
      {
        [ATTENDANCE_STATUS.PRESENT]: {
          icon: Check,
          color: 'bg-green-500 hover:bg-green-600',
          activeColor: 'bg-green-600',
        },
        [ATTENDANCE_STATUS.ABSENT]: {
          icon: X,
          color: 'bg-red-500 hover:bg-red-600',
          activeColor: 'bg-red-600',
        },
        [ATTENDANCE_STATUS.LATE]: {
          icon: Clock,
          color: 'bg-yellow-500 hover:bg-yellow-600',
          activeColor: 'bg-yellow-600',
        },
        [ATTENDANCE_STATUS.EXCUSED]: {
          icon: FileQuestion,
          color: 'bg-blue-500 hover:bg-blue-600',
          activeColor: 'bg-blue-600',
        },
      };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Button
        size="sm"
        variant={isActive ? 'default' : 'outline'}
        className={isActive ? config.activeColor : ''}
        onClick={() => onMarkAttendance(studentId, status)}
        disabled={isLoading}
      >
        <Icon className="h-4 w-4" />
      </Button>
    );
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No students in this class.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No.</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>IC Number</TableHead>
            <TableHead className="text-center">Present</TableHead>
            <TableHead className="text-center">Absent</TableHead>
            <TableHead className="text-center">Late</TableHead>
            <TableHead className="text-center">Excused</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell className="text-muted-foreground">{student.icNumber || '-'}</TableCell>
              <TableCell className="text-center">
                {getStatusButton(student.id, ATTENDANCE_STATUS.PRESENT)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusButton(student.id, ATTENDANCE_STATUS.ABSENT)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusButton(student.id, ATTENDANCE_STATUS.LATE)}
              </TableCell>
              <TableCell className="text-center">
                {getStatusButton(student.id, ATTENDANCE_STATUS.EXCUSED)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
