/**
 * User class assignment operations
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { getUserById } from './user.service';

const USERS_COLLECTION = 'users';

/**
 * Assign classes to a teacher
 */
export async function assignClassesToTeacher(userId: string, classIds: string[]): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      assignedClasses: classIds,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Assign classes to teacher error:', error);
    throw error;
  }
}

/**
 * Add a class to teacher's assigned classes
 */
export async function addClassToTeacher(userId: string, classId: string): Promise<void> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const assignedClasses = user.assignedClasses || [];
    if (!assignedClasses.includes(classId)) {
      assignedClasses.push(classId);
      await assignClassesToTeacher(userId, assignedClasses);
    }
  } catch (error) {
    console.error('Add class to teacher error:', error);
    throw error;
  }
}

/**
 * Remove a class from teacher's assigned classes
 */
export async function removeClassFromTeacher(userId: string, classId: string): Promise<void> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const assignedClasses = (user.assignedClasses || []).filter((id) => id !== classId);
    await assignClassesToTeacher(userId, assignedClasses);
  } catch (error) {
    console.error('Remove class from teacher error:', error);
    throw error;
  }
}
