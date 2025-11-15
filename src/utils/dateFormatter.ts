import { format, parseISO, isValid, parse } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { TIMEZONE, DATE_FORMATS } from './constants.ts';

/**
 * Get current date in KL timezone
 */
export const getCurrentDate = (): Date => {
  return toZonedTime(new Date(), TIMEZONE);
};

/**
 * Format date for display (DD/MM/YYYY)
 */
export const formatDisplayDate = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(toZonedTime(dateObj, TIMEZONE), DATE_FORMATS.DISPLAY);
};

/**
 * Format date for display with month name (DD MMMM YYYY)
 */
export const formatLongDate = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(toZonedTime(dateObj, TIMEZONE), DATE_FORMATS.DISPLAY_LONG);
};

/**
 * Format date for Firestore storage (YYYY-MM-DD)
 */
export const formatFirestoreDate = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(toZonedTime(dateObj, TIMEZONE), DATE_FORMATS.FIRESTORE);
};

/**
 * Format time (HH:MM)
 */
export const formatTime = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(toZonedTime(dateObj, TIMEZONE), DATE_FORMATS.TIME);
};

/**
 * Get today's date string for Firestore (YYYY-MM-DD)
 */
export const getTodayString = (): string => {
  return formatFirestoreDate(getCurrentDate());
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const today = getTodayString();
  return dateString < today;
};

/**
 * Check if date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  const today = getTodayString();
  return dateString > today;
};

/**
 * Convert KL time to UTC for Firestore timestamp
 */
export const toUTC = (date: Date): Date => {
  return fromZonedTime(date, TIMEZONE);
};

/**
 * Parse time string (HH:MM) and combine with date
 */
export const parseTimeString = (timeString: string, date: Date = new Date()): Date | null => {
  if (!timeString || !/^\d{2}:\d{2}$/.test(timeString)) return null;

  const [hours, minutes] = timeString.split(':').map(Number);
  const dateObj = new Date(date);
  dateObj.setHours(hours, minutes, 0, 0);

  return dateObj;
};

/**
 * Calculate minutes late based on threshold
 */
export const calculateMinutesLate = (
  arrivalTime: string,
  thresholdTime: string = '07:30'
): number => {
  const arrival = parseTimeString(arrivalTime);
  const threshold = parseTimeString(thresholdTime);

  if (!arrival || !threshold) return 0;

  const diffMs = arrival.getTime() - threshold.getTime();
  return Math.max(0, Math.floor(diffMs / 60000)); // Convert to minutes
};

/**
 * Parse Firestore date string to Date object
 */
export const parseFirestoreDate = (dateString: string): Date => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};
