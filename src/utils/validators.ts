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
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
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
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
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
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');

  if (!MALAYSIAN_PHONE_REGEX.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Invalid Malaysian phone number format (e.g., 012-34567890)',
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
    return { isValid: false, error: 'Date is required' };
  }

  if (!DATE_REGEX.test(date)) {
    return { isValid: false, error: 'Invalid date format (YYYY-MM-DD)' };
  }

  // Check if date is valid
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date' };
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
    return { isValid: false, error: 'Time is required' };
  }

  if (!TIME_REGEX.test(time)) {
    return { isValid: false, error: 'Invalid time format (HH:MM)' };
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
    return { isValid: false, error: 'Date of birth cannot be in the future' };
  }

  if (age < 5 || age > 25) {
    return {
      isValid: false,
      error: 'Student age must be between 5 and 25 years',
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
    errors.name = 'Student name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Student name must be at least 2 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Student name must not exceed 100 characters';
  }

  // Validate date of birth
  const dobValidation = validateDateOfBirth(data.dob);
  if (!dobValidation.isValid) {
    errors.dob = dobValidation.error;
  }

  // Validate guardian name
  if (!data.guardianName || data.guardianName.trim().length === 0) {
    errors.guardianName = 'Guardian name is required';
  } else if (data.guardianName.trim().length < 2) {
    errors.guardianName = 'Guardian name must be at least 2 characters';
  }

  // Validate guardian contact
  const phoneValidation = validatePhoneNumber(data.guardianContact);
  if (!phoneValidation.isValid) {
    errors.guardianContact = phoneValidation.error;
  }

  // Validate address (optional)
  if (data.address && data.address.trim().length > 500) {
    errors.address = 'Address must not exceed 500 characters';
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
    errors.name = 'Class name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Class name must be at least 2 characters';
  } else if (data.name.length > 50) {
    errors.name = 'Class name must not exceed 50 characters';
  }

  // Validate grade (must be 1-5)
  if (!data.grade || data.grade === 0) {
    errors.grade = 'Grade is required';
  } else if (data.grade < 1 || data.grade > 5) {
    errors.grade = 'Grade must be between 1 and 5';
  }

  // Validate teacher rep
  if (!data.teacherRep || data.teacherRep.trim().length === 0) {
    errors.teacherRep = 'Class teacher is required';
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
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name must not exceed 100 characters';
  }

  // Validate role
  if (!data.role || !Object.values(ROLES).includes(data.role)) {
    errors.role = 'Valid role is required';
  }

  // Validate password (only for new users)
  if (isNewUser) {
    if (!data.password) {
      errors.password = 'Password is required for new users';
    } else {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error;
      }
    }
  }

  // Validate assigned classes (optional, but should be array)
  if (!Array.isArray(data.assignedClasses)) {
    errors.assignedClasses = 'Assigned classes must be an array';
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
    errors.name = 'Holiday name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Holiday name must be at least 2 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Holiday name must not exceed 100 characters';
  }

  // Validate type
  if (!data.type || data.type.trim().length === 0) {
    errors.type = 'Holiday type is required';
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
    return { isValid: false, error: 'Remarks must not exceed 500 characters' };
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
