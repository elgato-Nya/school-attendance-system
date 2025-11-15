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
import type { Student, Class, Attendance } from '@/types';
import { subDays } from 'date-fns';

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
  }, [searchQuery, selectedClass, selectedGrade, sortBy]);

  const loadData = async () => {
    // Check if user has assigned classes (teachers) or is admin
    if (user?.role === 'teacher' && !user?.assignedClasses?.length) {
      setDataLoading(false);
      toast.info('No classes assigned to you yet.');
      return;
    }

    setDataLoading(true);
    try {
      let classIds: string[] = [];

      // For teachers, use assigned classes; for admins, get all classes
      if (user?.role === 'teacher' && user.assignedClasses) {
        classIds = user.assignedClasses;
        console.log('Teacher assigned classes:', classIds);
      } else if (user?.role === 'admin') {
        // Load all classes for admin
        const classesRef = collection(db, 'classes');
        const allClassesSnapshot = await getDocs(classesRef);
        classIds = allClassesSnapshot.docs.map((doc) => doc.id);
        console.log('Admin - all classes:', classIds);
      }

      if (classIds.length === 0) {
        setDataLoading(false);
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
      console.log('Loaded classes:', classesData.length);

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
      console.log('Extracted students from classes:', studentsData.length);
      console.log('Sample student:', studentsData[0]);

      // Load attendance records (last 30 days) for all classes
      const thirtyDaysAgo = subDays(new Date(), 30);
      const attendanceRef = collection(db, 'attendance');
      const attendanceQuery = query(
        attendanceRef,
        where('classId', 'in', classIds),
        where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
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
        const totalDays = attendanceRecords.filter(
          (record) => record.classId === student.classId
        ).length;

        let presentDays = 0;
        let lateDays = 0;

        attendanceRecords.forEach((record) => {
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
      toast.error('Failed to load students');
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
      return { variant: 'default' as const, label: 'Excellent', color: 'text-green-600' };
    }
    if (rate >= 75) {
      return { variant: 'secondary' as const, label: 'Good', color: 'text-yellow-600' };
    }
    return { variant: 'destructive' as const, label: 'At Risk', color: 'text-red-600' };
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
    toast.success('Data refreshed');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Student List</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View student attendance statistics for the last 30 days
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
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="student-search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="student-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or IC..."
                  className="pl-9"
                  aria-label="Search students by name or IC number"
                />
              </div>
            </div>

            {/* Grade Filter */}
            <div className="space-y-2">
              <Label htmlFor="grade-filter">Filter by Grade</Label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Select
                  value={selectedGrade}
                  onValueChange={(value) => {
                    setSelectedGrade(value);
                    if (value !== 'all') setSelectedClass('all'); // Reset class filter
                  }}
                >
                  <SelectTrigger
                    id="grade-filter"
                    className="pl-9"
                    aria-label="Filter students by grade"
                  >
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {uniqueGrades.map((grade) => (
                      <SelectItem key={grade} value={String(grade)}>
                        Grade {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <Label htmlFor="class-filter">Filter by Class</Label>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  if (value !== 'all') setSelectedGrade('all'); // Reset grade filter
                }}
                disabled={selectedGrade !== 'all'}
              >
                <SelectTrigger id="class-filter" aria-label="Filter students by class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      Grade {cls.grade} - {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGrade !== 'all' && (
                <p className="text-xs text-muted-foreground">
                  Disabled while grade filter is active
                </p>
              )}
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger id="sort-by" aria-label="Sort students">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="attendance">Attendance Rate (High to Low)</SelectItem>
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
            <p className="mt-4 text-muted-foreground">Loading students...</p>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || selectedClass !== 'all' || selectedGrade !== 'all'
                ? 'No students found matching your filters.'
                : 'No students found.'}
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
                  <TableHead>IC Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Days Tracked</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Late</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead className="text-right">Attendance Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => {
                  const classInfo = classes.find((c) => c.id === student.classId);
                  const badge = getAttendanceBadge(student.attendanceRate);
                  return (
                    <TableRow
                      key={student.id}
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
              return (
                <Card
                  key={student.id}
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
                        <div className="text-xs text-muted-foreground">Present</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">{student.lateDays}</div>
                        <div className="text-xs text-muted-foreground">Late</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">{student.absentDays}</div>
                        <div className="text-xs text-muted-foreground">Absent</div>
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
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{summaryStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summaryStats.excellent}</div>
                <div className="text-sm text-muted-foreground">Excellent (≥90%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summaryStats.good}</div>
                <div className="text-sm text-muted-foreground">Good (75-89%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summaryStats.atRisk}</div>
                <div className="text-sm text-muted-foreground">At Risk (&lt;75%)</div>
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
              Detailed attendance information for the last 30 days
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IC Number:</span>
                  <span className="font-medium">{selectedStudent.icNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Class:</span>
                  <span className="font-medium">
                    {classes.find((c) => c.id === selectedStudent.classId)
                      ? `Grade ${classes.find((c) => c.id === selectedStudent.classId)!.grade} - ${
                          classes.find((c) => c.id === selectedStudent.classId)!.name
                        }`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Guardian:</span>
                  <span className="font-medium">{selectedStudent.guardianName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium">{selectedStudent.guardianContact}</span>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Attendance Summary
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {selectedStudent.presentDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {selectedStudent.lateDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Late</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {selectedStudent.absentDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Absent</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-lg font-bold">{selectedStudent.totalDays}</div>
                      <div className="text-xs text-muted-foreground">Total Days</div>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Rate</span>
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
