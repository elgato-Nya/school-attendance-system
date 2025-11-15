/**
 * User validation and business logic checks
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { getAllAdmins } from './user.service';

const USERS_COLLECTION = 'users';

/**
 * Get count of all admins
 */
export async function getAdminCount(): Promise<number> {
  try {
    const admins = await getAllAdmins();
    return admins.length;
  } catch (error) {
    console.error('Get admin count error:', error);
    return 0;
  }
}

/**
 * Check if email is already in use by another user
 */
export async function isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    // If excluding a user (for updates), check if email belongs to someone else
    if (excludeUserId) {
      return querySnapshot.docs.some((doc) => doc.id !== excludeUserId);
    }

    return !querySnapshot.empty;
  } catch (error) {
    console.error('Check email taken error:', error);
    return false;
  }
}

/**
 * Check if teacher is assigned to any active classes
 */
export async function getTeacherClassCount(
  userId: string
): Promise<{ count: number; classNames: string[] }> {
  try {
    const { getActiveClasses } = await import('../class/class.service');
    const activeClasses = await getActiveClasses();

    const assignedClasses = activeClasses.filter((c) => c.teacherRep === userId);

    return {
      count: assignedClasses.length,
      classNames: assignedClasses.map((c) => c.name),
    };
  } catch (error) {
    console.error('Get teacher class count error:', error);
    return { count: 0, classNames: [] };
  }
}
