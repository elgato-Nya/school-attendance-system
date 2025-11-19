/**
 * Validation utilities for form inputs and data
 */

import type { StudentFormData, ClassFormData, UserFormData, HolidayFormData } from '@/types';
import { ROLES } from './constants';

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Malaysian phone number regex (01X-XXXXXXX or 01XXXXXXXXX)
 */
const MALAYSIAN_PHONE_REGEX = /^01\d{1}-?\d{7,8}$/;

/**
 * Date format regex (YYYY-MM-DD)
 */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Time format regex (HH:MM)
 */
const TIME_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validate email format
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Emel diperlukan' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Format emel tidak sah' };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password || password.length === 0) {
    return { isValid: false, error: 'Kata laluan diperlukan' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Kata laluan mesti sekurang-kurangnya 8 aksara' };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Kata laluan mesti mengandungi sekurang-kurangnya satu huruf besar',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Kata laluan mesti mengandungi sekurang-kurangnya satu huruf kecil',
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Kata laluan mesti mengandungi sekurang-kurangnya satu nombor',
    };
  }

  return { isValid: true };
}

/**
 * Validate Malaysian phone number
 */
export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  error?: string;
} {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Nombor telefon diperlukan' };
  }

  // Remove spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');

  if (!MALAYSIAN_PHONE_REGEX.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Format nombor telefon Malaysia tidak sah (cth: 012-34567890)',
    };
  }

  return { isValid: true };
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: string): {
  isValid: boolean;
  error?: string;
} {
  if (!date || date.trim().length === 0) {
    return { isValid: false, error: 'Tarikh diperlukan' };
  }

  if (!DATE_REGEX.test(date)) {
    return { isValid: false, error: 'Format tarikh tidak sah (YYYY-MM-DD)' };
  }

  // Check if date is valid
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Tarikh tidak sah' };
  }

  return { isValid: true };
}

/**
 * Validate time format (HH:MM)
 */
export function validateTime(time: string): {
  isValid: boolean;
  error?: string;
} {
  if (!time || time.trim().length === 0) {
    return { isValid: false, error: 'Masa diperlukan' };
  }

  if (!TIME_REGEX.test(time)) {
    return { isValid: false, error: 'Format masa tidak sah (HH:MM)' };
  }

  return { isValid: true };
}

/**
 * Validate date of birth (must be in the past, reasonable age)
 */
export function validateDateOfBirth(dob: string): {
  isValid: boolean;
  error?: string;
} {
  const dateValidation = validateDate(dob);
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const dobDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - dobDate.getFullYear();

  if (dobDate > today) {
    return { isValid: false, error: 'Tarikh lahir tidak boleh pada masa hadapan' };
  }

  if (age < 5 || age > 25) {
    return {
      isValid: false,
      error: 'Umur murid mesti antara 5 hingga 25 tahun',
    };
  }

  return { isValid: true };
}

/**
 * Validate student form data
 */
export function validateStudentForm(data: StudentFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof StudentFormData, string>>;
} {
  const errors: Partial<Record<keyof StudentFormData, string>> = {};

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Nama murid diperlukan';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Nama murid mesti sekurang-kurangnya 2 aksara';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Nama murid tidak boleh melebihi 100 aksara';
  }

  // Validate date of birth
  const dobValidation = validateDateOfBirth(data.dob);
  if (!dobValidation.isValid) {
    errors.dob = dobValidation.error;
  }

  // Validate guardian name
  if (!data.guardianName || data.guardianName.trim().length === 0) {
    errors.guardianName = 'Nama penjaga diperlukan';
  } else if (data.guardianName.trim().length < 2) {
    errors.guardianName = 'Nama penjaga mesti sekurang-kurangnya 2 aksara';
  }

  // Validate guardian contact
  const phoneValidation = validatePhoneNumber(data.guardianContact);
  if (!phoneValidation.isValid) {
    errors.guardianContact = phoneValidation.error;
  }

  // Validate address (optional)
  if (data.address && data.address.trim().length > 500) {
    errors.address = 'Alamat tidak boleh melebihi 500 aksara';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate class form data
 */
export function validateClassForm(data: ClassFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof ClassFormData, string>>;
} {
  const errors: Partial<Record<keyof ClassFormData, string>> = {};

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Nama kelas diperlukan';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Nama kelas mesti sekurang-kurangnya 2 aksara';
  } else if (data.name.length > 50) {
    errors.name = 'Nama kelas tidak boleh melebihi 50 aksara';
  }

  // Validate grade (must be 1-5)
  if (!data.grade || data.grade === 0) {
    errors.grade = 'Tingkatan diperlukan';
  } else if (data.grade < 1 || data.grade > 5) {
    errors.grade = 'Tingkatan mesti antara 1 hingga 5';
  }

  // Validate teacher rep
  if (!data.teacherRep || data.teacherRep.trim().length === 0) {
    errors.teacherRep = 'Guru kelas diperlukan';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate user form data
 */
export function validateUserForm(
  data: UserFormData,
  isNewUser: boolean = false
): {
  isValid: boolean;
  errors: Partial<Record<keyof UserFormData, string>>;
} {
  const errors: Partial<Record<keyof UserFormData, string>> = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Nama diperlukan';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Nama mesti sekurang-kurangnya 2 aksara';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Nama tidak boleh melebihi 100 aksara';
  }

  // Validate role
  if (!data.role || !Object.values(ROLES).includes(data.role)) {
    errors.role = 'Peranan yang sah diperlukan';
  }

  // Validate password (only for new users)
  if (isNewUser) {
    if (!data.password) {
      errors.password = 'Kata laluan diperlukan untuk pengguna baru';
    } else {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error;
      }
    }
  }

  // Validate assigned classes (optional, but should be array)
  if (!Array.isArray(data.assignedClasses)) {
    errors.assignedClasses = 'Kelas yang ditetapkan mesti dalam bentuk senarai';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate holiday form data
 */
export function validateHolidayForm(data: HolidayFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof HolidayFormData, string>>;
} {
  const errors: Partial<Record<keyof HolidayFormData, string>> = {};

  // Validate date
  const dateValidation = validateDate(data.date);
  if (!dateValidation.isValid) {
    errors.date = dateValidation.error;
  }

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Nama cuti diperlukan';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Nama cuti mesti sekurang-kurangnya 2 aksara';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Nama cuti tidak boleh melebihi 100 aksara';
  }

  // Validate type
  if (!data.type || data.type.trim().length === 0) {
    errors.type = 'Jenis cuti diperlukan';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate remarks/notes field
 */
export function validateRemarks(remarks: string): {
  isValid: boolean;
  error?: string;
} {
  if (remarks && remarks.length > 500) {
    return { isValid: false, error: 'Catatan tidak boleh melebihi 500 aksara' };
  }

  return { isValid: true };
}

/**
 * Sanitize string input (remove extra whitespace, trim)
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Format phone number to Malaysian standard (01X-XXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/[\s-]/g, '');
  if (clean.length === 10 || clean.length === 11) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return phone;
}
