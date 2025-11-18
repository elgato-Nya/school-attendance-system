import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { getAllClasses } from '@/services/class/class.service';
import { getLatestVersions } from '@/utils/attendance/filters';
import type { Attendance, Class } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  todaySubmissions: number;
  averageAttendance: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

interface TodaySubmission {
  classId: string;
  className: string;
  submittedBy: string;
  submittedByName: string;
  timestamp: Date;
}

interface ChartData {
  date: string;
  rate: number;
  present: number;
  absent: number;
  late: number;
}

interface Alert {
  id: string;
  classId: string;
  className: string;
  grade: number;
  rate: number;
  date: string;
  severity: 'high' | 'medium' | 'low';
}

interface DateFilter {
  from: Date;
  to: Date;
}

export function useDashboardData(dateFilter?: DateFilter) {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    todaySubmissions: 0,
    averageAttendance: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivity, setRecentActivity] = useState<Attendance[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [todaySubmissions, setTodaySubmissions] = useState<TodaySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter?.from?.getTime(), dateFilter?.to?.getTime()]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch data efficiently with minimal queries
      const today = format(new Date(), 'yyyy-MM-dd');

      // Use dateFilter if provided, otherwise default to last 7 days
      let startDate: string;
      let endDate: string;
      let chartStartDate: string;
      let chartEndDate: string;

      if (dateFilter) {
        startDate = format(dateFilter.from, 'yyyy-MM-dd');
        endDate = format(dateFilter.to, 'yyyy-MM-dd');

        // Check if single day selection
        const daysDiff = Math.ceil(
          (dateFilter.to.getTime() - dateFilter.from.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {
          // Single day - expand chart data range to include prev and next day
          const prevDate = new Date(dateFilter.from);
          prevDate.setDate(prevDate.getDate() - 1);
          const nextDate = new Date(dateFilter.to);
          nextDate.setDate(nextDate.getDate() + 1);

          chartStartDate = format(prevDate, 'yyyy-MM-dd');
          chartEndDate = format(nextDate, 'yyyy-MM-dd');
        } else {
          // Multiple days - use same range
          chartStartDate = startDate;
          chartEndDate = endDate;
        }
      } else {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        startDate = format(sevenDaysAgo, 'yyyy-MM-dd');
        endDate = today;
        chartStartDate = startDate;
        chartEndDate = endDate;
      }

      // PERFORMANCE: Fetch all classes and attendance data in parallel with single queries
      // Use chartStartDate/chartEndDate for fetching to include prev/next day data
      const [allClasses, attendanceSnapshot] = await Promise.all([
        getAllClasses(),
        getDocs(
          query(
            collection(db, 'attendance'),
            where('date', '>=', chartStartDate),
            where('date', '<=', chartEndDate)
          )
        ),
      ]);

      // Store classes for submission details
      setClasses(allClasses);

      // Parse all attendance records once
      const allRecords: Attendance[] = [];
      attendanceSnapshot.forEach((doc) => {
        allRecords.push({ id: doc.id, ...doc.data() } as Attendance);
      });

      // Process all data using shared queries
      // Use startDate/endDate for stats (user-selected range only)
      // Use chartStartDate/chartEndDate for chart (includes prev/next day for single date)
      processStats(allClasses, allRecords, today, startDate, endDate);
      processChartData(allRecords, chartStartDate, chartEndDate);
      processAlerts(allRecords, today);
      await loadRecentActivity(); // Needs ordering, keep separate
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const processStats = (
    classes: any[],
    allRecords: Attendance[],
    today: string,
    startDate: string,
    endDate: string
  ) => {
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);

    // Get today's records for submission count
    const todayRecords = allRecords.filter((r) => r.date === today);
    const latestTodayRecords = getLatestVersions(todayRecords);

    // Count unique classes that submitted today
    const todaySubmissionsCount = latestTodayRecords.length;

    // Extract today's submission details for the dialog
    const todaySubmissionDetails: TodaySubmission[] = latestTodayRecords.map((record) => ({
      classId: record.classId,
      className: record.className,
      submittedBy: record.submittedBy,
      submittedByName: record.submittedByName,
      timestamp: record.timestamp?.toDate ? record.timestamp.toDate() : new Date(),
    }));
    setTodaySubmissions(todaySubmissionDetails);

    // Calculate stats for the USER-SELECTED date range only (not including prev/next day)
    const dateRangeRecords = allRecords.filter((r) => r.date >= startDate && r.date <= endDate);
    const latestRecords = getLatestVersions(dateRangeRecords);

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

    const averageAttendance =
      latestRecords.length > 0 ? Math.round(totalRate / latestRecords.length) : 0;

    setStats({
      totalClasses,
      totalStudents,
      todaySubmissions: todaySubmissionsCount,
      averageAttendance,
      presentToday: totalPresent,
      absentToday: totalAbsent,
      lateToday: totalLate,
    });
  };

  const processChartData = (allRecords: Attendance[], startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Group records by date
    const recordsByDate = new Map<string, Attendance[]>();
    allRecords.forEach((record) => {
      const dateStr = record.date;
      if (!recordsByDate.has(dateStr)) {
        recordsByDate.set(dateStr, []);
      }
      recordsByDate.get(dateStr)!.push(record);
    });

    const data: ChartData[] = [];
    // Use the provided startDate and endDate (already expanded if single day)
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');

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

  const processAlerts = (allRecords: Attendance[], today: string) => {
    const todayRecords = allRecords.filter((r) => r.date === today);
    const latestRecords = getLatestVersions(todayRecords);

    const lowAttendanceAlerts: Alert[] = [];

    latestRecords.forEach((record) => {
      if (record.summary.rate < 85) {
        const severity: 'high' | 'medium' | 'low' =
          record.summary.rate < 75 ? 'high' : record.summary.rate < 85 ? 'medium' : 'low';

        lowAttendanceAlerts.push({
          id: record.id,
          classId: record.classId,
          className: record.className,
          grade: parseInt(record.className.split(' ')[1]) || 0,
          rate: record.summary.rate,
          date: record.date,
          severity,
        });
      }
    });

    // Sort by severity and rate
    lowAttendanceAlerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return a.rate - b.rate;
    });

    setAlerts(lowAttendanceAlerts);
  };

  const loadRecentActivity = async () => {
    try {
      const attendanceQuery = query(
        collection(db, 'attendance'),
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

  // Calculate date range description
  const getDateRangeDescription = () => {
    if (!dateFilter) {
      return 'Last 7 days';
    }

    const start = dateFilter.from;
    const end = dateFilter.to;
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Single day
      return format(start, 'MMM d, yyyy');
    } else if (daysDiff === 6) {
      // Exactly 7 days (last 7 days)
      return 'Last 7 days';
    } else if (daysDiff < 7) {
      // Less than 7 days
      return `Last ${daysDiff + 1} days`;
    } else {
      // Custom range
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
  };

  return {
    stats,
    chartData,
    alerts,
    recentActivity,
    classes,
    todaySubmissions,
    dateRangeDescription: getDateRangeDescription(),
    loading,
    refetch: loadDashboardData,
  };
}
