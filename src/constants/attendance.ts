/**
 * Attendance-related Constants
 */

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

// Thresholds and Limits
export const LATE_THRESHOLD = import.meta.env.VITE_LATE_THRESHOLD || '07:30';
export const ALERT_THRESHOLD = 85; // percentage
export const CONSECUTIVE_ABSENCE_ALERT = 3; // days

// Colors
export const ATTENDANCE_COLORS = {
  EXCELLENT: '#10b981', // >95% green
  // 85-95% orange
  POOR: '#ef4444', // <85% red
  HOLIDAY: '#FA8072', // holiday salmon red
} as const;

export const CHART_COLORS = {
  PRESENT: '#10b981',
  LATE: '#f59e0b',
  ABSENT: '#ef4444',
} as const;

// Edit Tracking
export const EDIT_REASON_REQUIRED = true;
export const EDIT_REASON_MIN_LENGTH = 10;
export const EDIT_REASON_MAX_LENGTH = 500;

export const EDIT_REASONS_PRESETS = [
  'Membetulkan kesilapan pemarkahan',
  'Murid memberikan surat tunjuk sebab lewat',
  'Kehadiran ditandakan salah',
  'Murid hadir tetapi ditandakan tidak hadir',
  'Kesilapan teknikal semasa pemarkahan awal',
  'Pembetulan pentadbiran',
  'Lain-lain (nyatakan di bawah)',
] as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_LONG: 'dd MMMM yyyy',
  FIRESTORE: 'yyyy-MM-dd',
  TIME: 'HH:mm',
} as const;

export const TIMEZONE = 'Asia/Kuala_Lumpur';

// Holiday Types
export const HOLIDAY_TYPES = {
  PUBLIC: 'public',
  SCHOOL: 'school',
  EVENT: 'event',
} as const;

export type HolidayType = (typeof HOLIDAY_TYPES)[keyof typeof HOLIDAY_TYPES];
