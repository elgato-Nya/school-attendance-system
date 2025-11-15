import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock, FileQuestion } from 'lucide-react';
import type { AttendanceRecord } from '@/types';
import { ATTENDANCE_STATUS } from '@/utils/constants';

interface AttendanceSummaryProps {
  totalStudents: number;
  attendanceRecords: Map<string, AttendanceRecord>;
}

export function AttendanceSummary({ totalStudents, attendanceRecords }: AttendanceSummaryProps) {
  const summary = {
    total: totalStudents,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    unmarked: totalStudents,
  };

  attendanceRecords.forEach((record) => {
    switch (record.status) {
      case ATTENDANCE_STATUS.PRESENT:
        summary.present++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        summary.absent++;
        break;
      case ATTENDANCE_STATUS.LATE:
        summary.late++;
        break;
      case ATTENDANCE_STATUS.EXCUSED:
        summary.excused++;
        break;
    }
  });

  summary.unmarked =
    summary.total - summary.present - summary.absent - summary.late - summary.excused;

  const stats = [
    { label: 'Total Students', value: summary.total, icon: Users, color: 'text-blue-600' },
    { label: 'Present', value: summary.present, icon: UserCheck, color: 'text-green-600' },
    { label: 'Absent', value: summary.absent, icon: UserX, color: 'text-red-600' },
    { label: 'Late', value: summary.late, icon: Clock, color: 'text-yellow-600' },
    { label: 'Excused', value: summary.excused, icon: FileQuestion, color: 'text-blue-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
