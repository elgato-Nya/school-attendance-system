import { Timestamp } from 'firebase/firestore';
import type { UserRole, AttendanceStatus, HolidayType } from '../utils/constants.ts';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isSuperAdmin?: boolean; // Cannot be edited/deleted
  assignedClasses: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Student {
  id?: string; // Firestore document ID
  name: string;
  icNumber: string; // Malaysian IC: XXXXXX-XX-XXXX (unique identifier)
  dob: string; // YYYY-MM-DD
  guardianName: string;
  guardianContact: string; // 01X-XXXXXXX
  address?: string;
  classId: string; // Reference to class
  addedAt: Timestamp;
}

export interface Class {
  id: string;
  name: string; // e.g., "Science A"
  grade: number; // e.g., 1, 2, 3, 4, 5 (Form 1-5)
  teacherRep: string; // userId
  room?: string;
  qrCode?: string;
  qrSecret?: string;
  students: Student[];
  status: 'active' | 'archived'; // Archive instead of delete
  archivedAt?: Timestamp;
  archivedBy?: string;
  archivedReason?: string;
  academicYear?: string; // Future: "2024/2025"
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AttendanceRecord {
  icNumber: string; // Malaysian IC - unique identifier (replaces studentIndex)
  studentName: string; // denormalized
  status: AttendanceStatus;
  lateTime?: string; // HH:MM
  minutesLate?: number; // calculated minutes late
  remarks?: string;
}

export interface AttendanceSummary {
  total: number;
  present: number; // includes late
  late: number;
  absent: number;
  excused: number;
  rate: number; // percentage
  // For individual student summaries
  totalDays?: number;
  presentDays?: number;
  absentDays?: number;
  lateDays?: number;
  excusedDays?: number;
  attendanceRate?: number;
  averageMinutesLate?: number;
}

export interface EditHistory {
  editedBy: string;
  editedByName: string;
  editedAt: Timestamp;
  reason: string;
  previousSummary: AttendanceSummary;
}

export interface Attendance {
  id: string;
  classId: string;
  className: string; // denormalized
  date: string; // YYYY-MM-DD
  submittedBy: string;
  submittedByName: string; // denormalized
  timestamp: Timestamp;
  records: AttendanceRecord[];
  summary: AttendanceSummary;
  telegramSent: boolean;
  editHistory: EditHistory[];
  updatedAt?: Timestamp;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: HolidayType;
  isRecurring: boolean;
  createdAt: Timestamp;
}

export interface ClassMetrics {
  className: string;
  rate: number;
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface DashboardMetrics {
  date: string; // YYYY-MM-DD
  overall: {
    totalClasses: number;
    submittedClasses: number;
    totalStudents: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    overallRate: number;
  };
  byClass: Record<string, ClassMetrics>;
  alertClasses: string[]; // classIds with <85% rate
  lastUpdated: Timestamp;
}

export interface Settings {
  schoolName: string;
  lateThreshold: string; // HH:MM
  timezone: string;
  attendanceSettings: {
    allowBackdatedEntry: boolean;
    backdatedDaysLimit: number;
    consecutiveAbsenceAlert: number;
  };
  telegramSettings: {
    chatId: string;
    enabled: boolean;
  };
}

export interface FailedNotification {
  id: string;
  attendanceId: string;
  error: string;
  retryCount: number;
  createdAt: Timestamp;
  lastRetryAt?: Timestamp;
}

// Form interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserFormData {
  email: string;
  name: string;
  role: UserRole;
  assignedClasses: string[];
  password?: string; // Only for new users
}

export interface ClassFormData {
  name: string;
  grade: number;
  teacherRep: string;
}

export interface StudentFormData {
  name: string;
  icNumber: string;
  dob: string;
  guardianName: string;
  guardianContact: string;
  address?: string;
}

export interface StudentArchiveFormData {
  reason: 'Transferred' | 'Graduated' | 'Withdrawn' | 'Other';
  reasonDetails?: string;
}

export interface ArchivedStudent {
  id: string;
  studentData: Student;
  studentIcNumber: string; // For easy indexing/search
  originalClassId: string;
  originalClassName: string;
  archivedAt: Timestamp;
  archivedBy: string; // userId
  archivedByName: string;
  reason: 'Transferred' | 'Graduated' | 'Withdrawn' | 'Other';
  reasonDetails?: string; // Only if reason is 'Other'
  canRestore: boolean;
  attendanceSummary: AttendanceSummary; // Student's attendance history before archiving
}

export interface HolidayFormData {
  date: string;
  name: string;
  type: HolidayType;
  isRecurring: boolean;
}
