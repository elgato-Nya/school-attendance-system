/**
 * Enhanced toast notification utilities with better error messages
 */

import { toast as sonnerToast } from 'sonner';

// Common error messages
const ERROR_MESSAGES = {
  // Network & Connection
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  CONNECTION_TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',

  // Authentication
  AUTH_FAILED: 'Authentication failed. Please log in again.',
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',

  // User Management
  USER_CREATE_FAILED: 'Failed to create user. Please check the details and try again.',
  USER_UPDATE_FAILED: 'Failed to update user. Please try again.',
  USER_DELETE_FAILED: 'Failed to delete user. Please try again.',
  USER_LOAD_FAILED: 'Failed to load users. Please refresh the page.',
  EMAIL_ALREADY_EXISTS: 'This email is already registered.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long.',

  // Class Management
  CLASS_CREATE_FAILED: 'Failed to create class. Please check the details and try again.',
  CLASS_UPDATE_FAILED: 'Failed to update class. Please try again.',
  CLASS_DELETE_FAILED:
    'Failed to delete class. This class may have students or attendance records.',
  CLASS_LOAD_FAILED: 'Failed to load classes. Please refresh the page.',
  NO_TEACHER_AVAILABLE: 'No teachers available. Please create a teacher account first.',

  // Student Management
  STUDENT_ADD_FAILED: 'Failed to add student. Please check the details and try again.',
  STUDENT_UPDATE_FAILED: 'Failed to update student information. Please try again.',
  STUDENT_DELETE_FAILED: 'Failed to remove student. Please try again.',
  STUDENT_LOAD_FAILED: 'Failed to load students. Please refresh the page.',
  IC_NUMBER_EXISTS: 'A student with this IC number already exists.',
  INVALID_IC_NUMBER: 'Please enter a valid IC number (format: XXXXXX-XX-XXXX).',

  // Attendance
  ATTENDANCE_SUBMIT_FAILED: 'Failed to submit attendance. Please try again.',
  ATTENDANCE_LOAD_FAILED: 'Failed to load attendance records. Please refresh the page.',
  ATTENDANCE_UPDATE_FAILED: 'Failed to update attendance. Please try again.',

  // General
  LOAD_DATA_FAILED: 'Failed to load data. Please refresh the page.',
  SAVE_FAILED: 'Failed to save changes. Please try again.',
  DELETE_FAILED: 'Failed to delete item. Please try again.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

const SUCCESS_MESSAGES = {
  // User Management
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  USER_DELETED: 'User deleted successfully!',

  // Class Management
  CLASS_CREATED: 'Class created successfully!',
  CLASS_UPDATED: 'Class updated successfully!',
  CLASS_DELETED: 'Class deleted successfully!',

  // Student Management
  STUDENT_ADDED: 'Student added successfully!',
  STUDENT_UPDATED: 'Student updated successfully!',
  STUDENT_DELETED: 'Student removed successfully!',

  // Attendance
  ATTENDANCE_SUBMITTED: 'Attendance submitted successfully!',
  ATTENDANCE_UPDATED: 'Attendance updated successfully!',

  // General
  SAVE_SUCCESS: 'Changes saved successfully!',
  DELETE_SUCCESS: 'Item deleted successfully!',
};

const INFO_MESSAGES = {
  LOADING: 'Loading data...',
  PROCESSING: 'Processing...',
  SAVING: 'Saving changes...',
  DELETING: 'Deleting...',
};

const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  DELETE_CONFIRMATION: 'This action cannot be undone. Are you sure?',
  NO_DATA: 'No data available.',
  EMPTY_LIST: 'The list is empty.',
};

/**
 * Enhanced toast utility with predefined messages and custom options
 */
export const toast = {
  // Success messages
  success: (message: string, duration = 3000) => {
    sonnerToast.success(message, { duration });
  },

  // Error messages
  error: (message: string, duration = 4000) => {
    sonnerToast.error(message, { duration });
  },

  // Info messages
  info: (message: string, duration = 3000) => {
    sonnerToast.info(message, { duration });
  },

  // Warning messages
  warning: (message: string, duration = 3500) => {
    sonnerToast.warning(message, { duration });
  },

  // Loading toast
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },

  // Dismiss a specific toast
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    sonnerToast.dismiss();
  },

  // Promise-based toast for async operations
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};

// Export predefined messages
export { ERROR_MESSAGES, SUCCESS_MESSAGES, INFO_MESSAGES, WARNING_MESSAGES };

/**
 * Parse Firebase/API errors into user-friendly messages
 */
export function parseError(error: any): string {
  // Firebase Auth errors
  if (error.code) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
      case 'auth/invalid-email':
        return ERROR_MESSAGES.INVALID_EMAIL;
      case 'auth/weak-password':
        return ERROR_MESSAGES.WEAK_PASSWORD;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return ERROR_MESSAGES.AUTH_FAILED;
      case 'auth/network-request-failed':
        return ERROR_MESSAGES.NETWORK_ERROR;
      case 'permission-denied':
        return ERROR_MESSAGES.UNAUTHORIZED;
      default:
        break;
    }
  }

  // Network errors
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Timeout errors
  if (error.message?.includes('timeout')) {
    return ERROR_MESSAGES.CONNECTION_TIMEOUT;
  }

  // Custom error messages
  if (error.message) {
    return error.message;
  }

  // Default error
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
