/**
 * Enhanced toast notification utilities with better error messages
 */

import { toast as sonnerToast } from 'sonner';

// Common error messages
const ERROR_MESSAGES = {
  // Network & Connection
  NETWORK_ERROR: 'Ralat rangkaian. Sila semak sambungan internet anda.',
  CONNECTION_TIMEOUT: 'Permintaan tamat tempoh. Sila cuba lagi.',
  SERVER_ERROR: 'Ralat pelayan. Sila cuba lagi kemudian.',

  // Authentication
  AUTH_FAILED: 'Pengesahan gagal. Sila log masuk semula.',
  UNAUTHORIZED: 'Anda tidak mempunyai kebenaran untuk melakukan tindakan ini.',
  SESSION_EXPIRED: 'Sesi anda telah tamat tempoh. Sila log masuk semula.',

  // User Management
  USER_CREATE_FAILED: 'Gagal mencipta pengguna. Sila semak butiran dan cuba lagi.',
  USER_UPDATE_FAILED: 'Gagal mengemaskini pengguna. Sila cuba lagi.',
  USER_DELETE_FAILED: 'Gagal memadam pengguna. Sila cuba lagi.',
  USER_LOAD_FAILED: 'Gagal memuatkan pengguna. Sila muat semula halaman.',
  EMAIL_ALREADY_EXISTS: 'Emel ini telah berdaftar.',
  INVALID_EMAIL: 'Sila masukkan alamat emel yang sah.',
  WEAK_PASSWORD: 'Kata laluan mestilah sekurang-kurangnya 6 aksara.',

  // Class Management
  CLASS_CREATE_FAILED: 'Gagal mencipta kelas. Sila semak butiran dan cuba lagi.',
  CLASS_UPDATE_FAILED: 'Gagal mengemaskini kelas. Sila cuba lagi.',
  CLASS_DELETE_FAILED:
    'Gagal memadam kelas. Kelas ini mungkin mempunyai murid atau rekod kehadiran.',
  CLASS_LOAD_FAILED: 'Gagal memuatkan kelas. Sila muat semula halaman.',
  NO_TEACHER_AVAILABLE: 'Tiada guru tersedia. Sila cipta akaun guru terlebih dahulu.',

  // Student Management
  STUDENT_ADD_FAILED: 'Gagal menambah murid. Sila semak butiran dan cuba lagi.',
  STUDENT_UPDATE_FAILED: 'Gagal mengemaskini maklumat murid. Sila cuba lagi.',
  STUDENT_DELETE_FAILED: 'Gagal mengeluarkan murid. Sila cuba lagi.',
  STUDENT_LOAD_FAILED: 'Gagal memuatkan murid. Sila muat semula halaman.',
  IC_NUMBER_EXISTS: 'Murid dengan nombor IC ini sudah wujud.',
  INVALID_IC_NUMBER: 'Sila masukkan nombor IC yang sah (format: XXXXXX-XX-XXXX).',

  // Attendance
  ATTENDANCE_SUBMIT_FAILED: 'Gagal menyerahkan kehadiran. Sila cuba lagi.',
  ATTENDANCE_LOAD_FAILED: 'Gagal memuatkan rekod kehadiran. Sila muat semula halaman.',
  ATTENDANCE_UPDATE_FAILED: 'Gagal mengemaskini kehadiran. Sila cuba lagi.',

  // General
  LOAD_DATA_FAILED: 'Gagal memuatkan data. Sila muat semula halaman.',
  SAVE_FAILED: 'Gagal menyimpan perubahan. Sila cuba lagi.',
  DELETE_FAILED: 'Gagal memadam item. Sila cuba lagi.',
  VALIDATION_ERROR: 'Sila semak borang untuk ralat.',
  UNKNOWN_ERROR: 'Ralat yang tidak dijangka berlaku. Sila cuba lagi.',
};

const SUCCESS_MESSAGES = {
  // User Management
  USER_CREATED: 'Pengguna berjaya dicipta!',
  USER_UPDATED: 'Pengguna berjaya dikemaskini!',
  USER_DELETED: 'Pengguna berjaya dipadam!',

  // Class Management
  CLASS_CREATED: 'Kelas berjaya dicipta!',
  CLASS_UPDATED: 'Kelas berjaya dikemaskini!',
  CLASS_DELETED: 'Kelas berjaya dipadam!',

  // Student Management
  STUDENT_ADDED: 'Murid berjaya ditambah!',
  STUDENT_UPDATED: 'Murid berjaya dikemaskini!',
  STUDENT_DELETED: 'Murid berjaya dikeluarkan!',

  // Attendance
  ATTENDANCE_SUBMITTED: 'Kehadiran berjaya diserahkan!',
  ATTENDANCE_UPDATED: 'Kehadiran berjaya dikemaskini!',

  // General
  SAVE_SUCCESS: 'Perubahan berjaya disimpan!',
  DELETE_SUCCESS: 'Item berjaya dipadam!',
};

const INFO_MESSAGES = {
  LOADING: 'Memuatkan data...',
  PROCESSING: 'Memproses...',
  SAVING: 'Menyimpan perubahan...',
  DELETING: 'Memadam...',
};

const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'Anda mempunyai perubahan yang belum disimpan. Adakah anda pasti mahu keluar?',
  DELETE_CONFIRMATION: 'Tindakan ini tidak boleh dibatalkan. Adakah anda pasti?',
  NO_DATA: 'Tiada data tersedia.',
  EMPTY_LIST: 'Senarai kosong.',
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
