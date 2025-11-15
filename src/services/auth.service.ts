/**
 * Authentication service for user login, logout, and session management
 */

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  updateEmail,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.config';
import type { User } from '@/types';

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      throw new Error('User data not found in database');
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    return { user, firebaseUser };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Get current authenticated user from Firestore
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      return null;
    }

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const user = { id: userDoc.id, ...userDoc.data() } as User;
          callback(user);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

/**
 * Update user password
 */
export async function changePassword(newPassword: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

/**
 * Update user email
 */
export async function changeEmail(newEmail: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updateEmail(user, newEmail);
  } catch (error) {
    console.error('Change email error:', error);
    throw error;
  }
}

/**
 * Get Firebase Auth error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/requires-recent-login':
        return 'Please logout and login again to perform this action';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password';
      case 'auth/email-already-in-use':
        return 'Email is already in use';
      default:
        return 'An error occurred. Please try again';
    }
  }

  return 'An unexpected error occurred';
}
