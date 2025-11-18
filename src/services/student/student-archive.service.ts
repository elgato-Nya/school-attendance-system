/**
 * Student archive operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import type { ArchivedStudent, Student, AttendanceSummary } from '@/types';
import { getAttendanceHistory } from '../attendance.service';
import { ATTENDANCE_STATUS } from '@/utils/constants';

const ARCHIVED_STUDENTS_COLLECTION = 'archivedStudents';

/**
 * Calculate attendance summary for a student
 */
async function calculateStudentAttendanceSummary(
  classId: string,
  icNumber: string
): Promise<AttendanceSummary> {
  try {
    const attendanceHistory = await getAttendanceHistory(classId);

    let totalDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let lateDays = 0;
    let excusedDays = 0;
    let totalMinutesLate = 0;

    attendanceHistory.forEach((attendance) => {
      const record = attendance.records.find((r) => r.icNumber === icNumber);
      if (record) {
        totalDays++;
        switch (record.status) {
          case ATTENDANCE_STATUS.PRESENT:
            presentDays++;
            break;
          case ATTENDANCE_STATUS.ABSENT:
            absentDays++;
            break;
          case ATTENDANCE_STATUS.LATE:
            lateDays++;
            presentDays++; // Late counts as present
            if (record.minutesLate) {
              totalMinutesLate += record.minutesLate;
            }
            break;
          case ATTENDANCE_STATUS.EXCUSED:
            excusedDays++;
            break;
        }
      }
    });

    const attendanceRate =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100 * 100) / 100 : 0;
    const averageMinutesLate = lateDays > 0 ? Math.round(totalMinutesLate / lateDays) : 0;

    return {
      total: totalDays,
      present: presentDays,
      late: lateDays,
      absent: absentDays,
      excused: excusedDays,
      rate: attendanceRate,
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendanceRate,
      averageMinutesLate,
    };
  } catch (error) {
    console.error('Calculate student attendance summary error:', error);
    return {
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      rate: 0,
    };
  }
}

/**
 * Archive a student from a class
 */
export async function archiveStudent(
  studentData: Student,
  classId: string,
  className: string,
  archivedBy: string,
  archivedByName: string,
  reason: 'Transferred' | 'Graduated' | 'Withdrawn' | 'Other',
  reasonDetails?: string
): Promise<string> {
  try {
    // Calculate attendance summary using icNumber
    const attendanceSummary = await calculateStudentAttendanceSummary(
      classId,
      studentData.icNumber
    );

    // Build archived student object (exclude undefined fields for Firestore)
    const archivedStudent: any = {
      studentData,
      studentIcNumber: studentData.icNumber,
      originalClassId: classId,
      originalClassName: className,
      archivedAt: Timestamp.now(),
      archivedBy,
      archivedByName,
      reason,
      canRestore: true,
      attendanceSummary,
    };

    // Only add reasonDetails if it has a value (Firestore doesn't accept undefined)
    if (reasonDetails && reasonDetails.trim()) {
      archivedStudent.reasonDetails = reasonDetails;
    }

    // Use IC number + timestamp as document ID for easy lookup
    const docId = `${classId}_${studentData.icNumber}_${Date.now()}`;
    await setDoc(doc(db, ARCHIVED_STUDENTS_COLLECTION, docId), archivedStudent);

    return docId;
  } catch (error) {
    console.error('Archive student error:', error);
    throw error;
  }
}

/**
 * Get all archived students
 */
export async function getAllArchivedStudents(): Promise<ArchivedStudent[]> {
  try {
    const q = query(collection(db, ARCHIVED_STUDENTS_COLLECTION), orderBy('archivedAt', 'desc'));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ArchivedStudent);
  } catch (error) {
    console.error('Get all archived students error:', error);
    throw error;
  }
}

/**
 * Get archived students by class
 */
export async function getArchivedStudentsByClass(classId: string): Promise<ArchivedStudent[]> {
  try {
    const q = query(
      collection(db, ARCHIVED_STUDENTS_COLLECTION),
      where('originalClassId', '==', classId),
      orderBy('archivedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ArchivedStudent);
  } catch (error) {
    console.error('Get archived students by class error:', error);
    throw error;
  }
}

/**
 * Get archived student by IC number
 */
export async function getArchivedStudentByIc(icNumber: string): Promise<ArchivedStudent[]> {
  try {
    const q = query(
      collection(db, ARCHIVED_STUDENTS_COLLECTION),
      where('studentIcNumber', '==', icNumber),
      orderBy('archivedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ArchivedStudent);
  } catch (error) {
    console.error('Get archived student by IC error:', error);
    throw error;
  }
}

/**
 * Permanently delete archived student (admin only)
 */
export async function permanentlyDeleteArchivedStudent(archivedStudentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ARCHIVED_STUDENTS_COLLECTION, archivedStudentId));
  } catch (error) {
    console.error('Permanently delete archived student error:', error);
    throw error;
  }
}

/**
 * Restore archived student to a class
 */
export async function restoreArchivedStudent(
  archivedStudentId: string,
  targetClassId: string
): Promise<void> {
  try {
    const archivedDoc = await getDoc(doc(db, ARCHIVED_STUDENTS_COLLECTION, archivedStudentId));
    if (!archivedDoc.exists()) {
      throw new Error('Archived student not found');
    }

    const archivedStudent = archivedDoc.data() as ArchivedStudent;

    // Add student back to class
    const { addStudentToClass } = await import('../class/class.service');
    await addStudentToClass(targetClassId, {
      name: archivedStudent.studentData.name,
      icNumber: archivedStudent.studentData.icNumber,
      dob: archivedStudent.studentData.dob,
      guardianName: archivedStudent.studentData.guardianName,
      guardianContact: archivedStudent.studentData.guardianContact,
      address: archivedStudent.studentData.address,
    });

    // Delete from archived collection
    await deleteDoc(doc(db, ARCHIVED_STUDENTS_COLLECTION, archivedStudentId));
  } catch (error) {
    console.error('Restore archived student error:', error);
    throw error;
  }
}
