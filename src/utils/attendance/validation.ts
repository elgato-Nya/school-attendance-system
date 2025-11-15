/**
 * Attendance Edit Validation
 * Ensures data integrity when editing attendance
 */

import { EDIT_REASON_MIN_LENGTH, EDIT_REASON_MAX_LENGTH } from '@/constants/attendance';

export interface EditValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate edit reason
 */
export function validateEditReason(reason: string): EditValidationResult {
  const errors: string[] = [];

  if (!reason || reason.trim().length === 0) {
    errors.push('Edit reason is required');
  } else if (reason.trim().length < EDIT_REASON_MIN_LENGTH) {
    errors.push(`Edit reason must be at least ${EDIT_REASON_MIN_LENGTH} characters`);
  } else if (reason.length > EDIT_REASON_MAX_LENGTH) {
    errors.push(`Edit reason must not exceed ${EDIT_REASON_MAX_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that attendance data has meaningful changes
 */
export function hasSignificantChanges(originalRecords: any[], newRecords: any[]): boolean {
  if (originalRecords.length !== newRecords.length) {
    return true;
  }

  // Check if any student's status changed
  for (let i = 0; i < originalRecords.length; i++) {
    const original = originalRecords[i];
    const updated = newRecords[i];

    if (
      original.status !== updated.status ||
      original.lateTime !== updated.lateTime ||
      original.remarks !== updated.remarks
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Validate edit permission based on time constraints
 */
export function canEditByTimeConstraint(
  submissionDate: string,
  allowBackdated: boolean = false,
  backdatedDaysLimit: number = 7
): {
  allowed: boolean;
  reason?: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subDate = new Date(submissionDate);
  subDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24));

  // Can edit today's attendance
  if (daysDiff === 0) {
    return { allowed: true };
  }

  // Check backdated settings
  if (!allowBackdated) {
    return {
      allowed: false,
      reason: 'Editing past attendance is not allowed by system settings',
    };
  }

  if (daysDiff > backdatedDaysLimit) {
    return {
      allowed: false,
      reason: `Can only edit attendance within ${backdatedDaysLimit} days`,
    };
  }

  return { allowed: true };
}
