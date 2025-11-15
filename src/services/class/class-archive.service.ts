/**
 * Class archive operations
 */

import { doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { getClassById } from './class.service';
import { CLASS_STATUS } from '@/utils/constants';

const CLASSES_COLLECTION = 'classes';

/**
 * Archive a class (soft delete)
 */
export async function archiveClass(
  classId: string,
  archivedBy: string,
  reason?: string
): Promise<void> {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await updateDoc(docRef, {
      status: CLASS_STATUS.ARCHIVED,
      archivedAt: Timestamp.now(),
      archivedBy,
      archivedReason: reason || 'No reason provided',
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Archive class error:', error);
    throw error;
  }
}

/**
 * Restore archived class
 */
export async function restoreClass(classId: string): Promise<void> {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await updateDoc(docRef, {
      status: CLASS_STATUS.ACTIVE,
      archivedAt: null,
      archivedBy: null,
      archivedReason: null,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Restore class error:', error);
    throw error;
  }
}

/**
 * Permanently delete archived class (admin only, from archive page)
 */
export async function permanentlyDeleteClass(classId: string): Promise<void> {
  try {
    const classDoc = await getClassById(classId);
    if (!classDoc) {
      throw new Error('Class not found');
    }

    if (classDoc.status !== CLASS_STATUS.ARCHIVED) {
      throw new Error('Can only permanently delete archived classes');
    }

    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Permanently delete class error:', error);
    throw error;
  }
}
