import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Class, Attendance, Student } from '@/types';
import type { StudentWithStats } from '@/components/student/StudentListTable';

type ViewMode = 'single' | 'range';

interface UseStudentListDataProps {
  userId: string | undefined;
  userRole: 'admin' | 'teacher' | 'student' | undefined;
  assignedClasses: string[] | undefined;
  viewMode: ViewMode;
  singleDate: Date | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export function useStudentListData({
  userId,
  userRole,
  assignedClasses,
  viewMode,
  singleDate,
  startDate,
  endDate,
}: UseStudentListDataProps) {
  const [allStudents, setAllStudents] = useState<StudentWithStats[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadData();
  }, [userId, userRole, assignedClasses, singleDate, startDate, endDate, viewMode]);

  const loadData = async () => {
    // Check if user has assigned classes (teachers) or is admin
    if (userRole === 'teacher' && !assignedClasses?.length) {
      setLoading(false);
      toast.info('No classes assigned to you yet.');
      return;
    }

    setLoading(true);
    try {
      let classIds: string[] = [];

      // For teachers, use assigned classes; for admins, get all classes
      if (userRole === 'teacher' && assignedClasses) {
        classIds = assignedClasses;
      } else if (userRole === 'admin') {
        // Load all classes for admin
        const classesRef = collection(db, 'classes');
        const allClassesSnapshot = await getDocs(classesRef);
        classIds = allClassesSnapshot.docs.map((doc) => doc.id);
      }

      if (classIds.length === 0) {
        setLoading(false);
        toast.info('No classes available.');
        return;
      }

      // Load all classes
      const classesRef = collection(db, 'classes');
      const classQuery = query(classesRef, where('__name__', 'in', classIds));
      const classesSnapshot = await getDocs(classQuery);
      const classesData = classesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Class
      );
      setClasses(classesData);

      // Extract ALL students from the classes (students are stored inside class documents)
      const studentsData: Student[] = [];
      classesData.forEach((classDoc) => {
        if (classDoc.students && Array.isArray(classDoc.students)) {
          // Add classId to each student if not already present
          const classStudents = classDoc.students.map((student) => ({
            ...student,
            classId: student.classId || classDoc.id,
          }));
          studentsData.push(...classStudents);
        }
      });

      // Load attendance records based on date range
      let queryStartDate: string;
      let queryEndDate: string;

      if (viewMode === 'single' && singleDate) {
        queryStartDate = format(singleDate, 'yyyy-MM-dd');
        queryEndDate = format(singleDate, 'yyyy-MM-dd');
      } else if (viewMode === 'range' && startDate && endDate) {
        queryStartDate = format(startDate, 'yyyy-MM-dd');
        queryEndDate = format(endDate, 'yyyy-MM-dd');
      } else {
        // Fallback to today
        const today = new Date();
        queryStartDate = format(today, 'yyyy-MM-dd');
        queryEndDate = format(today, 'yyyy-MM-dd');
      }

      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('classId', 'in', classIds),
        where('date', '>=', queryStartDate),
        where('date', '<=', queryEndDate)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceRecords = attendanceSnapshot.docs.map((doc) => {
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

      // Calculate stats for each student
      // Only count days where the student actually has a record (not days before enrollment)
      const studentsWithStats = studentsData.map((student) => {
        let recordsForStudent = 0;
        let presentDays = 0;
        let lateDays = 0;
        let absentDays = 0;
        let lateTime: string | undefined = undefined;

        // Only count attendance records where this student appears
        attendanceRecords.forEach((record) => {
          if (record.classId !== student.classId) return;

          const studentRecord = record.records.find((r) => r.icNumber === student.icNumber);
          if (studentRecord) {
            recordsForStudent++; // This student has a record for this date

            if (studentRecord.status === 'present') {
              presentDays++;
            } else if (studentRecord.status === 'late') {
              presentDays++;
              lateDays++;
              // For single day view, capture the late time
              if (viewMode === 'single' && studentRecord.lateTime) {
                lateTime = studentRecord.lateTime;
              }
            } else if (studentRecord.status === 'absent') {
              absentDays++;
            }
            // Note: 'excused' is not counted in present/absent for rate calculation
          }
        });

        const attendanceRate = recordsForStudent > 0 ? (presentDays / recordsForStudent) * 100 : 0;

        return {
          ...student,
          id: student.id || student.icNumber, // Ensure id is always defined
          totalDays: recordsForStudent, // Only days with actual records
          presentDays,
          absentDays,
          lateDays,
          attendanceRate,
          lateTime, // Include late time for single day view
        };
      });

      setAllStudents(studentsWithStats);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  return {
    allStudents,
    classes,
    loading,
    refetch: loadData,
  };
}
