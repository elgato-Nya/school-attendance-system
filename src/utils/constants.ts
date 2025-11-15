/**
 * @deprecated This file has been refactored and split into domain-specific modules
 * Please import from @/constants instead of @/utils/constants
 *
 * Migration Guide:
 * - import { ROLES } from '@/utils/constants'
 *   → import { ROLES } from '@/constants/user'
 *
 * All constants are now organized by domain in src/constants/
 * See ATTENDANCE_EDIT_AUDIT_SYSTEM.md for more details
 */

// Re-export everything from the new constants structure for backward compatibility
export * from '../constants/user';
export * from '../constants/attendance';
export * from '../constants/ui';
export * from '../constants/navigation';
