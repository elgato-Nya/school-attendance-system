/**
 * Core user CRUD operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { secondaryAuth, db } from '../firebase.config';
import type { User, UserFormData } from '@/types';
import { ROLES } from '@/utils/constants';

const USERS_COLLECTION = 'users';

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));

    const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);

    // Sort client-side to avoid Firestore index requirement
    return users.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as User;
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
}

/**
 * Get all teachers
 */
export async function getAllTeachers(): Promise<User[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('role', '==', ROLES.TEACHER));

    const querySnapshot = await getDocs(q);

    const teachers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);

    // Sort client-side to avoid Firestore index requirement
    return teachers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Get all teachers error:', error);
    throw error;
  }
}

/**
 * Get all admins
 */
export async function getAllAdmins(): Promise<User[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where('role', '==', ROLES.ADMIN));

    const querySnapshot = await getDocs(q);

    const admins = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);

    // Sort client-side to avoid Firestore index requirement
    return admins.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Get all admins error:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(data: UserFormData): Promise<string> {
  try {
    if (!data.password) {
      throw new Error('Password is required for new users');
    }

    // Use secondary auth instance to create user without affecting current session
    // This prevents auto-logout of the admin creating the user
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email,
      data.password
    );

    const userId = userCredential.user.uid;
    const now = Timestamp.now();

    // Create user document in Firestore with the same ID
    const userData: Omit<User, 'id'> = {
      email: data.email,
      name: data.name,
      role: data.role,
      assignedClasses: data.assignedClasses || [],
      createdAt: now,
      updatedAt: now,
    };

    // Use setDoc instead of updateDoc for new documents
    await setDoc(doc(db, USERS_COLLECTION, userId), userData);

    // Sign out from secondary auth to clean up
    await secondaryAuth.signOut();

    return userId;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  data: Partial<Omit<UserFormData, 'password'>>
): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}

/**
 * Delete a user with cascade handling
 *
 * This function will:
 * 1. Check if user is a teacher with assigned classes
 * 2. Remove teacher from all assigned classes' teacherRep field
 * 3. Delete user from Firestore
 *
 * Note: Firebase Auth deletion requires admin SDK on backend
 *
 * @throws Error if teacher has assigned classes (must reassign first)
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Step 1: Get user data
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Step 2: Check if teacher has assigned classes
    if (user.role === ROLES.TEACHER && user.assignedClasses && user.assignedClasses.length > 0) {
      throw new Error(
        `Cannot delete teacher with ${user.assignedClasses.length} assigned class(es). Please reassign classes first or use the archive feature.`
      );
    }

    // Step 3: If somehow there are class assignments, clean them up
    if (user.assignedClasses && user.assignedClasses.length > 0) {
      const { updateClass } = await import('../class/class.service');

      for (const classId of user.assignedClasses) {
        try {
          // Remove teacher from class (set to empty or unassign)
          await updateClass(classId, { teacherRep: '' });
        } catch (error) {
          console.warn(`Failed to remove teacher from class ${classId}:`, error);
          // Continue with deletion even if class update fails (class might not exist)
        }
      }
    }

    // Step 4: Delete user from Firestore
    // Note: This only deletes from Firestore
    // Firebase Auth user deletion requires admin SDK or user re-authentication
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
}
