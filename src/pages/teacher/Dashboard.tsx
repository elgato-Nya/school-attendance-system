import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingState } from '@/components/attendance/LoadingState';
import { ClassDetailDialog } from '@/components/teacher/ClassDetailDialog';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { useTeacherDashboardData } from '@/hooks/useTeacherDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { getAllTeachers } from '@/services/user/user.service';
import { ROLES } from '@/constants/user';
import type { User } from '@/types';
import {
  ClipboardCheck,
  Users,
  School,
  RefreshCcw,
  Calendar,
  ArrowRight,
  Eye,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  Search,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Teacher selection for admins
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [teacherSearchOpen, setTeacherSearchOpen] = useState(false);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');

  // Default: last 7 days
  const defaultDateRange = useMemo(() => {
    const today = new Date();
    return { from: today, to: today };
  }, []);

  const [dateFilter, setDateFilter] = useState(defaultDateRange);

  // Load teachers if user is admin
  useEffect(() => {
    if (user?.role === ROLES.ADMIN) {
      loadTeachers();
    }
  }, [user?.role]);

  const loadTeachers = async () => {
    setTeachersLoading(true);
    try {
      const teachersData = await getAllTeachers();
      // Need to count only active classes for each teacher
      const { getAllClasses } = await import('@/services/class/class.service');
      const allActiveClasses = await getAllClasses(); // This already filters active only

      // Add active class count to each teacher
      const teachersWithActiveCount = teachersData.map((teacher) => {
        const activeClassCount = allActiveClasses.filter((cls) =>
          teacher.assignedClasses?.includes(cls.id!)
        ).length;
        return {
          ...teacher,
          activeClassCount,
        };
      });

      setTeachers(teachersWithActiveCount);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setTeachersLoading(false);
    }
  };

  const { stats, classSummaries, loading, refetch, selectedTeacher } = useTeacherDashboardData(
    dateFilter,
    user?.role === ROLES.ADMIN ? selectedTeacherId || undefined : undefined
  );

  // Filter teachers based on search query
  const filteredTeachers = useMemo(() => {
    if (!teacherSearchQuery) return teachers;
    const query = teacherSearchQuery.toLowerCase();
    return teachers.filter((teacher) => teacher.name.toLowerCase().includes(query));
  }, [teachers, teacherSearchQuery]);

  // Get selected teacher name for display
  const selectedTeacherName = useMemo(() => {
    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    return teacher?.name || '';
  }, [teachers, selectedTeacherId]);

  // Get dynamic date range description
  const dateRangeDescription = useMemo(() => {
    if (!dateFilter) return 'Tempoh dipilih';

    const { from, to } = dateFilter;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(0, 0, 0, 0);

    // Check if it's today only
    if (fromDate.getTime() === today.getTime() && toDate.getTime() === today.getTime()) {
      return 'Hari Ini';
    }

    // Check if it's a 7-day range ending today
    const daysDiff = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 6 && toDate.getTime() === today.getTime()) {
      return '7 Hari Lepas';
    }

    // Check if same day
    if (fromDate.getTime() === toDate.getTime()) {
      return fromDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    // Different dates - show range
    const fromStr = fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const toStr = toDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${fromStr} - ${toStr}`;
  }, [dateFilter]);

  const handleDateChange = (range: { from: Date; to: Date }) => {
    setDateFilter(range);
  };

  const handleDateReset = () => {
    setDateFilter(defaultDateRange);
  };

  // Get first assigned class for mark attendance navigation
  const firstClassId = user?.assignedClasses?.[0];

  const handleViewClassDetails = (classId: string, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <div
        className="p-6"
        role="status"
        aria-live="polite"
        aria-label="Memuatkan data papan pemuka"
      >
        <LoadingState message="Memuatkan papan pemuka anda..." />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 space-y-4 md:space-y-6">
      {/* Enhanced Header with Gradient */}
      <div className="flex flex-col gap-4 md:gap-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Papan Pemuka Guru
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedTeacher && user?.role === ROLES.ADMIN ? (
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-3 w-3" />
                  Melihat: <span className="font-semibold">{selectedTeacher.name}</span>
                </span>
              ) : stats.todaySubmissions === stats.totalAssignedClasses ? (
                <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Semua kehadiran diserahkan hari ini
                </span>
              ) : (
                <span>
                  <span className="font-semibold">
                    {stats.todaySubmissions}/{stats.totalAssignedClasses}
                  </span>{' '}
                  kelas diserahkan hari ini
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {stats.todaySubmissions < stats.totalAssignedClasses && (
              <Button asChild size="default" className="flex-1 md:flex-none">
                <Link
                  to={
                    firstClassId ? `/teacher/mark-attendance/${firstClassId}` : '/teacher/classes'
                  }
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Tandakan Kehadiran
                </Link>
              </Button>
            )}
            <Button
              onClick={refetch}
              variant="outline"
              size="default"
              disabled={loading}
              aria-label="Muat semula"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Teacher Selection for Admins */}
        {user?.role === ROLES.ADMIN && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label htmlFor="teacher-select" className="text-sm font-medium">
                  Cari Guru untuk Lihat Papan Pemuka
                </Label>
                <Popover open={teacherSearchOpen} onOpenChange={setTeacherSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="teacher-select"
                      variant="outline"
                      role="combobox"
                      aria-expanded={teacherSearchOpen}
                      className="w-full justify-between"
                      disabled={teachersLoading}
                    >
                      {teachersLoading ? (
                        'Memuatkan guru...'
                      ) : selectedTeacherId ? (
                        <span className="flex items-center gap-2">
                          {selectedTeacherName}
                          <span className="text-xs text-muted-foreground">
                            (
                            {(teachers.find((t) => t.id === selectedTeacherId) as any)
                              ?.activeClassCount || 0}{' '}
                            kelas)
                          </span>
                        </span>
                      ) : (
                        'Cari dan pilih guru...'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <div className="p-2 border-b">
                      <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari guru..."
                          value={teacherSearchQuery}
                          onChange={(e) => setTeacherSearchQuery(e.target.value)}
                          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {filteredTeachers.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          {teacherSearchQuery ? 'Tiada guru dijumpai' : 'Tiada guru tersedia'}
                        </div>
                      ) : (
                        <div className="p-1">
                          {filteredTeachers.map((teacher) => (
                            <button
                              key={teacher.id}
                              onClick={() => {
                                setSelectedTeacherId(teacher.id!);
                                setTeacherSearchOpen(false);
                                setTeacherSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between p-2 hover:bg-accent rounded-sm text-left"
                            >
                              <div className="flex items-center gap-2">
                                {selectedTeacherId === teacher.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                                <span className={selectedTeacherId !== teacher.id ? 'ml-6' : ''}>
                                  {teacher.name}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ({(teacher as any).activeClassCount || 0} kelas)
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {!selectedTeacherId && (
                  <p className="text-xs text-muted-foreground">
                    Cari dan pilih guru untuk melihat data papan pemuka dan kelas mereka
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center">
          <DateFilter value={dateFilter} onChange={handleDateChange} onReset={handleDateReset} />
        </div>
      </div>

      {/* Desktop: 2-column layout, Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column: Stats + Classes (takes 2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Enhanced Summary with Gradients */}
          <Card className="overflow-hidden border-none shadow-sm gap-2">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2 px-3 py-2 rounded-lg bg-linear-to-r from-primary/5 via-primary/3 to-background w-fit">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                Ringkasan Kehadiran ({dateRangeDescription})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 rounded-xl border bg-green-50/50 dark:bg-green-950/20 transition-all hover:bg-green-50 dark:hover:bg-green-950/30 hover:shadow-md">
                  <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                    <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.presentToday}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
                    Hadir
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:shadow-md">
                  <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 md:h-6 md:w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.lateToday}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
                    Lewat
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 rounded-xl border bg-red-50/50 dark:bg-red-950/20 transition-all hover:bg-red-50 dark:hover:bg-red-950/30 hover:shadow-md">
                  <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                    <UserX className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                    {stats.absentToday}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
                    Tidak Hadir
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced My Classes */}
          <Card className="overflow-hidden border-none shadow-sm gap-2">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2 px-3 py-2 rounded-lg bg-linear-to-r from-primary/5 via-primary/3 to-background w-fit">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <School className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                {selectedTeacher && user?.role === ROLES.ADMIN
                  ? `Kelas ${selectedTeacher.name}`
                  : 'Kelas Saya'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {classSummaries.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <School className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Tiada kelas ditugaskan lagi</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hubungi pentadbir untuk menugaskan kelas
                  </p>
                </div>
              ) : (
                classSummaries.map((summary) => (
                  <div
                    key={summary.classId}
                    className="group relative overflow-hidden flex items-center justify-between p-3 md:p-4 rounded-xl border bg-linear-to-r from-card via-card to-card/50 hover:shadow-md transition-all hover:scale-[1.01]"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base truncate flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary/60" />
                        {summary.className}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {summary.studentCount} murid
                        </p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Purata tempoh:{' '}
                          <span className="font-semibold">{summary.weeklyRate}%</span>
                        </p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleViewClassDetails(summary.classId, summary.className)}
                        className="shrink-0 h-8 w-8 p-0"
                        title="Lihat butiran"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="shrink-0 h-8 w-8 p-0"
                        title="Tandakan kehadiran"
                      >
                        <Link to={`/teacher/mark-attendance/${summary.classId}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Weekly Overview + Quick Actions (1 col on desktop) */}
        <div className="space-y-4 md:space-y-6">
          {/* Enhanced Period Overview */}
          <Card className="overflow-hidden border-none shadow-sm gap-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  Tinjauan Tempoh
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 w-8 p-0"
                  title="Lihat sejarah"
                >
                  <Link to="/teacher/history">
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary/5 via-primary/3 to-background p-4 border">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Purata Kehadiran
                    </span>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {stats.averageAttendance}%
                      </div>
                    </div>
                  </div>
                  <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-linear-to-r from-primary via-primary/90 to-primary/80 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${stats.averageAttendance}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {dateRangeDescription}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Jumlah Murid</span>
                  </div>
                  <span className="text-lg font-bold">{stats.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <School className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Kelas Saya</span>
                  </div>
                  <span className="text-lg font-bold">{stats.totalAssignedClasses}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="overflow-hidden border-none shadow-sm gap-2">
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2 px-3 py-2 rounded-lg bg-linear-to-r from-primary/5 via-primary/3 to-background w-fit">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Tindakan Pantas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <Button
                asChild
                variant="outline"
                className="group w-full justify-start hover:bg-blue-500/5 hover:border-blue-500/20 transition-all"
              >
                <Link to="/teacher/students">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="flex-1 text-left font-medium">Lihat Semua Murid</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="group w-full justify-start hover:bg-purple-500/5 hover:border-purple-500/20 transition-all"
              >
                <Link to="/teacher/history">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="flex-1 text-left font-medium">Sejarah Kehadiran</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="group w-full justify-start hover:bg-green-500/5 hover:border-green-500/20 transition-all"
              >
                <Link
                  to={user?.role === ROLES.ADMIN ? '/admin/students' : '/teacher/manage-students'}
                >
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="flex-1 text-left font-medium">Urus Murid</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Class Detail Dialog */}
      <ClassDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        classId={selectedClassId}
        className={selectedClassName}
      />
    </div>
  );
}
