/**
 * Attendance Audit Trail Utilities
 * For tracking and displaying edit history
 */

import type { Attendance, EditHistory } from '@/types';
import { format } from 'date-fns';

export interface AttendanceAudit {
  attendanceId: string;
  classId: string;
  className: string;
  date: string;
  isEdited: boolean;
  editCount: number;
  originalSubmitter: string;
  lastEditor: string | null;
  lastEditDate: Date | null;
  editHistory: EditHistory[];
}

/**
 * Check if a record has been edited
 */
export function isEditedRecord(record: Attendance): boolean {
  return !!(record.editHistory && record.editHistory.length > 0);
}

/**
 * Get the total number of edits for a record
 */
export function getEditCount(record: Attendance): number {
  return record.editHistory?.length || 0;
}

/**
 * Get the last editor information
 */
export function getLastEditor(record: Attendance): {
  name: string;
  timestamp: Date;
  reason: string;
} | null {
  if (!record.editHistory || record.editHistory.length === 0) {
    return null;
  }

  const lastEdit = record.editHistory[record.editHistory.length - 1];
  return {
    name: lastEdit.editedByName,
    timestamp: lastEdit.editedAt.toDate(),
    reason: lastEdit.reason,
  };
}

/**
 * Get full audit information for a record
 */
export function getAuditInfo(record: Attendance): AttendanceAudit {
  const lastEditor = getLastEditor(record);

  return {
    attendanceId: record.id,
    classId: record.classId,
    className: record.className,
    date: record.date,
    isEdited: isEditedRecord(record),
    editCount: getEditCount(record),
    originalSubmitter: record.submittedByName,
    lastEditor: lastEditor?.name || null,
    lastEditDate: lastEditor?.timestamp || null,
    editHistory: record.editHistory || [],
  };
}

/**
 * Format edit history for display
 */
export function formatEditHistory(editHistory: EditHistory[]): string[] {
  return editHistory.map((edit, index) => {
    const timestamp = format(edit.editedAt.toDate(), 'dd/MM/yyyy HH:mm');
    const prevRate = edit.previousSummary.rate.toFixed(1);
    return `Edit ${index + 1} (${timestamp}): ${edit.editedByName} - "${edit.reason}" [Previous rate: ${prevRate}%]`;
  });
}

/**
 * Get summary changes between versions
 */
export function getSummaryChanges(
  previousSummary: EditHistory['previousSummary'],
  currentSummary: Attendance['summary']
): {
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
} {
  return {
    present: currentSummary.present - previousSummary.present,
    late: currentSummary.late - previousSummary.late,
    absent: currentSummary.absent - previousSummary.absent,
    excused: currentSummary.excused - previousSummary.excused,
    rate: Number((currentSummary.rate - previousSummary.rate).toFixed(2)),
  };
}

/**
 * Check if user can edit attendance (permission check)
 */
export function canEditAttendance(
  record: Attendance,
  userId: string,
  userRole: 'admin' | 'teacher'
): {
  allowed: boolean;
  reason?: string;
} {
  // Admins can always edit
  if (userRole === 'admin') {
    return { allowed: true };
  }

  // Teachers can only edit their own submissions
  if (userRole === 'teacher') {
    if (record.submittedBy === userId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'You can only edit attendance that you submitted',
    };
  }

  return {
    allowed: false,
    reason: 'Insufficient permissions',
  };
}

/**
 * Generate audit log message
 */
export function generateAuditLogMessage(
  record: Attendance,
  editorName: string,
  reason: string
): string {
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
  return `[${timestamp}] ${editorName} edited attendance for ${record.className} on ${record.date}. Reason: ${reason}`;
}
