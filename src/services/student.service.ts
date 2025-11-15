/**
 * Student Service
 * Handles all student-related operations
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase.config';
import type { Student } from '@/types';

const COLLECTION_NAME = 'students';

/**
 * Get all students across all classes
 */
export async function getAllStudents(): Promise<Student[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Student
    );
  } catch (error) {
    console.error('Get all students error:', error);
    throw error;
  }
}

/**
 * Get students by class ID
 */
export async function getStudentsByClass(classId: string): Promise<Student[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('classId', '==', classId),
      orderBy('name', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Student
    );
  } catch (error) {
    console.error('Get students by class error:', error);
    throw error;
  }
}

/**
 * Get student by IC number
 */
export async function getStudentByIC(icNumber: string): Promise<Student | null> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('icNumber', '==', icNumber));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Student;
  } catch (error) {
    console.error('Get student by IC error:', error);
    throw error;
  }
}

/**
 * Get student by document ID
 */
export async function getStudentById(studentId: string): Promise<Student | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Student;
  } catch (error) {
    console.error('Get student by ID error:', error);
    throw error;
  }
}

/**
 * Create a new student
 */
export async function createStudent(
  classId: string,
  studentData: Omit<Student, 'id' | 'addedAt' | 'classId'>
): Promise<string> {
  try {
    // Check if IC number already exists
    const existing = await getStudentByIC(studentData.icNumber);
    if (existing) {
      throw new Error('A student with this IC number already exists');
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...studentData,
      classId,
      addedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Create student error:', error);
    throw error;
  }
}

/**
 * Update a student
 */
export async function updateStudent(
  studentId: string,
  updates: Partial<Omit<Student, 'id' | 'addedAt' | 'classId'>>
): Promise<void> {
  try {
    // If updating IC number, check for duplicates
    if (updates.icNumber) {
      const existing = await getStudentByIC(updates.icNumber);
      if (existing && existing.id !== studentId) {
        throw new Error('A student with this IC number already exists');
      }
    }

    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Update student error:', error);
    throw error;
  }
}

/**
 * Delete a student
 */
export async function deleteStudent(studentId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Delete student error:', error);
    throw error;
  }
}

/**
 * Transfer student to another class
 */
export async function transferStudent(studentId: string, newClassId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, studentId);
    await updateDoc(docRef, {
      classId: newClassId,
    });
  } catch (error) {
    console.error('Transfer student error:', error);
    throw error;
  }
}

/**
 * Search students by name or IC number
 */
export async function searchStudents(searchTerm: string): Promise<Student[]> {
  try {
    const allStudents = await getAllStudents();
    const lowerSearch = searchTerm.toLowerCase();

    return allStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerSearch) || student.icNumber.includes(searchTerm)
    );
  } catch (error) {
    console.error('Search students error:', error);
    throw error;
  }
}
