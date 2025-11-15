/**
 * Report Generation Hooks
 * Business logic for generating different report types
 * Database ensures one record per class+date (no duplicates)
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import type { Attendance, Class, Student } from '@/types';
import { format } from 'date-fns';

export interface ReportData {
  type: 'daily' | 'class' | 'student' | 'cumulative';
  date?: string;
  startDate?: string;
  endDate?: string;
  classId?: string;
  className?: string;
  studentId?: string;
  studentName?: string;
  records: Attendance[];
  summary: {
    totalStudents: number;
    totalDays: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
  };
}

export async function generateDailyReport(selectedDate: Date): Promise<ReportData> {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const q = query(
    collection(db, 'attendance'),
    where('date', '==', dateStr),
    orderBy('className', 'asc')
  );

  const snapshot = await getDocs(q);
  const allRecords: Attendance[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Attendance[];

  // Direct use - no filtering needed
  const records = allRecords;

  const summary = {
    totalStudents: records.reduce((sum, r) => sum + r.summary.total, 0),
    totalDays: 1,
    present: records.reduce((sum, r) => sum + r.summary.present, 0),
    late: records.reduce((sum, r) => sum + r.summary.late, 0),
    absent: records.reduce((sum, r) => sum + r.summary.absent, 0),
    rate: 0,
  };

  summary.rate = summary.totalStudents > 0 ? (summary.present / summary.totalStudents) * 100 : 0;

  return {
    type: 'daily',
    date: dateStr,
    records,
    summary,
  };
}

export async function generateClassReport(
  selectedClass: string,
  startDate: Date,
  endDate: Date,
  classes: Class[]
): Promise<ReportData> {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  const q = query(
    collection(db, 'attendance'),
    where('classId', '==', selectedClass),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  const allRecords: Attendance[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Attendance[];

  // Direct use - no filtering needed
  const records = allRecords;

  const classData = classes.find((c) => c.id === selectedClass);

  const summary = {
    totalStudents: classData?.students.length || 0,
    totalDays: records.length,
    present: records.reduce((sum, r) => sum + r.summary.present, 0),
    late: records.reduce((sum, r) => sum + r.summary.late, 0),
    absent: records.reduce((sum, r) => sum + r.summary.absent, 0),
    rate: 0,
  };

  const totalPossible = summary.totalStudents * summary.totalDays;
  summary.rate = totalPossible > 0 ? (summary.present / totalPossible) * 100 : 0;

  return {
    type: 'class',
    startDate: startDateStr,
    endDate: endDateStr,
    classId: selectedClass,
    className: classData?.name || '',
    records,
    summary,
  };
}

export async function generateStudentReport(
  selectedClass: string,
  selectedStudentIC: string,
  startDate: Date,
  endDate: Date,
  students: Student[]
): Promise<ReportData> {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  const q = query(
    collection(db, 'attendance'),
    where('classId', '==', selectedClass),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  const allRecords: Attendance[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Attendance[];

  // Direct use - no filtering needed
  const records = allRecords;

  // Filter records for this specific student using IC number
  const studentData = students.find((s) => s.icNumber === selectedStudentIC);
  let present = 0;
  let late = 0;
  let absent = 0;

  records.forEach((record) => {
    const studentRecord = record.records.find((r) => r.icNumber === selectedStudentIC);
    if (studentRecord) {
      if (studentRecord.status === 'present') present++;
      else if (studentRecord.status === 'late') late++;
      else if (studentRecord.status === 'absent') absent++;
    }
  });

  const totalDays = records.length;
  const rate = totalDays > 0 ? (present / totalDays) * 100 : 0;

  return {
    type: 'student',
    startDate: startDateStr,
    endDate: endDateStr,
    classId: selectedClass,
    studentId: selectedStudentIC, // Store IC number
    studentName: studentData?.name || '',
    records,
    summary: {
      totalStudents: 1,
      totalDays,
      present,
      late,
      absent,
      rate,
    },
  };
}

export async function generateCumulativeReport(
  startDate: Date,
  endDate: Date
): Promise<ReportData> {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  const q = query(
    collection(db, 'attendance'),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  const allRecords: Attendance[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Attendance[];

  // Direct use - no filtering needed
  const records = allRecords;

  // Get unique dates
  const uniqueDates = Array.from(new Set(records.map((r) => r.date)));

  const summary = {
    totalStudents: records.reduce((sum, r) => sum + r.summary.total, 0) / uniqueDates.length,
    totalDays: uniqueDates.length,
    present: records.reduce((sum, r) => sum + r.summary.present, 0),
    late: records.reduce((sum, r) => sum + r.summary.late, 0),
    absent: records.reduce((sum, r) => sum + r.summary.absent, 0),
    rate: 0,
  };

  const totalPossible = summary.present + summary.late + summary.absent;
  summary.rate = totalPossible > 0 ? (summary.present / totalPossible) * 100 : 0;

  return {
    type: 'cumulative',
    startDate: startDateStr,
    endDate: endDateStr,
    records,
    summary,
  };
}
