/**
 * Service for managing holidays in Firestore
 */

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase.config';
import { format } from 'date-fns';
import type { Holiday, HolidayFormData } from '@/types';

const HOLIDAYS_COLLECTION = 'holidays';

/**
 * Get all holidays
 */
export async function getAllHolidays(): Promise<Holiday[]> {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, HOLIDAYS_COLLECTION), orderBy('date', 'asc'))
    );

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Holiday);
  } catch (error) {
    console.error('Get all holidays error:', error);
    throw error;
  }
}

/**
 * Get holidays for a specific year
 */
export async function getHolidaysByYear(year: number): Promise<Holiday[]> {
  try {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const q = query(
      collection(db, HOLIDAYS_COLLECTION),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Holiday);
  } catch (error) {
    console.error('Get holidays by year error:', error);
    throw error;
  }
}

/**
 * Get holiday by date
 */
export async function getHolidayByDate(date: string): Promise<Holiday | null> {
  try {
    const q = query(collection(db, HOLIDAYS_COLLECTION), where('date', '==', date));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Holiday;
  } catch (error) {
    console.error('Get holiday by date error:', error);
    throw error;
  }
}

/**
 * Check if a specific date is a holiday
 */
export async function isHoliday(date: string): Promise<boolean> {
  try {
    const holiday = await getHolidayByDate(date);
    return holiday !== null;
  } catch (error) {
    console.error('Is holiday error:', error);
    return false;
  }
}

/**
 * Create a new holiday
 */
export async function createHoliday(data: HolidayFormData): Promise<string> {
  try {
    const holidayData: Omit<Holiday, 'id'> = {
      date: data.date,
      name: data.name,
      type: data.type,
      isRecurring: data.isRecurring,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, HOLIDAYS_COLLECTION), holidayData);
    return docRef.id;
  } catch (error) {
    console.error('Create holiday error:', error);
    throw error;
  }
}

/**
 * Update holiday information
 */
export async function updateHoliday(
  holidayId: string,
  data: Partial<HolidayFormData>
): Promise<void> {
  try {
    const docRef = doc(db, HOLIDAYS_COLLECTION, holidayId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Update holiday error:', error);
    throw error;
  }
}

/**
 * Delete a holiday
 */
export async function deleteHoliday(holidayId: string): Promise<void> {
  try {
    const docRef = doc(db, HOLIDAYS_COLLECTION, holidayId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Delete holiday error:', error);
    throw error;
  }
}

/**
 * Get upcoming holidays (from today onwards)
 */
export async function getUpcomingHolidays(limit?: number): Promise<Holiday[]> {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    let q = query(
      collection(db, HOLIDAYS_COLLECTION),
      where('date', '>=', today),
      orderBy('date', 'asc')
    );

    if (limit) {
      q = query(q, where('date', '>=', today));
    }

    const querySnapshot = await getDocs(q);

    const holidays = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Holiday);

    return limit ? holidays.slice(0, limit) : holidays;
  } catch (error) {
    console.error('Get upcoming holidays error:', error);
    throw error;
  }
}

/**
 * Get holidays in date range
 */
export async function getHolidaysInRange(startDate: string, endDate: string): Promise<Holiday[]> {
  try {
    const q = query(
      collection(db, HOLIDAYS_COLLECTION),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Holiday);
  } catch (error) {
    console.error('Get holidays in range error:', error);
    throw error;
  }
}

/**
 * Check if date range contains any holidays
 */
export async function hasHolidaysInRange(startDate: string, endDate: string): Promise<boolean> {
  try {
    const holidays = await getHolidaysInRange(startDate, endDate);
    return holidays.length > 0;
  } catch (error) {
    console.error('Has holidays in range error:', error);
    return false;
  }
}

/**
 * Get weekend dates in a range (Saturday and Sunday)
 */
export function getWeekendsInRange(startDate: string, endDate: string): string[] {
  const weekends: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      // Sunday or Saturday
      weekends.push(format(new Date(date), 'yyyy-MM-dd'));
    }
  }

  return weekends;
}

/**
 * Get all non-school days (holidays + weekends) in a range
 */
export async function getNonSchoolDays(startDate: string, endDate: string): Promise<string[]> {
  try {
    const holidays = await getHolidaysInRange(startDate, endDate);
    const holidayDates = holidays.map((h) => h.date);
    const weekends = getWeekendsInRange(startDate, endDate);

    // Combine and remove duplicates
    const nonSchoolDays = [...new Set([...holidayDates, ...weekends])];
    return nonSchoolDays.sort();
  } catch (error) {
    console.error('Get non-school days error:', error);
    throw error;
  }
}

/**
 * Check if a date is a school day (not weekend or holiday)
 */
export async function isSchoolDay(date: string): Promise<boolean> {
  try {
    const dateObj = new Date(date);
    const day = dateObj.getDay();

    // Check if weekend
    if (day === 0 || day === 6) {
      return false;
    }

    // Check if holiday
    const holiday = await getHolidayByDate(date);
    return holiday === null;
  } catch (error) {
    console.error('Is school day error:', error);
    return true; // Default to school day if error
  }
}
