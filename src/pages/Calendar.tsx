/**
 * Calendar Page - Interactive attendance calendar with reports
 * Refactored with proper range selection and comprehensive business logic
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllHolidays } from '@/services/holiday.service';
import { getAllClasses } from '@/services/class/class.service';
import { getAttendanceByDate } from '@/services/attendance.service';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import type { Holiday, Class, Attendance } from '@/types';
import { parseISO, isWeekend, isBefore, format as formatDate } from 'date-fns';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarLegend } from '@/components/calendar/CalendarLegend';
import { RangeSelectionInfo } from '@/components/calendar/RangeSelectionInfo';
import { CalendarView } from '@/components/calendar/CalendarView';
import { DayReportModal } from '@/components/calendar/DayReportModal';
import { RangeReportModal } from '@/components/calendar/RangeReportModal';
import { toast } from '@/utils/toast';
import { getAttendanceColor, getHolidayColor, CALENDAR_COLORS } from '@/constants/calendar';

interface DayReport {
  date: string;
  classReports: {
    classId: string;
    className: string;
    grade: number;
    totalStudents: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
  }[];
  overall: {
    totalStudents: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
  };
}

interface RangeReport {
  startDate: string;
  endDate: string;
  totalDays: number;
  daysWithData: number;
  overall: {
    totalStudents: number;
    totalAttendanceRecords: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
  };
  dailyBreakdown: Array<{
    date: string;
    totalStudents: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
    classCount: number;
  }>;
  classPerformance: Array<{
    classId: string;
    className: string;
    daysReported: number;
    avgAttendanceRate: number;
    totalPresent: number;
    totalLate: number;
    totalAbsent: number;
  }>;
}

export default function CalendarPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [attendanceData, setAttendanceData] = useState<Map<string, Attendance[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMonthData, setLoadingMonthData] = useState(false);

  // Day report modal
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayReport, setDayReport] = useState<DayReport | null>(null);

  // Range report modal
  const [rangeModalOpen, setRangeModalOpen] = useState(false);
  const [rangeReport, setRangeReport] = useState<RangeReport | null>(null);

  // Range selection state
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [rangeMode, setRangeMode] = useState(false);

  // Cache for loaded months to prevent redundant API calls
  // @ts-expect-error - loadedMonths used in functional state update
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());

  // Load attendance for a specific month
  const loadAttendanceForMonth = useCallback(async (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;

    try {
      // Check if already loaded using functional state
      let alreadyLoaded = false;
      setLoadedMonths((prev) => {
        alreadyLoaded = prev.has(monthKey);
        return prev; // Don't modify yet
      });

      if (alreadyLoaded) {
        return;
      }

      setLoadingMonthData(true);

      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;

      const q = query(
        collection(db, 'attendance'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const dataMap = new Map<string, Attendance[]>();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const attendance: Attendance = {
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
        };
        const existing = dataMap.get(attendance.date) || [];
        dataMap.set(attendance.date, [...existing, attendance]);
      });

      // Merge with existing data
      setAttendanceData((prev) => new Map([...prev, ...dataMap]));

      // Mark as loaded AFTER successful fetch
      setLoadedMonths((prev) => new Set([...prev, monthKey]));
    } catch (error) {
      console.error(`Load attendance for month ${monthKey} error:`, error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoadingMonthData(false);
    }
  }, []); // Initial data load (holidays and classes) - separate from attendance data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [holidaysData, classesData] = await Promise.all([getAllHolidays(), getAllClasses()]);

        setHolidays(holidaysData);
        setClasses(classesData);
      } catch (error) {
        console.error('Load calendar data error:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load current month attendance data asynchronously (doesn't block page load)
  useEffect(() => {
    const loadCurrentMonth = async () => {
      try {
        await loadAttendanceForMonth(new Date());
      } catch (error) {
        console.error('Failed to load current month attendance:', error);
        // Don't show error toast - user can see via loading indicator
      }
    };

    // Only load after holidays and classes are ready
    if (!loading) {
      loadCurrentMonth();
    }
  }, [loading, loadAttendanceForMonth]);

  // Memoize getDateInfo to prevent recalculation on every render
  const getDateInfo = useCallback(
    (dateStr: string): { color: string; textColor: string; tooltip?: string } => {
      const holiday = holidays.find((h) => h.date === dateStr);
      const date = parseISO(dateStr);
      const isWeekendDay = isWeekend(date);

      // Holiday information
      if (holiday) {
        const holidayColors = getHolidayColor(holiday.type);
        return {
          color: holidayColors.background,
          textColor: holidayColors.foreground,
          tooltip: `${holidayColors.label}: ${holiday.name}`,
        };
      }

      // Weekend
      if (isWeekendDay) {
        return {
          color: CALENDAR_COLORS.WEEKEND,
          textColor: CALENDAR_COLORS.WEEKEND_FOREGROUND,
          tooltip: 'Weekend',
        };
      }

      // Attendance data
      const dayAttendance = attendanceData.get(dateStr);
      if (!dayAttendance || dayAttendance.length === 0) {
        return {
          color: CALENDAR_COLORS.NO_DATA,
          textColor: CALENDAR_COLORS.NO_DATA_FOREGROUND,
        };
      }

      let totalPresent = 0;
      let totalStudents = 0;
      dayAttendance.forEach((att) => {
        totalPresent += att.summary.present;
        totalStudents += att.summary.total;
      });

      const rate = totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;
      const attendanceColors = getAttendanceColor(rate);

      return {
        color: attendanceColors.background,
        textColor: attendanceColors.foreground,
        tooltip: `${attendanceColors.label}: ${rate.toFixed(1)}% attendance`,
      };
    },
    [holidays, attendanceData]
  );

  const handleDateClick = useCallback(
    (dateStr: string) => {
      if (rangeMode) {
        handleRangeSelection(dateStr);
      } else {
        handleDayReportOpen(dateStr);
      }
    },
    [rangeMode, rangeStart, rangeEnd]
  );

  const handleRangeSelection = useCallback(
    (dateStr: string) => {
      if (!rangeStart) {
        // First click - set start date
        setRangeStart(dateStr);
        toast.success(`Start date selected: ${formatDate(parseISO(dateStr), 'MMM dd, yyyy')}`);
      } else if (!rangeEnd) {
        // Second click - validate and set end date
        const start = parseISO(rangeStart);
        const end = parseISO(dateStr);

        // Ensure end is after start
        if (isBefore(end, start)) {
          toast.error('End date must be after start date. Please select again.');
          setRangeStart(dateStr);
          setRangeEnd(null);
          return;
        }

        // Check if range is reasonable (max 90 days)
        const daysDiff = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 90) {
          toast.error('Date range cannot exceed 90 days. Please select a shorter range.');
          setRangeStart(null);
          setRangeEnd(null);
          return;
        }

        setRangeEnd(dateStr);
        toast.success(`Range selected: ${daysDiff + 1} days`);

        // Generate report after short delay for UX
        setTimeout(() => {
          generateRangeReport(rangeStart, dateStr);
        }, 300);
      } else {
        // Third click - reset and start new selection
        setRangeStart(dateStr);
        setRangeEnd(null);
        toast.info('Starting new range selection');
      }
    },
    [rangeStart, rangeEnd]
  );

  const handleDayReportOpen = async (dateStr: string) => {
    await generateDayReport(dateStr);
    setDayModalOpen(true);
  };

  const generateDayReport = async (dateStr: string) => {
    try {
      // Fetch fresh data for the selected date
      const allDayAttendance = await getAttendanceByDate(dateStr);

      // Direct use - database ensures no duplicates
      const dayAttendance = allDayAttendance;

      const classReports = dayAttendance.map((att: Attendance) => {
        const classData = classes.find((c) => c.id === att.classId);
        return {
          classId: att.classId,
          className: att.className,
          grade: classData?.grade || 0,
          totalStudents: att.summary.total,
          present: att.summary.present,
          late: att.summary.late,
          absent: att.summary.absent,
          rate: att.summary.rate,
        };
      });

      const overall = {
        totalStudents: classReports.reduce((sum: number, r: any) => sum + r.totalStudents, 0),
        present: classReports.reduce((sum: number, r: any) => sum + r.present, 0),
        late: classReports.reduce((sum: number, r: any) => sum + r.late, 0),
        absent: classReports.reduce((sum: number, r: any) => sum + r.absent, 0),
        rate: 0,
      };

      overall.rate =
        overall.totalStudents > 0 ? (overall.present / overall.totalStudents) * 100 : 0;

      setDayReport({
        date: dateStr,
        classReports,
        overall,
      });
    } catch (error) {
      console.error('Generate day report error:', error);
      toast.error('Failed to generate day report');
    }
  };

  const generateRangeReport = async (start: string, end: string) => {
    try {
      toast.loading('Generating range report...');

      // Query all attendance records in the range
      const q = query(
        collection(db, 'attendance'),
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const allAttendance: Attendance[] = snapshot.docs.map((doc) => {
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

      // Direct use - database ensures no duplicates
      const latestAttendance = allAttendance;

      if (latestAttendance.length === 0) {
        toast.dismiss();
        toast.error('No attendance data found for this date range');
        setRangeMode(false);
        setRangeStart(null);
        setRangeEnd(null);
        return;
      }

      // Calculate total days in range
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      const totalDays =
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Group by date for daily breakdown
      const dailyMap = new Map<string, Attendance[]>();
      latestAttendance.forEach((att) => {
        const existing = dailyMap.get(att.date) || [];
        dailyMap.set(att.date, [...existing, att]);
      });

      // Calculate daily breakdown
      const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, dayAttendance]) => {
        const totalStudents = dayAttendance.reduce((sum, att) => sum + att.summary.total, 0);
        const present = dayAttendance.reduce((sum, att) => sum + att.summary.present, 0);
        const late = dayAttendance.reduce((sum, att) => sum + att.summary.late, 0);
        const absent = dayAttendance.reduce((sum, att) => sum + att.summary.absent, 0);
        const rate = totalStudents > 0 ? (present / totalStudents) * 100 : 0;

        return {
          date,
          totalStudents,
          present,
          late,
          absent,
          rate,
          classCount: dayAttendance.length,
        };
      });

      // Calculate class performance
      const classMap = new Map<
        string,
        {
          className: string;
          days: number;
          totalPresent: number;
          totalLate: number;
          totalAbsent: number;
          totalStudents: number;
        }
      >();

      // �?FIX: Use latestAttendance instead of allAttendance
      latestAttendance.forEach((att) => {
        const existing = classMap.get(att.classId) || {
          className: att.className,
          days: 0,
          totalPresent: 0,
          totalLate: 0,
          totalAbsent: 0,
          totalStudents: 0,
        };

        existing.days++;
        existing.totalPresent += att.summary.present;
        existing.totalLate += att.summary.late;
        existing.totalAbsent += att.summary.absent;
        existing.totalStudents += att.summary.total;

        classMap.set(att.classId, existing);
      });

      const classPerformance = Array.from(classMap.entries()).map(([classId, data]) => {
        const avgAttendanceRate =
          data.totalStudents > 0 ? (data.totalPresent / data.totalStudents) * 100 : 0;

        return {
          classId,
          className: data.className,
          daysReported: data.days,
          avgAttendanceRate,
          totalPresent: data.totalPresent,
          totalLate: data.totalLate,
          totalAbsent: data.totalAbsent,
        };
      });

      // Calculate overall stats
      // �?FIX: Use latestAttendance for accurate totals
      const totalAttendanceRecords = latestAttendance.reduce(
        (sum, att) => sum + att.summary.total,
        0
      );
      const totalPresent = latestAttendance.reduce((sum, att) => sum + att.summary.present, 0);
      const totalLate = latestAttendance.reduce((sum, att) => sum + att.summary.late, 0);
      const totalAbsent = latestAttendance.reduce((sum, att) => sum + att.summary.absent, 0);
      const avgStudentsPerDay =
        dailyBreakdown.length > 0
          ? dailyBreakdown.reduce((sum, day) => sum + day.totalStudents, 0) / dailyBreakdown.length
          : 0;
      const overallRate =
        totalAttendanceRecords > 0 ? (totalPresent / totalAttendanceRecords) * 100 : 0;

      const report: RangeReport = {
        startDate: start,
        endDate: end,
        totalDays,
        daysWithData: dailyBreakdown.length,
        overall: {
          totalStudents: avgStudentsPerDay,
          totalAttendanceRecords,
          present: totalPresent,
          late: totalLate,
          absent: totalAbsent,
          rate: overallRate,
        },
        dailyBreakdown,
        classPerformance,
      };

      setRangeReport(report);
      setRangeModalOpen(true);

      toast.dismiss();
      toast.success('Range report generated successfully!');
    } catch (error) {
      console.error('Generate range report error:', error);
      toast.dismiss();
      toast.error('Failed to generate range report');
    } finally {
      // Reset range selection
      setRangeMode(false);
      setRangeStart(null);
      setRangeEnd(null);
    }
  };

  const handleToggleRangeMode = useCallback(() => {
    setRangeMode(!rangeMode);
    setRangeStart(null);
    setRangeEnd(null);
  }, [rangeMode]);

  const handleCancelRangeSelection = useCallback(() => {
    setRangeMode(false);
    setRangeStart(null);
    setRangeEnd(null);
    toast.info('Range selection cancelled');
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        role="status"
        aria-live="polite"
        aria-label="Loading calendar"
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <CalendarHeader rangeMode={rangeMode} onToggleRangeMode={handleToggleRangeMode} />

      <CalendarLegend />

      {rangeMode && (
        <RangeSelectionInfo
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onCancel={handleCancelRangeSelection}
        />
      )}

      <CalendarView
        onDateClick={handleDateClick}
        onMonthChange={loadAttendanceForMonth}
        getDateInfo={getDateInfo}
        holidays={holidays}
        rangeMode={rangeMode}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        isLoadingData={loadingMonthData}
      />

      <DayReportModal
        open={dayModalOpen}
        onOpenChange={setDayModalOpen}
        dayReport={dayReport}
        classes={classes}
      />

      <RangeReportModal
        open={rangeModalOpen}
        onOpenChange={setRangeModalOpen}
        rangeReport={rangeReport}
      />
    </div>
  );
}
