/**
 * Class update operations with cascading updates
 * Handles updating class information and propagating changes to related records
 */

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { updateClass } from './class.service';
import type { ClassFormData } from '@/types';

const ATTENDANCE_COLLECTION = 'attendance';
const USERS_COLLECTION = 'users';

interface UpdateClassResult {
  success: boolean;
  attendanceRecordsUpdated: number;
  teacherUpdated: boolean;
  error?: string;
}

/**
 * Update class information with cascading updates to attendance records
 * This function will:
 * 1. Update the class document
 * 2. Update className in all attendance records if name changed
 * 3. Remove/add classId from teacher's assignedClasses if teacher changed
 */
export async function updateClassWithCascade(
  classId: string,
  data: Partial<ClassFormData>,
  previousTeacherId?: string
): Promise<UpdateClassResult> {
  try {
    let attendanceRecordsUpdated = 0;
    let teacherUpdated = false;

    // Step 1: Update the class document
    await updateClass(classId, data);

    // Step 2: If class name changed, update all attendance records
    if (data.name) {
      attendanceRecordsUpdated = await updateAttendanceRecordsClassName(classId, data.name);
    }

    // Step 3: If teacher changed, update teacher assignments
    if (data.teacherRep && previousTeacherId !== data.teacherRep) {
      teacherUpdated = await updateTeacherAssignments(classId, previousTeacherId, data.teacherRep);
    }

    return {
      success: true,
      attendanceRecordsUpdated,
      teacherUpdated,
    };
  } catch (error) {
    console.error('Update class with cascade error:', error);
    return {
      success: false,
      attendanceRecordsUpdated: 0,
      teacherUpdated: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update className in all attendance records for a specific class
 */
async function updateAttendanceRecordsClassName(
  classId: string,
  newClassName: string
): Promise<number> {
  try {
    // Query all attendance records for this class
    const attendanceQuery = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classId', '==', classId)
    );

    const snapshot = await getDocs(attendanceQuery);

    if (snapshot.empty) {
      return 0;
    }

    // Use batch for efficient updates (max 500 operations per batch)
    const batchSize = 500;
    let updatedCount = 0;
    let batch = writeBatch(db);
    let operationCount = 0;

    for (const document of snapshot.docs) {
      const docRef = doc(db, ATTENDANCE_COLLECTION, document.id);
      batch.update(docRef, {
        className: newClassName,
        updatedAt: Timestamp.now(),
      });

      operationCount++;
      updatedCount++;

      // Commit batch if we reach the limit
      if (operationCount === batchSize) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    // Commit remaining operations
    if (operationCount > 0) {
      await batch.commit();
    }

    return updatedCount;
  } catch (error) {
    console.error('Update attendance records className error:', error);
    throw error;
  }
}

/**
 * Update teacher assignments when class teacher changes
 * Removes classId from previous teacher and adds to new teacher
 */
async function updateTeacherAssignments(
  classId: string,
  previousTeacherId: string | undefined,
  newTeacherId: string
): Promise<boolean> {
  try {
    // Remove from previous teacher's assignedClasses
    if (previousTeacherId) {
      const previousTeacherRef = doc(db, USERS_COLLECTION, previousTeacherId);
      const previousTeacherDoc = await getDocs(
        query(collection(db, USERS_COLLECTION), where('__name__', '==', previousTeacherId))
      );

      if (!previousTeacherDoc.empty) {
        const teacherData = previousTeacherDoc.docs[0].data();
        const assignedClasses = (teacherData.assignedClasses || []).filter(
          (id: string) => id !== classId
        );

        await updateDoc(previousTeacherRef, {
          assignedClasses,
          updatedAt: Timestamp.now(),
        });
      }
    }

    // Add to new teacher's assignedClasses
    const newTeacherRef = doc(db, USERS_COLLECTION, newTeacherId);
    const newTeacherDoc = await getDocs(
      query(collection(db, USERS_COLLECTION), where('__name__', '==', newTeacherId))
    );

    if (!newTeacherDoc.empty) {
      const teacherData = newTeacherDoc.docs[0].data();
      const assignedClasses = teacherData.assignedClasses || [];

      // Only add if not already assigned
      if (!assignedClasses.includes(classId)) {
        assignedClasses.push(classId);

        await updateDoc(newTeacherRef, {
          assignedClasses,
          updatedAt: Timestamp.now(),
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Update teacher assignments error:', error);
    throw error;
  }
}

/**
 * Get the count of attendance records that would be affected by a class name change
 */
export async function getAttendanceRecordCount(classId: string): Promise<number> {
  try {
    const attendanceQuery = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classId', '==', classId)
    );

    const snapshot = await getDocs(attendanceQuery);
    return snapshot.size;
  } catch (error) {
    console.error('Get attendance record count error:', error);
    return 0;
  }
}
