import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { toast } from 'sonner';
import {
  Search,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { DateFilter } from '@/components/dashboard/DateFilter';
import type { Student, Class, Attendance } from '@/types';
import { format } from 'date-fns';

interface StudentWithStats extends Student {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}

const ITEMS_PER_PAGE = 20;

export default function StudentList() {
  const { user, loading: authLoading } = useAuth();
  const [allStudents, setAllStudents] = useState<StudentWithStats[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'attendance'>('name');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Date filter state using DateFilter component - Default to All Time
  const defaultDateRange = useMemo(() => {
    const today = new Date();
    const threeYearsAgo = new Date(today);
    threeYearsAgo.setFullYear(today.getFullYear() - 3);
    return { from: threeYearsAgo, to: today };
  }, []);

  const [dateFilter, setDateFilter] = useState(defaultDateRange);

  const handleDateChange = (range: { from: Date; to: Date }) => {
    setDateFilter(range);
  };

  const handleDateReset = () => {
    setDateFilter(defaultDateRange);
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (user) {
      loadData();
    } else {
      // User is loaded but null, stop loading
      setDataLoading(false);
    }
  }, [user, authLoading]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass, selectedGrade, sortBy, dateFilter]);

  // Reload data when date filters change
  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [dateFilter]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      // Load ALL classes (not restricted by teacher assignment)
      const classesRef = collection(db, 'classes');
      const classesSnapshot = await getDocs(classesRef);
      const classesData = classesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Class
      );
      setClasses(classesData);

      if (classesData.length === 0) {
        setDataLoading(false);
        toast.info('Tiada kelas tersedia.');
        return;
      }

      // Extract ALL students from ALL classes
      const studentsData: Student[] = [];
      classesData.forEach((classDoc) => {
        if (classDoc.students && Array.isArray(classDoc.students)) {
          const classStudents = classDoc.students.map((student) => ({
            ...student,
            classId: student.classId || classDoc.id,
          }));
          studentsData.push(...classStudents);
        }
      });

      // Use date filter range
      const dateRangeStart = format(dateFilter.from, 'yyyy-MM-dd');
      const dateRangeEnd = format(dateFilter.to, 'yyyy-MM-dd');

      // Load attendance records based on date filter
      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('date', '>=', dateRangeStart),
        where('date', '<=', dateRangeEnd)
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
      const studentsWithStats = studentsData.map((student) => {
        // Count total days for this student's class
        const totalDays = attendanceRecords.filter(
          (record) => record.classId === student.classId
        ).length;

        let presentDays = 0;
        let lateDays = 0;

        // Count attendance for this student
        attendanceRecords.forEach((record) => {
          if (record.classId !== student.classId) return;

          const studentRecord = record.records.find((r) => r.icNumber === student.icNumber);
          if (studentRecord) {
            if (studentRecord.status === 'present') presentDays++;
            if (studentRecord.status === 'late') {
              presentDays++;
              lateDays++;
            }
          }
        });

        const absentDays = totalDays - presentDays;
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        return {
          ...student,
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendanceRate,
        };
      });

      setAllStudents(studentsWithStats);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Gagal memuatkan senarai murid');
    } finally {
      setDataLoading(false);
    }
  };

  // Filtered and sorted students with memoization
  const filteredStudents = useMemo(() => {
    let result = [...allStudents];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.icNumber.toLowerCase().includes(query)
      );
    }

    // Apply grade filter (takes priority over class filter)
    if (selectedGrade !== 'all') {
      result = result.filter((student) => {
        const studentClass = classes.find((c) => c.id === student.classId);
        return studentClass && String(studentClass.grade) === selectedGrade;
      });
    } else if (selectedClass !== 'all') {
      // Apply class filter only if grade filter is not active
      result = result.filter((student) => student.classId === selectedClass);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.attendanceRate - a.attendanceRate;
    });

    return result;
  }, [allStudents, searchQuery, selectedClass, selectedGrade, sortBy, classes]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get unique grades
  const uniqueGrades = useMemo(() => {
    return Array.from(new Set(classes.map((c) => c.grade))).sort((a, b) => a - b);
  }, [classes]);

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 90) {
      return { variant: 'default' as const, label: 'Cemerlang', color: 'text-green-600' };
    }
    if (rate >= 75) {
      return { variant: 'secondary' as const, label: 'Baik', color: 'text-yellow-600' };
    }
    return { variant: 'destructive' as const, label: 'Berisiko', color: 'text-red-600' };
  };

  const summaryStats = useMemo(
    () => ({
      total: filteredStudents.length,
      excellent: filteredStudents.filter((s) => s.attendanceRate >= 90).length,
      good: filteredStudents.filter((s) => s.attendanceRate >= 75 && s.attendanceRate < 90).length,
      atRisk: filteredStudents.filter((s) => s.attendanceRate < 75).length,
    }),
    [filteredStudents]
  );

  const handleRefresh = () => {
    loadData();
    toast.success('Data dikemaskini');
  };

  const getDateRangeText = () => {
    const isSameDay = format(dateFilter.from, 'yyyy-MM-dd') === format(dateFilter.to, 'yyyy-MM-dd');

    if (isSameDay) {
      return format(dateFilter.from, 'MMMM dd, yyyy');
    }

    return `${format(dateFilter.from, 'MMM dd, yyyy')} - ${format(dateFilter.to, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Senarai Murid</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lihat statistik kehadiran murid untuk {getDateRangeText()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={dataLoading}
          className="gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
          Muat Semula
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Penapis</CardTitle>
          <CardDescription>Cari dan tapis murid</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Date Filter and Search */}
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1 space-y-2 ">
              <Label>Julat Tarikh</Label>
              <DateFilter
                value={dateFilter}
                onChange={handleDateChange}
                onReset={handleDateReset}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="student-search">Cari Murid</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="student-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari mengikut nama atau IC..."
                  className="pl-9"
                  aria-label="Cari murid mengikut nama atau nombor IC"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Other Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grade Filter */}
            <div className="space-y-2">
              <Label htmlFor="grade-filter">Tapis mengikut Tingkatan</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Select
                  value={selectedGrade}
                  onValueChange={(value) => {
                    setSelectedGrade(value);
                    // If a specific grade is selected and current class doesn't match, reset class filter
                    if (value !== 'all') {
                      const selectedClassData = classes.find((c) => c.id === selectedClass);
                      if (selectedClassData && String(selectedClassData.grade) !== value) {
                        setSelectedClass('all');
                      }
                    }
                  }}
                >
                  <SelectTrigger
                    id="grade-filter"
                    className="pl-9"
                    aria-label="Tapis murid mengikut tingkatan"
                  >
                    <SelectValue placeholder="Pilih tingkatan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tingkatan</SelectItem>
                    {uniqueGrades.map((grade) => (
                      <SelectItem key={grade} value={String(grade)}>
                        Tingkatan {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <Label htmlFor="class-filter">Tapis mengikut Kelas</Label>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  // If a specific class is selected, update grade filter to match
                  if (value !== 'all') {
                    const selectedClassData = classes.find((c) => c.id === value);
                    if (selectedClassData) {
                      setSelectedGrade(String(selectedClassData.grade));
                    }
                  }
                }}
              >
                <SelectTrigger id="class-filter" aria-label="Tapis murid mengikut kelas">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {/* Filter classes by selected grade */}
                  {(selectedGrade === 'all'
                    ? classes
                    : classes.filter((c) => String(c.grade) === selectedGrade)
                  ).map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label htmlFor="sort-by">Susun Mengikut</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger id="sort-by" aria-label="Susun murid">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nama (A-Z)</SelectItem>
                  <SelectItem value="attendance">Kadar Kehadiran (Tinggi ke Rendah)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      {dataLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Memuatkan murid...</p>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || selectedClass !== 'all' || selectedGrade !== 'all'
                ? 'Tiada murid dijumpai yang sepadan dengan penapis anda.'
                : 'Tiada murid dijumpai.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombor IC</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-right">Hari Dijejak</TableHead>
                  <TableHead className="text-right">Hadir</TableHead>
                  <TableHead className="text-right">Lewat</TableHead>
                  <TableHead className="text-right">Tidak Hadir</TableHead>
                  <TableHead className="text-right">Kadar Kehadiran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => {
                  const classInfo = classes.find((c) => c.id === student.classId);
                  const badge = getAttendanceBadge(student.attendanceRate);
                  // Use icNumber as key since it's unique, with fallback to id
                  const uniqueKey = student.icNumber || student.id || `student-${Math.random()}`;
                  return (
                    <TableRow
                      key={uniqueKey}
                      className="cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <TableCell className="font-medium">{student.icNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {classInfo ? `Grade ${classInfo.grade} - ${classInfo.name}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {student.totalDays}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 font-medium">{student.presentDays}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-yellow-600 font-medium">{student.lateDays}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-red-600 font-medium">{student.absentDays}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badge.variant}>{student.attendanceRate.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex}
                totalRecords={filteredStudents.length}
              />
            )}
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedStudents.map((student) => {
              const classInfo = classes.find((c) => c.id === student.classId);
              const badge = getAttendanceBadge(student.attendanceRate);
              // Use icNumber as key since it's unique, with fallback to id
              const uniqueKey = student.icNumber || student.id || `student-${Math.random()}`;
              return (
                <Card
                  key={uniqueKey}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedStudent(student)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.icNumber}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {classInfo ? `Grade ${classInfo.grade} - ${classInfo.name}` : 'N/A'}
                        </p>
                      </div>
                      <Badge variant={badge.variant} className="ml-2 shrink-0">
                        {student.attendanceRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {student.presentDays}
                        </div>
                        <div className="text-xs text-muted-foreground">Hadir</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">{student.lateDays}</div>
                        <div className="text-xs text-muted-foreground">Lewat</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">{student.absentDays}</div>
                        <div className="text-xs text-muted-foreground">Tidak Hadir</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <Card>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalRecords={filteredStudents.length}
                  showFirstLast={false}
                />
              </Card>
            )}
          </div>
        </>
      )}

      {/* Summary Stats */}
      {!dataLoading && filteredStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summaryStats.total}</div>
                <div className="text-sm text-muted-foreground">Jumlah Murid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summaryStats.excellent}</div>
                <div className="text-sm text-muted-foreground">Cemerlang (≥90%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summaryStats.good}</div>
                <div className="text-sm text-muted-foreground">Baik (75-89%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summaryStats.atRisk}</div>
                <div className="text-sm text-muted-foreground">Berisiko (&lt;75%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent
          className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg"
          aria-describedby="student-detail-description"
        >
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name}</DialogTitle>
            <DialogDescription id="student-detail-description">
              Maklumat kehadiran terperinci untuk {getDateRangeText()}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nombor IC:</span>
                  <span className="font-medium">{selectedStudent.icNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kelas:</span>
                  <span className="font-medium">
                    {classes.find((c) => c.id === selectedStudent.classId)
                      ? `Tingkatan ${classes.find((c) => c.id === selectedStudent.classId)!.grade} - ${
                          classes.find((c) => c.id === selectedStudent.classId)!.name
                        }`
                      : 'T/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Penjaga:</span>
                  <span className="font-medium">{selectedStudent.guardianName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hubungan:</span>
                  <span className="font-medium">{selectedStudent.guardianContact}</span>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ringkasan Kehadiran
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {selectedStudent.presentDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Hadir</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {selectedStudent.lateDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Lewat</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {selectedStudent.absentDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Tidak Hadir</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-lg font-bold">{selectedStudent.totalDays}</div>
                      <div className="text-xs text-muted-foreground">Jumlah Hari</div>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Kadar Kehadiran</span>
                    <Badge
                      variant={getAttendanceBadge(selectedStudent.attendanceRate).variant}
                      className="text-base"
                    >
                      {selectedStudent.attendanceRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
