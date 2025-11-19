import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { LoadingState } from '@/components/attendance/LoadingState';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { SubmissionDetailsDialog } from '@/components/dashboard/SubmissionDetailsDialog';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getAllUsers } from '@/services/user/user.service';
import type { User } from '@/types';
import { Users, UserCheck, UserX, Clock, TrendingUp, School, RefreshCcw } from 'lucide-react';

export function AdminDashboard() {
  // Default: last 7 days
  const defaultDateRange = useMemo(() => {
    const today = new Date();
    return { from: today, to: today };
  }, []);

  const [dateFilter, setDateFilter] = useState(defaultDateRange);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);

  const {
    stats,
    chartData,
    alerts,
    recentActivity,
    classes,
    todaySubmissions,
    dateRangeDescription,
    loading,
    refetch,
  } = useDashboardData(dateFilter);

  // Load teachers for submission details
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const users = await getAllUsers();
      setTeachers(users.filter((u) => u.role === 'teacher' || u.role === 'admin'));
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const handleDateChange = (range: { from: Date; to: Date }) => {
    setDateFilter(range);
  };

  const handleDateReset = () => {
    setDateFilter(defaultDateRange);
  };

  if (loading) {
    return (
      <div
        className="p-6"
        role="status"
        aria-live="polite"
        aria-label="Memuatkan data papan pemuka"
      >
        <LoadingState message="Memuatkan papan pemuka..." />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 space-y-4 md:space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Papan Pemuka Pentadbir
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gambaran keseluruhan dan analitik kehadiran seluruh sekolah
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilter value={dateFilter} onChange={handleDateChange} onReset={handleDateReset} />
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            aria-label="Muat semula"
            className="h-9 w-9 p-0"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Enhanced Key Stats with Lighter Gradients and Icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-purple-50/70 via-purple-50/30 to-background dark:from-purple-950/20 dark:via-purple-950/10 dark:to-background p-4 md:p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full -mr-10 -mt-10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Jumlah Kelas</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalClasses}</p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <School className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50/70 via-blue-50/30 to-background dark:from-blue-950/20 dark:via-blue-950/10 dark:to-background p-4 md:p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Jumlah Murid</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalStudents}</p>
            </div>
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <button
          onClick={() => setSubmissionDialogOpen(true)}
          className={`group relative overflow-hidden rounded-xl border bg-linear-to-br ${
            stats.todaySubmissions === stats.totalClasses
              ? 'from-green-50/70 via-green-50/30 dark:from-green-950/20 dark:via-green-950/10'
              : 'from-amber-50/70 via-amber-50/30 dark:from-amber-950/20 dark:via-amber-950/10'
          } to-background p-4 md:p-6 transition-all hover:shadow-lg hover:scale-[1.02] hover:border-primary cursor-pointer w-full text-left`}
          aria-label={`Lihat butiran penyerahan. ${stats.todaySubmissions} daripada ${stats.totalClasses} kelas diserahkan hari ini`}
        >
          <div
            className={`absolute top-0 right-0 w-20 h-20 ${
              stats.todaySubmissions === stats.totalClasses ? 'bg-green-500/5' : 'bg-amber-500/5'
            } rounded-full -mr-10 -mt-10`}
            aria-hidden="true"
          />
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium text-muted-foreground flex items-center gap-2">
                Diserahkan Hari Ini
              </p>
              <p className="text-2xl md:text-3xl font-bold mt-1">
                {stats.todaySubmissions}/{stats.totalClasses}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                <span>Lihat butiran</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </p>
            </div>
            <div
              className={`h-10 w-10 md:h-12 md:w-12 rounded-lg ${
                stats.todaySubmissions === stats.totalClasses
                  ? 'bg-green-500/10'
                  : 'bg-amber-500/10'
              } flex items-center justify-center group-hover:scale-110 transition-transform`}
              aria-hidden="true"
            >
              <TrendingUp
                className={`h-5 w-5 md:h-6 md:w-6 ${
                  stats.todaySubmissions === stats.totalClasses
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              />
            </div>
          </div>
        </button>

        <div
          className={`group relative overflow-hidden rounded-xl border bg-linear-to-br ${
            stats.averageAttendance >= 90
              ? 'from-green-50 via-green-50/50 dark:from-green-950/20 dark:via-green-950/10'
              : stats.averageAttendance >= 75
                ? 'from-amber-50 via-amber-50/50 dark:from-amber-950/20 dark:via-amber-950/10'
                : 'from-red-50 via-red-50/50 dark:from-red-950/20 dark:via-red-950/10'
          } to-background p-4 md:p-6 transition-all hover:shadow-lg hover:scale-[1.02]`}
        >
          <div
            className={`absolute top-0 right-0 w-20 h-20 ${
              stats.averageAttendance >= 90
                ? 'bg-green-500/10'
                : stats.averageAttendance >= 75
                  ? 'bg-amber-500/10'
                  : 'bg-red-500/10'
            } rounded-full -mr-10 -mt-10`}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Kadar Purata</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{stats.averageAttendance}%</p>
            </div>
            <div
              className={`h-10 w-10 md:h-12 md:w-12 rounded-lg ${
                stats.averageAttendance >= 90
                  ? 'bg-green-500/10'
                  : stats.averageAttendance >= 75
                    ? 'bg-amber-500/10'
                    : 'bg-red-500/10'
              } flex items-center justify-center`}
            >
              <UserCheck
                className={`h-5 w-5 md:h-6 md:w-6 ${
                  stats.averageAttendance >= 90
                    ? 'text-green-600 dark:text-green-400'
                    : stats.averageAttendance >= 75
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submission Tracker - What admins want to see */}
      {stats.todaySubmissions < stats.totalClasses && alerts && alerts.length > 0 && (
        <AlertCard alerts={alerts} />
      )}

      {/* Enhanced Attendance Breakdown with Lighter Gradients */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="relative overflow-hidden rounded-xl border bg-linear-to-br from-green-900 via-green-800 to-white dark:from-green-950/20 dark:via-green-950/10 dark:to-background p-4 md:p-6 transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full -mr-8 -mt-8" />
          <div className="relative text-center">
            <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2 md:mb-3">
              <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.presentToday}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">Hadir</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50/80 via-amber-50/50 to-white dark:from-amber-950/20 dark:via-amber-950/10 dark:to-background p-4 md:p-6 transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-8 -mt-8" />
          <div className="relative text-center">
            <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2 md:mb-3">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats.lateToday}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">Lewat</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-50/80 via-red-50/50 to-white dark:from-red-950/20 dark:via-red-950/10 dark:to-background p-4 md:p-6 transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full -mr-8 -mt-8" />
          <div className="relative text-center">
            <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2 md:mb-3">
              <UserX className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
              {stats.absentToday}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">Tidak Hadir</div>
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart
          data={chartData}
          type="area"
          title="Trend Kehadiran"
          description={dateRangeDescription}
        />

        {/* Recent Submissions - Most Important for Admins */}
        <RecentActivity activities={recentActivity} maxItems={5} />
      </div>

      {/* Submission Details Dialog */}
      <SubmissionDetailsDialog
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
        classes={classes}
        todaySubmissions={todaySubmissions}
        teachers={teachers}
      />
    </div>
  );
}
