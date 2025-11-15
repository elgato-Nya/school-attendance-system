/**
 * User permissions and role checking
 */

import type { User } from '@/types';
import { ROLES } from '@/utils/constants';
import { getUserById } from './user.service';

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    return user?.isSuperAdmin === true;
  } catch (error) {
    console.error('Check super admin error:', error);
    return false;
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.role === ROLES.ADMIN;
}

/**
 * Check if user is teacher
 */
export function isTeacher(user: User): boolean {
  return user.role === ROLES.TEACHER;
}

/**
 * Check if teacher has access to a specific class
 */
export function hasClassAccess(user: User, classId: string): boolean {
  if (isAdmin(user)) {
    return true;
  }

  return (user.assignedClasses || []).includes(classId);
}
