/**
 * Service for managing attendance records in Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase.config';
import type { Attendance, AttendanceRecord, AttendanceSummary } from '@/types';
import { ATTENDANCE_STATUS } from '@/utils/constants';
import { getTodayString, isToday } from '@/utils/dateFormatter';
import { calculateMinutesLate } from '@/utils/dateFormatter';

const ATTENDANCE_COLLECTION = 'attendance';

/**
 * Submit attendance for a class on a specific date
 */
export async function submitAttendance(
  classId: string,
  className: string,
  date: string,
  records: AttendanceRecord[],
  submittedBy: string,
  submittedByName: string
): Promise<string> {
  try {
    // Calculate summary
    const summary = calculateSummary(records);

    // Sanitize records to ensure no undefined values
    const sanitizedRecords = records.map((record) => ({
      icNumber: record.icNumber || '',
      studentName: record.studentName || '',
      status: record.status || 'absent',
      ...(record.lateTime && { lateTime: record.lateTime }),
      ...(record.minutesLate && { minutesLate: record.minutesLate }),
      ...(record.remarks && { remarks: record.remarks }),
    }));

    const attendanceData = {
      classId: classId || '',
      className: className || '',
      date: date || '',
      submittedBy: submittedBy || '',
      submittedByName: submittedByName || '',
      timestamp: Timestamp.now(),
      records: sanitizedRecords,
      summary: {
        total: summary.total || 0,
        present: summary.present || 0,
        late: summary.late || 0,
        absent: summary.absent || 0,
        excused: summary.excused || 0,
        rate: summary.rate || 0,
      },
      telegramSent: false,
      editHistory: [],
    };

    const docRef = await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceData);
    return docRef.id;
  } catch (error) {
    console.error('Submit attendance error:', error);
    throw error;
  }
}

/**
 * Get attendance for a specific class and date
 */
export async function getAttendanceByClassAndDate(
  classId: string,
  date: string
): Promise<Attendance | null> {
  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classId', '==', classId),
      where('date', '==', date),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      classId: data.classId || '',
      className: data.className || '',
      date: data.date || '',
      submittedBy: data.submittedBy || '',
      submittedByName: data.submittedByName || '',
      timestamp: data.timestamp,
      records: data.records || [],
      summary: {
        total: data.summary?.total || 0,
        present: data.summary?.present || 0,
        late: data.summary?.late || 0,
        absent: data.summary?.absent || 0,
        excused: data.summary?.excused || 0,
        rate: data.summary?.rate || 0,
      },
      telegramSent: data.telegramSent || false,
      editHistory: data.editHistory || [],
      updatedAt: data.updatedAt || undefined,
    } as Attendance;
  } catch (error) {
    console.error('Get attendance by class and date error:', error);
    throw error;
  }
}

/**
 * Get all attendance records for a specific date
 */
export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  try {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('date', '==', date),
      orderBy('className', 'asc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        classId: data.classId || '',
        className: data.className || '',
        date: data.date || '',
        submittedBy: data.submittedBy || '',
        submittedByName: data.submittedByName || '',
        timestamp: data.timestamp,
        records: data.records || [],
        summary: {
          total: data.summary?.total || 0,
          present: data.summary?.present || 0,
          late: data.summary?.late || 0,
          absent: data.summary?.absent || 0,
          excused: data.summary?.excused || 0,
          rate: data.summary?.rate || 0,
        },
        telegramSent: data.telegramSent || false,
        editHistory: data.editHistory || [],
        updatedAt: data.updatedAt || undefined,
      } as Attendance;
    });
  } catch (error) {
    console.error('Get attendance by date error:', error);
    throw error;
  }
}

/**
 * Get attendance history for a specific class
 */
export async function getAttendanceHistory(
  classId: string,
  startDate?: string,
  endDate?: string
): Promise<Attendance[]> {
  try {
    // Build query constraints array
    const constraints: any[] = [where('classId', '==', classId)];

    // Add date range filters if provided
    if (startDate) {
      constraints.push(where('date', '>=', startDate));
    }

    if (endDate) {
      constraints.push(where('date', '<=', endDate));
    }

    // Add orderBy after all where clauses
    constraints.push(orderBy('date', 'desc'));

    // Create the query with all constraints
    const q = query(collection(db, ATTENDANCE_COLLECTION), ...constraints);

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        classId: data.classId || '',
        className: data.className || '',
        date: data.date || '',
        submittedBy: data.submittedBy || '',
        submittedByName: data.submittedByName || '',
        timestamp: data.timestamp,
        records: data.records || [],
        summary: {
          total: data.summary?.total || 0,
          present: data.summary?.present || 0,
          late: data.summary?.late || 0,
          absent: data.summary?.absent || 0,
          excused: data.summary?.excused || 0,
          rate: data.summary?.rate || 0,
        },
        telegramSent: data.telegramSent || false,
        editHistory: data.editHistory || [],
        updatedAt: data.updatedAt || undefined,
      } as Attendance;
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    throw error;
  }
}

/**
 * Get attendance records for a date range
 */
export async function getAttendanceByDateRange(
  classId: string,
  startDate: Date,
  endDate: Date
): Promise<Attendance[]> {
  try {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('classId', '==', classId),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        classId: data.classId || '',
        className: data.className || '',
        date: data.date || '',
        submittedBy: data.submittedBy || '',
        submittedByName: data.submittedByName || '',
        timestamp: data.timestamp,
        records: data.records || [],
        summary: {
          total: data.summary?.total || 0,
          present: data.summary?.present || 0,
          late: data.summary?.late || 0,
          absent: data.summary?.absent || 0,
          excused: data.summary?.excused || 0,
          rate: data.summary?.rate || 0,
        },
        telegramSent: data.telegramSent || false,
        editHistory: data.editHistory || [],
        updatedAt: data.updatedAt || undefined,
      } as Attendance;
    });
  } catch (error) {
    console.error('Get attendance by date range error:', error);
    throw error;
  }
}

/**
 * Get attendance records for a specific student (by class and icNumber)
 */
export async function getStudentAttendanceHistory(
  classId: string,
  icNumber: string,
  startDate?: string,
  endDate?: string
): Promise<AttendanceRecord[]> {
  try {
    const attendanceHistory = await getAttendanceHistory(classId, startDate, endDate);

    return attendanceHistory
      .map((attendance) => {
        const record = attendance.records.find((r) => r.icNumber === icNumber);
        return record || null;
      })
      .filter((record): record is AttendanceRecord => record !== null);
  } catch (error) {
    console.error('Get student attendance history error:', error);
    throw error;
  }
}

/**
 * Update attendance record with audit trail
 * @throws Error if validation fails or record not found
 */
export async function updateAttendance(
  attendanceId: string,
  records: AttendanceRecord[],
  editedBy: string,
  editedByName: string,
  reason: string
): Promise<void> {
  try {
    // Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new Error('Edit reason must be at least 10 characters');
    }

    if (reason.length > 500) {
      throw new Error('Edit reason must not exceed 500 characters');
    }

    const docRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Attendance record not found');
    }

    const currentData = docSnap.data() as Attendance;

    // Sanitize records to ensure no undefined values
    const sanitizedRecords: AttendanceRecord[] = records.map((record) => ({
      icNumber: record.icNumber || '',
      studentName: record.studentName || '',
      status: record.status || 'absent',
      ...(record.lateTime && { lateTime: record.lateTime }),
      ...(record.minutesLate && { minutesLate: record.minutesLate }),
      ...(record.remarks && { remarks: record.remarks }),
    }));

    // Create edit history entry
    const editHistoryEntry = {
      editedBy: editedBy || '',
      editedByName: editedByName || '',
      editedAt: Timestamp.now(),
      reason: reason || '',
      previousSummary: {
        total: currentData.summary?.total || 0,
        present: currentData.summary?.present || 0,
        late: currentData.summary?.late || 0,
        absent: currentData.summary?.absent || 0,
        excused: currentData.summary?.excused || 0,
        rate: currentData.summary?.rate || 0,
      },
    };

    // Calculate new summary
    const newSummary = calculateSummary(sanitizedRecords);

    await updateDoc(docRef, {
      records: sanitizedRecords,
      summary: {
        total: newSummary.total || 0,
        present: newSummary.present || 0,
        late: newSummary.late || 0,
        absent: newSummary.absent || 0,
        excused: newSummary.excused || 0,
        rate: newSummary.rate || 0,
      },
      editHistory: [...(currentData.editHistory || []), editHistoryEntry],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    throw error;
  }
}

/**
 * Mark telegram notification as sent
 */
export async function markTelegramSent(attendanceId: string): Promise<void> {
  try {
    const docRef = doc(db, ATTENDANCE_COLLECTION, attendanceId);
    await updateDoc(docRef, {
      telegramSent: true,
    });
  } catch (error) {
    console.error('Mark telegram sent error:', error);
    throw error;
  }
}

/**
 * Check if attendance has been submitted for today for a specific class
 */
export async function hasSubmittedToday(classId: string): Promise<boolean> {
  try {
    const today = getTodayString();
    const attendance = await getAttendanceByClassAndDate(classId, today);
    return attendance !== null;
  } catch (error) {
    console.error('Has submitted today error:', error);
    return false;
  }
}

/**
 * Get today's attendance record for a class
 */
export async function getTodayAttendance(classId: string): Promise<Attendance | null> {
  try {
    const today = getTodayString();
    return await getAttendanceByClassAndDate(classId, today);
  } catch (error) {
    console.error('Get today attendance error:', error);
    return null;
  }
}

/**
 * Calculate attendance summary from records
 */
function calculateSummary(records: AttendanceRecord[]): AttendanceSummary {
  const total = records.length;
  let present = 0;
  let late = 0;
  let absent = 0;
  let excused = 0;

  records.forEach((record) => {
    switch (record.status) {
      case ATTENDANCE_STATUS.PRESENT:
        present++;
        break;
      case ATTENDANCE_STATUS.LATE:
        late++;
        break;
      case ATTENDANCE_STATUS.ABSENT:
        absent++;
        break;
      case ATTENDANCE_STATUS.EXCUSED:
        excused++;
        break;
    }
  });

  // Present count includes late for rate calculation
  const presentCount = present + late;
  const rate = total > 0 ? Math.round((presentCount / total) * 100 * 100) / 100 : 0;

  return {
    total,
    present,
    late,
    absent,
    excused,
    rate,
  };
}

/**
 * Get classes that haven't submitted attendance today
 */
export async function getMissingAttendance(allClassIds: string[]): Promise<string[]> {
  try {
    const today = getTodayString();
    const todayAttendance = await getAttendanceByDate(today);
    const submittedClassIds = todayAttendance.map((a) => a.classId);

    return allClassIds.filter((classId) => !submittedClassIds.includes(classId));
  } catch (error) {
    console.error('Get missing attendance error:', error);
    throw error;
  }
}

/**
 * Get students with consecutive absences
 */
export async function getConsecutiveAbsences(
  classId: string,
  threshold: number = 3
): Promise<
  Array<{
    icNumber: string;
    studentName: string;
    consecutiveDays: number;
  }>
> {
  try {
    const history = await getAttendanceHistory(classId);

    if (history.length === 0) {
      return [];
    }

    // Sort by date ascending
    const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));

    // Track consecutive absences per student
    const absenceTracker = new Map<string, { name: string; consecutive: number }>();

    sortedHistory.forEach((attendance) => {
      attendance.records.forEach((record) => {
        const tracker = absenceTracker.get(record.icNumber) || {
          name: record.studentName,
          consecutive: 0,
        };

        if (record.status === ATTENDANCE_STATUS.ABSENT) {
          tracker.consecutive++;
        } else {
          tracker.consecutive = 0;
        }

        absenceTracker.set(record.icNumber, tracker);
      });
    });

    // Filter students with consecutive absences >= threshold
    const results: Array<{
      icNumber: string;
      studentName: string;
      consecutiveDays: number;
    }> = [];

    absenceTracker.forEach((tracker, icNumber) => {
      if (tracker.consecutive >= threshold) {
        results.push({
          icNumber,
          studentName: tracker.name,
          consecutiveDays: tracker.consecutive,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Get consecutive absences error:', error);
    throw error;
  }
}

/**
 * Check if date is editable (only today unless settings allow)
 */
export function isDateEditable(
  date: string,
  allowBackdated: boolean = false,
  backdatedDaysLimit: number = 0
): boolean {
  if (isToday(date)) {
    return true;
  }

  if (!allowBackdated) {
    return false;
  }

  const dateObj = new Date(date);
  const today = new Date(getTodayString());
  const daysDiff = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

  return daysDiff > 0 && daysDiff <= backdatedDaysLimit;
}

/**
 * Process late time and calculate minutes late
 */
export function processLateTime(lateTime: string, lateThreshold: string): number {
  return calculateMinutesLate(lateTime, lateThreshold);
}
