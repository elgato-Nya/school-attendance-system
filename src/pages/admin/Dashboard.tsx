import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingState } from '@/components/attendance/LoadingState';
import { DuplicateChecker } from '@/components/admin/DuplicateChecker';
import { DuplicateMerger } from '@/components/admin/DuplicateMerger';
import {
  DateRangeFilter,
  type DateRangePreset,
  type DateRange,
} from '@/components/dashboard/DateRangeFilter';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Users, UserCheck, UserX, Clock, TrendingUp, School, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRangePreset>('week');
  const [customRange, setCustomRange] = useState<DateRange>();

  // Calculate date filter from state and memoize it to prevent infinite loops
  const dateFilter = useMemo(() => {
    if (dateRange === 'custom' && customRange?.from && customRange?.to) {
      return { from: customRange.from, to: customRange.to };
    }

    const to = new Date();
    const from = new Date();

    switch (dateRange) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case 'week':
        from.setDate(from.getDate() - 6);
        break;
      case 'month':
        from.setDate(from.getDate() - 29);
        break;
      case 'all':
        return undefined; // No filter for all-time
    }

    return { from, to };
  }, [dateRange, customRange]);

  const { stats, chartData, alerts, recentActivity, loading, refetch } =
    useDashboardData(dateFilter);

  const handleDateRangeChange = (preset: DateRangePreset, custom?: DateRange) => {
    setDateRange(preset);
    if (custom) {
      setCustomRange(custom);
    }
    // Data will automatically refetch due to dateFilter dependency in hook
  };

  const handleViewClass = (classId: string) => {
    navigate(`/admin/classes?classId=${classId}`);
  };

  if (loading) {
    return (
      <div className="p-6" role="status" aria-live="polite" aria-label="Loading dashboard data">
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of school attendance and performance metrics
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-[2]">
            <DateRangeFilter
              value={dateRange}
              customRange={customRange}
              onChange={handleDateRangeChange}
            />
          </div>
          <Button
            onClick={refetch}
            variant="outline"
            className="flex-1 sm:flex-initial"
            aria-label="Refresh dashboard data"
          >
            <RefreshCcw className="h-4 w-4 mr-2" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-labelledby="key-stats-title"
      >
        <h2 id="key-stats-title" className="sr-only">
          Key Statistics
        </h2>
        <StatsCard title="Total Classes" value={stats.totalClasses} icon={School} variant="info" />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Today's Submissions"
          value={`${stats.todaySubmissions}/${stats.totalClasses}`}
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title="Average Attendance"
          value={`${stats.averageAttendance}%`}
          icon={UserCheck}
          variant={
            stats.averageAttendance >= 90
              ? 'success'
              : stats.averageAttendance >= 75
                ? 'warning'
                : 'danger'
          }
        />
      </section>

      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        aria-labelledby="today-attendance-title"
      >
        <h2 id="today-attendance-title" className="sr-only">
          Today's Attendance Breakdown
        </h2>
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          variant="success"
        />
        <StatsCard title="Late Today" value={stats.lateToday} icon={Clock} variant="warning" />
        <StatsCard title="Absent Today" value={stats.absentToday} icon={UserX} variant="danger" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart
            data={chartData}
            type="area"
            title="Weekly Attendance Trends"
            description="Daily attendance rates and student counts over the last 7 days"
          />
        </div>
        <div className="lg:col-span-1">
          <AlertCard alerts={alerts} onViewClass={handleViewClass} />
        </div>
      </section>

      <section aria-labelledby="recent-activity-title">
        <h2 id="recent-activity-title" className="sr-only">
          Recent Attendance Submissions
        </h2>
        <RecentActivity activities={recentActivity} maxItems={10} />
      </section>

      {/* Temporary diagnostic tool */}
      <section aria-labelledby="diagnostic-tools-title">
        <h2 id="diagnostic-tools-title" className="text-xl font-semibold mb-4">
          🔧 Diagnostic Tools
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DuplicateChecker />
          <DuplicateMerger />
        </div>
      </section>
    </div>
  );
}
