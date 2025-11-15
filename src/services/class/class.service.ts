/**
 * Core class CRUD operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  arrayUnion,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import type { Class, ClassFormData, StudentFormData, Student } from '@/types';
import { CLASS_STATUS } from '@/utils/constants';

const CLASSES_COLLECTION = 'classes';

/**
 * Get all classes (active and archived)
 */
export async function getAllClasses(): Promise<Class[]> {
  try {
    const querySnapshot = await getDocs(collection(db, CLASSES_COLLECTION));

    const classes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Class);

    // Sort client-side to avoid Firestore index requirement
    return classes.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Get all classes error:', error);
    throw error;
  }
}

/**
 * Get all active classes only
 */
export async function getActiveClasses(): Promise<Class[]> {
  try {
    const q = query(collection(db, CLASSES_COLLECTION), where('status', '==', CLASS_STATUS.ACTIVE));

    const querySnapshot = await getDocs(q);
    const classes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Class);

    // Sort client-side to avoid Firestore index requirement
    return classes.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Get active classes error:', error);
    throw error;
  }
}

/**
 * Get all archived classes
 */
export async function getArchivedClasses(): Promise<Class[]> {
  try {
    const q = query(
      collection(db, CLASSES_COLLECTION),
      where('status', '==', CLASS_STATUS.ARCHIVED)
    );

    const querySnapshot = await getDocs(q);
    const classes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Class);

    // Sort client-side by archivedAt (most recent first)
    return classes.sort((a, b) => {
      const aTime = a.archivedAt?.toMillis() || 0;
      const bTime = b.archivedAt?.toMillis() || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Get archived classes error:', error);
    throw error;
  }
}

/**
 * Get class by ID
 */
export async function getClassById(classId: string): Promise<Class | null> {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Class;
  } catch (error) {
    console.error('Get class by ID error:', error);
    throw error;
  }
}

/**
 * Get classes assigned to a teacher
 */
export async function getClassesByTeacher(teacherId: string): Promise<Class[]> {
  try {
    const q = query(
      collection(db, CLASSES_COLLECTION),
      where('teacherRep', '==', teacherId),
      where('status', '==', CLASS_STATUS.ACTIVE)
    );

    const querySnapshot = await getDocs(q);

    const classes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Class);

    // Sort client-side to avoid Firestore index requirement
    return classes.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Get classes by teacher error:', error);
    throw error;
  }
}

/**
 * Create a new class
 */
export async function createClass(data: ClassFormData): Promise<string> {
  try {
    const now = Timestamp.now();

    const classData: Omit<Class, 'id'> = {
      name: data.name,
      grade: data.grade,
      teacherRep: data.teacherRep,
      students: [],
      status: CLASS_STATUS.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, CLASSES_COLLECTION), classData);
    return docRef.id;
  } catch (error) {
    console.error('Create class error:', error);
    throw error;
  }
}

/**
 * Update class information
 */
export async function updateClass(classId: string, data: Partial<ClassFormData>): Promise<void> {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Update class error:', error);
    throw error;
  }
}

/**
 * Delete a class with cascade handling
 *
 * This function will:
 * 1. Check if attendance records exist
 * 2. Remove classId from teacher's assignedClasses
 * 3. Delete the class document
 *
 * @throws Error if attendance records exist (must be archived first)
 */
export async function deleteClass(classId: string): Promise<void> {
  try {
    // Step 1: Check if attendance records exist
    const hasAttendance = await hasAttendanceRecords(classId);
    if (hasAttendance) {
      throw new Error(
        'Cannot delete class with attendance records. Please archive the class instead to preserve historical data.'
      );
    }

    // Step 2: Get class data to find the teacher
    const classData = await getClassById(classId);
    if (classData && classData.teacherRep) {
      // Remove this class from teacher's assignedClasses
      const { getUserById } = await import('../user/user.service');
      const { updateUser } = await import('../user/user.service');

      const teacher = await getUserById(classData.teacherRep);
      if (teacher && teacher.assignedClasses) {
        const updatedClasses = teacher.assignedClasses.filter((id) => id !== classId);
        await updateUser(teacher.id!, { assignedClasses: updatedClasses });
      }
    }

    // Step 3: Delete the class document
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Delete class error:', error);
    throw error;
  }
}

/**
 * Add a student to a class
 */
export async function addStudentToClass(
  classId: string,
  studentData: StudentFormData
): Promise<void> {
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);

    const student: Student = {
      name: studentData.name,
      icNumber: studentData.icNumber,
      dob: studentData.dob,
      guardianName: studentData.guardianName,
      guardianContact: studentData.guardianContact,
      address: studentData.address,
      classId: classId, // Add classId reference
      addedAt: Timestamp.now(),
    };

    await updateDoc(docRef, {
      students: arrayUnion(student),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Add student to class error:', error);
    throw error;
  }
}

/**
 * Update a student in a class (by index)
 */
export async function updateStudent(
  classId: string,
  studentIndex: number,
  studentData: Partial<StudentFormData>
): Promise<void> {
  try {
    const classDoc = await getClassById(classId);

    if (!classDoc) {
      throw new Error('Class not found');
    }

    if (studentIndex < 0 || studentIndex >= classDoc.students.length) {
      throw new Error('Invalid student index');
    }

    // Update the student at the specific index
    const updatedStudents = [...classDoc.students];
    updatedStudents[studentIndex] = {
      ...updatedStudents[studentIndex],
      ...studentData,
    };

    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await updateDoc(docRef, {
      students: updatedStudents,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Update student error:', error);
    throw error;
  }
}

/**
 * Remove a student from a class (by index)
 */
export async function removeStudentFromClass(classId: string, studentIndex: number): Promise<void> {
  try {
    const classDoc = await getClassById(classId);

    if (!classDoc) {
      throw new Error('Class not found');
    }

    if (studentIndex < 0 || studentIndex >= classDoc.students.length) {
      throw new Error('Invalid student index');
    }

    // Remove student at the specific index
    const updatedStudents = classDoc.students.filter((_, index) => index !== studentIndex);

    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await updateDoc(docRef, {
      students: updatedStudents,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Remove student from class error:', error);
    throw error;
  }
}

/**
 * Get student by class ID and index
 */
export async function getStudent(classId: string, studentIndex: number): Promise<Student | null> {
  try {
    const classDoc = await getClassById(classId);

    if (!classDoc) {
      return null;
    }

    if (studentIndex < 0 || studentIndex >= classDoc.students.length) {
      return null;
    }

    return classDoc.students[studentIndex];
  } catch (error) {
    console.error('Get student error:', error);
    throw error;
  }
}

/**
 * Search students across all classes
 */
export async function searchStudents(searchTerm: string): Promise<
  Array<{
    student: Student;
    classId: string;
    className: string;
    studentIndex: number;
  }>
> {
  try {
    const allClasses = await getActiveClasses();
    const results: Array<{
      student: Student;
      classId: string;
      className: string;
      studentIndex: number;
    }> = [];

    const searchLower = searchTerm.toLowerCase();

    allClasses.forEach((classDoc) => {
      classDoc.students.forEach((student, index) => {
        if (
          student.name.toLowerCase().includes(searchLower) ||
          student.icNumber.includes(searchTerm) ||
          student.guardianContact.includes(searchTerm)
        ) {
          results.push({
            student,
            classId: classDoc.id,
            className: classDoc.name,
            studentIndex: index,
          });
        }
      });
    });

    return results;
  } catch (error) {
    console.error('Search students error:', error);
    throw error;
  }
}

/**
 * Get total student count across all active classes
 */
export async function getTotalStudentCount(): Promise<number> {
  try {
    const activeClasses = await getActiveClasses();
    return activeClasses.reduce((total, classDoc) => total + classDoc.students.length, 0);
  } catch (error) {
    console.error('Get total student count error:', error);
    throw error;
  }
}

/**
 * Check if class has attendance records
 */
export async function hasAttendanceRecords(classId: string): Promise<boolean> {
  try {
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('classId', '==', classId),
      limit(1)
    );
    const snapshot = await getDocs(attendanceQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Check attendance records error:', error);
    return false;
  }
}

/**
 * Generate QR code data for class attendance
 */
export function generateQRCodeData(classId: string, secret: string): string {
  const timestamp = Date.now();
  return JSON.stringify({
    classId,
    secret,
    timestamp,
  });
}

/**
 * Verify QR code data
 */
export function verifyQRCodeData(
  qrData: string,
  expectedClassId: string,
  expectedSecret: string
): boolean {
  try {
    const data = JSON.parse(qrData);
    const { classId, secret, timestamp } = data;

    // Verify class ID and secret match
    if (classId !== expectedClassId || secret !== expectedSecret) {
      return false;
    }

    // Check if QR code is not expired (valid for 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (now - timestamp > fiveMinutes) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
