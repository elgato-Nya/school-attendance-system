import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingState } from '@/components/attendance/LoadingState';
import {
  DateRangeFilter,
  type DateRangePreset,
  type DateRange,
} from '@/components/dashboard/DateRangeFilter';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { useAuth } from '@/hooks/useAuth';
import {
  ClipboardCheck,
  BarChart3,
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  School,
  RefreshCcw,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const { stats, chartData, classSummaries, recentActivity, loading, refetch } =
    useTeacherDashboardData(dateFilter);

  const handleDateRangeChange = (preset: DateRangePreset, custom?: DateRange) => {
    setDateRange(preset);
    if (custom) {
      setCustomRange(custom);
    }
    // Data will automatically refetch due to dateFilter dependency in hook
  };

  // Get first assigned class for mark attendance navigation
  const firstClassId = user?.assignedClasses?.[0];

  if (loading) {
    return (
      <div className="p-6" role="status" aria-live="polite" aria-label="Loading dashboard data">
        <LoadingState message="Loading your dashboard..." />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record attendance for today',
      icon: ClipboardCheck,
      path: firstClassId ? `/teacher/mark-attendance/${firstClassId}` : '/teacher/classes',
      variant: 'default' as const,
    },
    {
      title: 'View History',
      description: 'Browse attendance records',
      icon: Calendar,
      path: '/teacher/attendance-history',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage attendance for your assigned classes
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
            disabled={loading}
            aria-label="Refresh dashboard data"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="grid gap-4 md:grid-cols-2" aria-label="Quick actions">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="hover-elevation-md cursor-pointer"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Key Statistics */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-labelledby="key-stats-title"
      >
        <h2 id="key-stats-title" className="sr-only">
          Key Statistics
        </h2>
        <StatsCard
          title="My Classes"
          value={stats.totalAssignedClasses}
          icon={School}
          variant="info"
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Today's Submissions"
          value={`${stats.todaySubmissions}/${stats.totalAssignedClasses}`}
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

      {/* Today's Breakdown */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        aria-labelledby="today-breakdown-title"
      >
        <h2 id="today-breakdown-title" className="sr-only">
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

      {/* Charts and Class Summaries */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart
            data={chartData}
            type="area"
            title="Weekly Attendance Trends"
            description="Your classes' attendance rates over the last 7 days"
          />
        </div>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              Class Performance
            </CardTitle>
            <CardDescription>Weekly attendance rates by class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {classSummaries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <School className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No attendance data yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start marking attendance to see insights
                </p>
              </div>
            ) : (
              classSummaries.map((summary) => (
                <div
                  key={summary.classId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                  onClick={() =>
                    navigate('/teacher/attendance-history', { state: { classId: summary.classId } })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate('/teacher/attendance-history', {
                        state: { classId: summary.classId },
                      });
                    }
                  }}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{summary.className}</p>
                    <p className="text-xs text-muted-foreground">{summary.studentCount} students</p>
                  </div>
                  <Badge
                    variant={
                      summary.weeklyRate >= 90
                        ? 'success'
                        : summary.weeklyRate >= 75
                          ? 'warning'
                          : 'destructive'
                    }
                  >
                    {summary.weeklyRate}%
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity */}
      <section aria-labelledby="recent-activity-title">
        <h2 id="recent-activity-title" className="sr-only">
          Recent Attendance Submissions
        </h2>
        <RecentActivity activities={recentActivity} maxItems={10} />
      </section>
    </div>
  );
}
