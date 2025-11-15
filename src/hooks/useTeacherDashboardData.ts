/**
 * Hook for loading teacher-specific dashboard data
 * Only shows data for assigned classes
 */

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { useAuth } from '@/hooks/useAuth';
import { getLatestVersions } from '@/utils/attendance/filters';
import type { Attendance, Class } from '@/types';
import { toast } from 'sonner';

interface TeacherDashboardStats {
  totalAssignedClasses: number;
  totalStudents: number;
  todaySubmissions: number;
  averageAttendance: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

interface ChartData {
  date: string;
  rate: number;
  present: number;
  absent: number;
  late: number;
}

interface ClassSummary {
  classId: string;
  className: string;
  studentCount: number;
  lastSubmission: string | null;
  weeklyRate: number;
}

interface DateFilter {
  from: Date;
  to: Date;
}

export function useTeacherDashboardData(dateFilter?: DateFilter) {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherDashboardStats>({
    totalAssignedClasses: 0,
    totalStudents: 0,
    todaySubmissions: 0,
    averageAttendance: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [recentActivity, setRecentActivity] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Create stable date strings to prevent infinite loops
  const dateFilterKey = dateFilter
    ? `${dateFilter.from.getTime()}-${dateFilter.to.getTime()}`
    : 'undefined';

  useEffect(() => {
    if (user?.assignedClasses && user.assignedClasses.length > 0) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, dateFilterKey]); // Use stable string key instead of object

  const getDateRange = (): { from: string; to: string } => {
    if (dateFilter) {
      return {
        from: dateFilter.from.toISOString().split('T')[0],
        to: dateFilter.to.toISOString().split('T')[0],
      };
    }
    // Default: last 7 days
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 6);
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    };
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel and share common queries
      const dateRange = getDateRange();

      // Check if user has assigned classes
      if (!user?.assignedClasses || user.assignedClasses.length === 0) {
        setLoading(false);
        return;
      }

      // Firestore 'in' query has a limit of 10 items
      const classIds = user.assignedClasses.slice(0, 10);

      // Fetch classes and attendance data once
      const [classesSnapshot, attendanceSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'classes'), where('__name__', 'in', classIds))),
        getDocs(
          query(
            collection(db, 'attendance'),
            where('date', '>=', dateRange.from),
            where('date', '<=', dateRange.to),
            where('classId', 'in', classIds)
          )
        ),
      ]);

      // Parse classes data
      const assignedClasses: Class[] = [];
      classesSnapshot.forEach((doc) => {
        assignedClasses.push({ id: doc.id, ...doc.data() } as Class);
      });

      // Parse all attendance records
      const allRecords: Attendance[] = [];
      attendanceSnapshot.forEach((doc) => {
        allRecords.push({ id: doc.id, ...doc.data() } as Attendance);
      });

      // Process all data using the shared queries
      processStats(assignedClasses, allRecords);
      processChartData(allRecords, dateRange);
      processClassSummaries(assignedClasses, allRecords);
      await loadRecentActivity(); // This one needs ordering, so keep separate
    } catch (error) {
      console.error('Error loading teacher dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processStats = (assignedClasses: Class[], allRecords: Attendance[]) => {
    const totalAssignedClasses = assignedClasses.length;
    const totalStudents = assignedClasses.reduce(
      (sum, cls) => sum + (cls.students?.length || 0),
      0
    );

    const latestRecords = getLatestVersions(allRecords);
    const todaySubmissions = latestRecords.length;

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalRate = 0;

    latestRecords.forEach((record) => {
      totalPresent += record.summary.present || 0;
      totalAbsent += record.summary.absent || 0;
      totalLate += record.summary.late || 0;
      totalRate += record.summary.rate || 0;
    });

    const averageAttendance = todaySubmissions > 0 ? Math.round(totalRate / todaySubmissions) : 0;

    setStats({
      totalAssignedClasses,
      totalStudents,
      todaySubmissions,
      averageAttendance,
      presentToday: totalPresent,
      absentToday: totalAbsent,
      lateToday: totalLate,
    });
  };

  const processChartData = (allRecords: Attendance[], dateRange: { from: string; to: string }) => {
    const startDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    const daysDiff =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Group records by date
    const recordsByDate = new Map<string, Attendance[]>();
    allRecords.forEach((record) => {
      const dateStr = record.date;
      if (!recordsByDate.has(dateStr)) {
        recordsByDate.set(dateStr, []);
      }
      recordsByDate.get(dateStr)!.push(record);
    });

    // Process data for each day
    const data: ChartData[] = [];
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayRecords = recordsByDate.get(dateStr) || [];
      const latestRecords = getLatestVersions(dayRecords);

      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLate = 0;
      let totalRate = 0;

      latestRecords.forEach((record) => {
        totalPresent += record.summary.present || 0;
        totalAbsent += record.summary.absent || 0;
        totalLate += record.summary.late || 0;
        totalRate += record.summary.rate || 0;
      });

      const avgRate = latestRecords.length > 0 ? Math.round(totalRate / latestRecords.length) : 0;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: avgRate,
        present: totalPresent,
        absent: totalAbsent,
        late: totalLate,
      });
    }

    setChartData(data);
  };

  const processClassSummaries = (assignedClasses: Class[], allRecords: Attendance[]) => {
    const summaries: ClassSummary[] = [];

    assignedClasses.forEach((classData) => {
      // Filter records for this class
      const classRecords = allRecords.filter((r) => r.classId === classData.id);
      const latestRecords = getLatestVersions(classRecords);

      let totalRate = 0;
      let lastSubmission: string | null = null;

      latestRecords.forEach((record) => {
        totalRate += record.summary.rate || 0;
        if (!lastSubmission || record.date > lastSubmission) {
          lastSubmission = record.date;
        }
      });

      const weeklyRate =
        latestRecords.length > 0 ? Math.round(totalRate / latestRecords.length) : 0;

      summaries.push({
        classId: classData.id,
        className: classData.name,
        studentCount: classData.students?.length || 0,
        lastSubmission,
        weeklyRate,
      });
    });

    // Sort by weekly rate (lowest first to show classes needing attention)
    summaries.sort((a, b) => a.weeklyRate - b.weeklyRate);

    setClassSummaries(summaries);
  };

  const loadRecentActivity = async () => {
    if (!user?.assignedClasses || user.assignedClasses.length === 0) return;

    try {
      const dateRange = getDateRange();
      const startDate = dateRange.from;
      const endDate = dateRange.to;

      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('classId', 'in', user.assignedClasses.slice(0, 10)),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(attendanceQuery);

      const activities: Attendance[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
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
        } as Attendance);
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      throw error;
    }
  };

  return {
    stats,
    chartData,
    classSummaries,
    recentActivity,
    loading,
    refetch: loadDashboardData,
  };
}
