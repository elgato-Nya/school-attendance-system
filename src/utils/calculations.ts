/**
 * Calculation utilities for attendance statistics and metrics
 */

import type { AttendanceRecord, AttendanceSummary } from '@/types';
import { ATTENDANCE_STATUS } from './constants';

/**
 * Calculate attendance rate percentage
 * @param present Number of present days
 * @param total Total number of days
 * @returns Attendance rate as a percentage (0-100)
 */
export function calculateAttendanceRate(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate total present days from attendance records
 * @param records Array of attendance records
 * @returns Number of present days (including late)
 */
export function calculatePresentDays(records: AttendanceRecord[]): number {
  return records.filter(
    (record) =>
      record.status === ATTENDANCE_STATUS.PRESENT || record.status === ATTENDANCE_STATUS.LATE
  ).length;
}

/**
 * Calculate total absent days from attendance records
 * @param records Array of attendance records
 * @returns Number of absent days
 */
export function calculateAbsentDays(records: AttendanceRecord[]): number {
  return records.filter((record) => record.status === ATTENDANCE_STATUS.ABSENT).length;
}

/**
 * Calculate total late days from attendance records
 * @param records Array of attendance records
 * @returns Number of late days
 */
export function calculateLateDays(records: AttendanceRecord[]): number {
  return records.filter((record) => record.status === ATTENDANCE_STATUS.LATE).length;
}

/**
 * Calculate total excused days from attendance records
 * @param records Array of attendance records
 * @returns Number of excused absence days
 */
export function calculateExcusedDays(records: AttendanceRecord[]): number {
  return records.filter((record) => record.status === ATTENDANCE_STATUS.EXCUSED).length;
}

/**
 * Calculate average minutes late from attendance records
 * @param records Array of attendance records
 * @returns Average minutes late, or 0 if no late records
 */
export function calculateAverageMinutesLate(records: AttendanceRecord[]): number {
  const lateRecords = records.filter(
    (record) => record.status === ATTENDANCE_STATUS.LATE && record.minutesLate != null
  );

  if (lateRecords.length === 0) return 0;

  const totalMinutes = lateRecords.reduce((sum, record) => sum + (record.minutesLate || 0), 0);

  return Math.round(totalMinutes / lateRecords.length);
}

/**
 * Generate attendance summary from records (for individual students over time)
 * @param records Array of attendance records
 * @returns AttendanceSummary object with calculated statistics
 */
export function generateAttendanceSummary(records: AttendanceRecord[]): AttendanceSummary {
  const presentDays = calculatePresentDays(records);
  const absentDays = calculateAbsentDays(records);
  const lateDays = calculateLateDays(records);
  const excusedDays = calculateExcusedDays(records);
  const totalDays = records.length;
  const attendanceRate = calculateAttendanceRate(presentDays, totalDays);
  const averageMinutesLate = calculateAverageMinutesLate(records);

  return {
    total: totalDays,
    present: presentDays,
    late: lateDays,
    absent: absentDays,
    excused: excusedDays,
    rate: attendanceRate,
    // Individual student fields
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    excusedDays,
    attendanceRate,
    averageMinutesLate,
  };
}

/**
 * Calculate class attendance rate for a specific date
 * @param records Array of attendance records for all students
 * @param totalStudents Total number of students in the class
 * @returns Attendance rate as a percentage (0-100)
 */
export function calculateClassAttendanceRate(
  records: AttendanceRecord[],
  totalStudents: number
): number {
  if (totalStudents === 0) return 0;

  const presentCount = records.filter(
    (record) =>
      record.status === ATTENDANCE_STATUS.PRESENT || record.status === ATTENDANCE_STATUS.LATE
  ).length;

  return calculateAttendanceRate(presentCount, totalStudents);
}

/**
 * Calculate school-wide statistics from multiple class summaries
 * @param summaries Array of attendance summaries for all classes
 * @returns Aggregated statistics
 */
export function calculateSchoolStatistics(summaries: AttendanceSummary[]): {
  totalStudents: number;
  averageAttendanceRate: number;
  totalAbsences: number;
  totalLateArrivals: number;
} {
  if (summaries.length === 0) {
    return {
      totalStudents: 0,
      averageAttendanceRate: 0,
      totalAbsences: 0,
      totalLateArrivals: 0,
    };
  }

  const totalStudents = summaries.length;
  const totalAbsences = summaries.reduce(
    (sum, summary) => sum + (summary.absentDays || summary.absent || 0),
    0
  );
  const totalLateArrivals = summaries.reduce(
    (sum, summary) => sum + (summary.lateDays || summary.late || 0),
    0
  );
  const averageAttendanceRate =
    summaries.reduce((sum, summary) => sum + (summary.attendanceRate || summary.rate || 0), 0) /
    totalStudents;

  return {
    totalStudents,
    averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
    totalAbsences,
    totalLateArrivals,
  };
}

/**
 * Determine attendance status color for UI display
 * @param status Attendance status
 * @returns Tailwind color class
 */
export function getAttendanceStatusColor(
  status: string
): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' {
  switch (status) {
    case ATTENDANCE_STATUS.PRESENT:
      return 'success';
    case ATTENDANCE_STATUS.LATE:
      return 'warning';
    case ATTENDANCE_STATUS.ABSENT:
      return 'destructive';
    case ATTENDANCE_STATUS.EXCUSED:
      return 'secondary';
    default:
      return 'default';
  }
}

/**
 * Check if attendance rate is below threshold
 * @param attendanceRate Attendance rate as percentage
 * @param threshold Minimum acceptable rate (default from constants)
 * @returns True if below threshold
 */
export function isBelowAttendanceThreshold(
  attendanceRate: number,
  threshold: number = 75
): boolean {
  return attendanceRate < threshold;
}

/**
 * Calculate trend between two attendance rates
 * @param currentRate Current attendance rate
 * @param previousRate Previous attendance rate
 * @returns Trend direction and percentage change
 */
export function calculateAttendanceTrend(
  currentRate: number,
  previousRate: number
): {
  direction: 'up' | 'down' | 'stable';
  change: number;
} {
  const change = Math.round((currentRate - previousRate) * 100) / 100;

  if (Math.abs(change) < 0.5) {
    return { direction: 'stable', change: 0 };
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    change: Math.abs(change),
  };
}
