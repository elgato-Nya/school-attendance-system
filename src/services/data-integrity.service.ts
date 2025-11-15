/**
 * Data Integrity Validation Service
 *
 * This service provides functions to check for orphaned references
 * and maintain data integrity across collections.
 */

import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase.config';

// Collection names
const CLASSES_COLLECTION = 'classes';
const USERS_COLLECTION = 'users';
const ATTENDANCE_COLLECTION = 'attendance';

export interface OrphanedReference {
  type: 'attendance' | 'class' | 'teacher';
  id: string;
  details: string;
}

export interface IntegrityReport {
  orphanedAttendance: OrphanedReference[];
  orphanedClassReferences: OrphanedReference[];
  orphanedTeacherReferences: OrphanedReference[];
  total: number;
}

/**
 * Check for attendance records referencing deleted classes
 */
export async function checkOrphanedAttendance(): Promise<OrphanedReference[]> {
  try {
    const orphaned: OrphanedReference[] = [];

    // Get all attendance records
    const attendanceSnapshot = await getDocs(collection(db, ATTENDANCE_COLLECTION));

    // Check each attendance record's classId
    for (const attendanceDoc of attendanceSnapshot.docs) {
      const attendance = attendanceDoc.data();
      const classId = attendance.classId;

      if (classId) {
        // Check if class exists
        const classDoc = await getDoc(doc(db, CLASSES_COLLECTION, classId));

        if (!classDoc.exists()) {
          orphaned.push({
            type: 'attendance',
            id: attendanceDoc.id,
            details: `Attendance record (${attendance.date}, ${attendance.className}) references non-existent class: ${classId}`,
          });
        }
      }
    }

    return orphaned;
  } catch (error) {
    console.error('Check orphaned attendance error:', error);
    throw error;
  }
}

/**
 * Check for classes with invalid teacher references
 */
export async function checkOrphanedTeacherReferences(): Promise<OrphanedReference[]> {
  try {
    const orphaned: OrphanedReference[] = [];

    // Get all classes
    const classesSnapshot = await getDocs(collection(db, CLASSES_COLLECTION));

    // Check each class's teacherRep
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const teacherId = classData.teacherRep;

      if (teacherId) {
        // Check if teacher exists
        const teacherDoc = await getDoc(doc(db, USERS_COLLECTION, teacherId));

        if (!teacherDoc.exists()) {
          orphaned.push({
            type: 'teacher',
            id: classDoc.id,
            details: `Class "${classData.name}" references non-existent teacher: ${teacherId}`,
          });
        }
      }
    }

    return orphaned;
  } catch (error) {
    console.error('Check orphaned teacher references error:', error);
    throw error;
  }
}

/**
 * Check for teachers with invalid class assignments
 */
export async function checkOrphanedClassReferences(): Promise<OrphanedReference[]> {
  try {
    const orphaned: OrphanedReference[] = [];

    // Get all users
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));

    // Check each teacher's assignedClasses
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const assignedClasses = userData.assignedClasses || [];

      if (assignedClasses.length > 0) {
        for (const classId of assignedClasses) {
          // Check if class exists
          const classDoc = await getDoc(doc(db, CLASSES_COLLECTION, classId));

          if (!classDoc.exists()) {
            orphaned.push({
              type: 'class',
              id: userDoc.id,
              details: `User "${userData.name}" has non-existent class in assignedClasses: ${classId}`,
            });
          }
        }
      }
    }

    return orphaned;
  } catch (error) {
    console.error('Check orphaned class references error:', error);
    throw error;
  }
}

/**
 * Run full integrity check and generate report
 */
export async function generateIntegrityReport(): Promise<IntegrityReport> {
  try {
    console.log('🔍 Running data integrity check...');

    const [orphanedAttendance, orphanedClassReferences, orphanedTeacherReferences] =
      await Promise.all([
        checkOrphanedAttendance(),
        checkOrphanedClassReferences(),
        checkOrphanedTeacherReferences(),
      ]);

    const total =
      orphanedAttendance.length + orphanedClassReferences.length + orphanedTeacherReferences.length;

    console.log(`✅ Integrity check complete. Found ${total} issues.`);

    return {
      orphanedAttendance,
      orphanedClassReferences,
      orphanedTeacherReferences,
      total,
    };
  } catch (error) {
    console.error('Generate integrity report error:', error);
    throw error;
  }
}

/**
 * Check if a class can be safely deleted
 */
export async function canDeleteClass(classId: string): Promise<{
  canDelete: boolean;
  reason?: string;
  attendanceCount?: number;
  studentCount?: number;
}> {
  try {
    // Check for attendance records
    const attendanceQuery = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classId', '==', classId)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceCount = attendanceSnapshot.size;

    if (attendanceCount > 0) {
      return {
        canDelete: false,
        reason: `Class has ${attendanceCount} attendance record(s). Archive instead to preserve history.`,
        attendanceCount,
      };
    }

    // Check for students
    const classDoc = await getDoc(doc(db, CLASSES_COLLECTION, classId));
    if (classDoc.exists()) {
      const classData = classDoc.data();
      const studentCount = classData.students?.length || 0;

      if (studentCount > 0) {
        return {
          canDelete: false,
          reason: `Class has ${studentCount} student(s). Remove or archive students first.`,
          studentCount,
        };
      }
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Can delete class check error:', error);
    throw error;
  }
}

/**
 * Check if a user/teacher can be safely deleted
 */
export async function canDeleteUser(userId: string): Promise<{
  canDelete: boolean;
  reason?: string;
  assignedClassCount?: number;
  assignedClasses?: string[];
}> {
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (!userDoc.exists()) {
      return {
        canDelete: false,
        reason: 'User not found',
      };
    }

    const userData = userDoc.data();
    const assignedClasses = userData.assignedClasses || [];

    if (assignedClasses.length > 0) {
      return {
        canDelete: false,
        reason: `Teacher has ${assignedClasses.length} assigned class(es). Reassign classes first.`,
        assignedClassCount: assignedClasses.length,
        assignedClasses,
      };
    }

    return { canDelete: true };
  } catch (error) {
    console.error('Can delete user check error:', error);
    throw error;
  }
}

/**
 * Get student count from a class (including attendance records)
 */
export async function getClassImpact(classId: string): Promise<{
  studentCount: number;
  attendanceRecordCount: number;
  teacherName?: string;
}> {
  try {
    // Get class data
    const classDoc = await getDoc(doc(db, CLASSES_COLLECTION, classId));

    if (!classDoc.exists()) {
      return { studentCount: 0, attendanceRecordCount: 0 };
    }

    const classData = classDoc.data();
    const studentCount = classData.students?.length || 0;

    // Get attendance records
    const attendanceQuery = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classId', '==', classId)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceRecordCount = attendanceSnapshot.size;

    // Get teacher name
    let teacherName: string | undefined;
    if (classData.teacherRep) {
      const teacherDoc = await getDoc(doc(db, USERS_COLLECTION, classData.teacherRep));
      if (teacherDoc.exists()) {
        teacherName = teacherDoc.data().name;
      }
    }

    return {
      studentCount,
      attendanceRecordCount,
      teacherName,
    };
  } catch (error) {
    console.error('Get class impact error:', error);
    throw error;
  }
}
