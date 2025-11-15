import type { Attendance, Class } from '@/types';
import { toast } from 'sonner';

export function exportAttendanceToCSV(
  records: Attendance[],
  selectedClass: Class,
  startDate: string,
  endDate: string
) {
  if (records.length === 0) {
    toast.error('No records to export');
    return;
  }

  // Create CSV headers
  const headers = [
    'Date',
    'Class',
    'Total Students',
    'Present',
    'Late',
    'Absent',
    'Excused',
    'Attendance Rate',
    'Submitted By',
    'Submission Time',
  ];

  // Create CSV rows
  const rows = records.map((record) => [
    record.date,
    record.className,
    record.summary.total,
    record.summary.present,
    record.summary.late,
    record.summary.absent,
    record.summary.excused,
    `${record.summary.rate}%`,
    record.submittedByName,
    new Date(record.timestamp.seconds * 1000).toLocaleString(),
  ]);

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance_${selectedClass.name}_${startDate}_to_${endDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success('Attendance history exported successfully');
}
