/**
 * Student Archive Service
 * Handles archiving and unarchiving students
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

const COLLECTION_NAME = 'students';

/**
 * Archive a student
 * Sets archived flag to true and records who archived it
 */
export async function archiveStudent(studentId: string, reason?: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, {
      archived: true,
      archivedAt: Timestamp.now(),
      archivedReason: reason || 'Archived by admin',
    });
  } catch (error) {
    console.error('Archive student error:', error);
    throw error;
  }
}

/**
 * Unarchive/restore a student
 * Removes archived flag
 */
export async function unarchiveStudent(studentId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, {
      archived: false,
      archivedAt: null,
      archivedReason: null,
      restoredAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Unarchive student error:', error);
    throw error;
  }
}

/**
 * Bulk archive students
 */
export async function archiveStudents(
  studentIds: string[],
  reason?: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const studentId of studentIds) {
    try {
      await archiveStudent(studentId, reason);
      success++;
    } catch (error) {
      console.error(`Failed to archive student ${studentId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Bulk unarchive students
 */
export async function unarchiveStudents(
  studentIds: string[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const studentId of studentIds) {
    try {
      await unarchiveStudent(studentId);
      success++;
    } catch (error) {
      console.error(`Failed to unarchive student ${studentId}:`, error);
      failed++;
    }
  }

  return { success, failed };
}
