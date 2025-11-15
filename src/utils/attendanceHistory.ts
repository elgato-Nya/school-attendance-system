/**
 * @deprecated This file has been refactored into domain-specific modules
 * Please import from specific @/utils/attendance/* files instead
 *
 * Migration Guide:
 * - import { getLatestVersions } from '@/utils/attendanceHistory'
 *   → import { getLatestVersions } from '@/utils/attendance/filters'
 *
 * - import { isEditedRecord } from '@/utils/attendanceHistory'
 *   → import { isEditedRecord } from '@/utils/attendance/audit'
 *
 * New organized structure:
 * - @/utils/attendance/filters - View modes and filtering
 * - @/utils/attendance/statistics - Accurate calculations
 * - @/utils/attendance/audit - Edit history and tracking
 * - @/utils/attendance/validation - Edit validation rules
 */

// Re-export from new location for backward compatibility
export * from '@/utils/attendance/filters';
export * from '@/utils/attendance/statistics';
export * from '@/utils/attendance/audit';
export * from '@/utils/attendance/validation';
