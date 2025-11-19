/**
 * User-related Constants
 */

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Class Status
export const CLASS_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const;

export type ClassStatus = (typeof CLASS_STATUS)[keyof typeof CLASS_STATUS];

// Student Archive Reasons
export const ARCHIVE_REASONS = {
  TRANSFERRED: 'Dipindahkan',
  GRADUATED: 'Tamat Pengajian',
  WITHDRAWN: 'Ditarik Balik',
  OTHER: 'Lain-lain',
} as const;

export type ArchiveReason = (typeof ARCHIVE_REASONS)[keyof typeof ARCHIVE_REASONS];
