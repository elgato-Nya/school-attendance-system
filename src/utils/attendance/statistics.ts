/**
 * Attendance Statistics Calculations
 * Database now ensures one record per class+date (no duplicates)
 */

import type { Attendance, AttendanceSummary } from '@/types';

/**
 * Calculate attendance statistics
 * Note: No filtering needed - database guarantees one record per class+date
 */
export function calculateAccurateStats(records: Attendance[]): {
  totalRecords: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  totalStudents: number;
  attendanceRate: number;
  averageClassSize: number;
} {
  // Direct calculation - no filtering needed
  const totalPresent = records.reduce((sum, r) => sum + (r.summary?.present || 0), 0);
  const totalAbsent = records.reduce((sum, r) => sum + (r.summary?.absent || 0), 0);
  const totalLate = records.reduce((sum, r) => sum + (r.summary?.late || 0), 0);
  const totalExcused = records.reduce((sum, r) => sum + (r.summary?.excused || 0), 0);

  const totalStudents = totalPresent + totalAbsent + totalLate + totalExcused;
  const attendanceRate = totalStudents > 0 ? ((totalPresent + totalLate) / totalStudents) * 100 : 0;

  const averageClassSize = records.length > 0 ? totalStudents / records.length : 0;

  return {
    totalRecords: records.length,
    totalPresent,
    totalAbsent,
    totalLate,
    totalExcused,
    totalStudents,
    attendanceRate: Number(attendanceRate.toFixed(2)),
    averageClassSize: Number(averageClassSize.toFixed(1)),
  };
}

/**
 * Calculate statistics for a specific student across multiple attendance records
 */
export function calculateStudentStats(icNumber: string, records: Attendance[]): AttendanceSummary {
  // Direct calculation - no filtering needed
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  let excusedDays = 0;
  let totalMinutesLate = 0;
  let lateCount = 0;

  records.forEach((attendance) => {
    const studentRecord = attendance.records.find((r) => r.icNumber === icNumber);
    if (studentRecord) {
      switch (studentRecord.status) {
        case 'present':
          presentDays++;
          break;
        case 'absent':
          absentDays++;
          break;
        case 'late':
          lateDays++;
          if (studentRecord.minutesLate) {
            totalMinutesLate += studentRecord.minutesLate;
            lateCount++;
          }
          break;
        case 'excused':
          excusedDays++;
          break;
      }
    }
  });

  const totalDays = records.length;
  const attendanceRate = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

  const averageMinutesLate = lateCount > 0 ? totalMinutesLate / lateCount : 0;

  return {
    total: totalDays,
    present: presentDays,
    late: lateDays,
    absent: absentDays,
    excused: excusedDays,
    rate: Number(attendanceRate.toFixed(2)),
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    excusedDays,
    attendanceRate: Number(attendanceRate.toFixed(2)),
    averageMinutesLate: Number(averageMinutesLate.toFixed(1)),
  };
}

/**
 * Calculate daily statistics across all classes
 */
export function calculateDailyStats(records: Attendance[]): {
  totalClasses: number;
  totalStudents: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
} {
  // Direct calculation - no filtering needed
  const totalStudents = records.reduce((sum, r) => sum + r.summary.total, 0);
  const present = records.reduce((sum, r) => sum + r.summary.present, 0);
  const late = records.reduce((sum, r) => sum + r.summary.late, 0);
  const absent = records.reduce((sum, r) => sum + r.summary.absent, 0);
  const excused = records.reduce((sum, r) => sum + r.summary.excused, 0);

  const rate = totalStudents > 0 ? ((present + late) / totalStudents) * 100 : 0;

  return {
    totalClasses: records.length,
    totalStudents,
    present,
    late,
    absent,
    excused,
    rate: Number(rate.toFixed(2)),
  };
}
