// src/pages/teacher/AttendanceHistory.tsx
// Refactored with component extraction and mobile support

import { useState, useEffect, useMemo } from 'react';
import { getAllClasses } from '@/services/class/class.service';
import { getAttendanceHistory } from '@/services/attendance.service';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import { Button } from '@/components/ui/button';
import { AttendanceStatCard } from '@/components/attendance/AttendanceStatCard';
import { EmptyState } from '@/components/attendance/EmptyState';
import { LoadingState } from '@/components/attendance/LoadingState';
import { exportAttendanceToCSV } from '@/utils/exportCSV';
import { getLatestVersions } from '@/utils/attendance/filters';
import { AttendanceDetailDialog } from '@/components/attendance/AttendanceDetailDialog';
import { AttendanceHistoryFilters } from '@/components/attendance/AttendanceHistoryFilters';
import { AttendanceHistoryTable } from '@/components/attendance/AttendanceHistoryTable';
import { AttendanceRecordMobileCard } from '@/components/attendance/AttendanceRecordMobileCard';
import { Pagination } from '@/components/ui/pagination';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Class, Attendance } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Download, Calendar, Filter, TrendingUp, FileText } from 'lucide-react';

type ViewMode = 'all' | 'range' | 'single';
type SortField = 'date' | 'class' | 'rate' | 'status';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// Helper function to parse date string without timezone issues
// Converts 'YYYY-MM-DD' to local Date object at midnight local time
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function AttendanceHistory() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // View mode state - always defaults to 'all' on mount (not persisted)
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined);

  // Handle view mode change with default dates
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);

    if (mode === 'single') {
      // Default to today's date
      setSingleDate(new Date());
    } else if (mode === 'range') {
      // Default to last week to today
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      setStartDate(lastWeek);
      setEndDate(today);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Detail dialog state
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  // Load records when classes are loaded or filters change
  useEffect(() => {
    if (classes.length > 0) {
      loadRecords();
    }
  }, [classes.length, selectedClass, selectedGrade, viewMode, startDate, endDate, singleDate]);

  const loadClasses = async () => {
    try {
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    }
  };

  const loadRecords = async () => {
    // Determine date range based on view mode
    let queryStartDate: string;
    let queryEndDate: string;

    if (viewMode === 'single' && singleDate) {
      // Use local date formatting to avoid timezone shifts when converting to YYYY-MM-DD
      queryStartDate = format(singleDate, 'yyyy-MM-dd');
      queryEndDate = format(singleDate, 'yyyy-MM-dd');
    } else if (viewMode === 'range' && startDate && endDate) {
      queryStartDate = format(startDate, 'yyyy-MM-dd');
      queryEndDate = format(endDate, 'yyyy-MM-dd');
    } else {
      // For 'all' mode, get last 365 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 365);
      queryStartDate = format(start, 'yyyy-MM-dd');
      queryEndDate = format(end, 'yyyy-MM-dd');
    }

    setLoading(true);
    try {
      let allRecords: Attendance[] = [];

      if (selectedClass === 'all') {
        // PERFORMANCE: Load ALL classes at once with a single query
        const classesToLoad =
          selectedGrade === 'all'
            ? classes
            : classes.filter((c) => c.grade.toString() === selectedGrade);

        const classIds = classesToLoad.map((c) => c.id);

        // Single query for all classes using 'in' operator (max 10 at a time due to Firestore limit)
        if (classIds.length > 0) {
          const batchSize = 10;
          const batches = [];

          for (let i = 0; i < classIds.length; i += batchSize) {
            const batchIds = classIds.slice(i, i + batchSize);
            batches.push(
              getDocs(
                query(
                  collection(db, 'attendance'),
                  where('classId', 'in', batchIds),
                  where('date', '>=', queryStartDate),
                  where('date', '<=', queryEndDate),
                  orderBy('date', 'desc')
                )
              )
            );
          }

          const results = await Promise.all(batches);
          results.forEach((snapshot) => {
            snapshot.forEach((doc) => {
              const data = doc.data();
              allRecords.push({
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
          });
        }
      } else {
        // Load single class
        allRecords = await getAttendanceHistory(selectedClass, queryStartDate, queryEndDate);
      }

      setRecords(allRecords);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error loading attendance history:', error);
      toast.error('Failed to load attendance history');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const latestRecords = useMemo(() => getLatestVersions(records), [records]);

  // Filter and sort records
  const filteredAndSortedRecords = useMemo(() => {
    // Use deduplicated latestRecords as the canonical source (latest submission per class+date).
    // User preference: always calculate using latest data only.
    const source = latestRecords;

    let filtered = source.filter(
      (record) =>
        record.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.date.includes(searchQuery) ||
        record.submittedByName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort records
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = parseDateString(a.date).getTime() - parseDateString(b.date).getTime();
          break;
        case 'class':
          comparison = a.className.localeCompare(b.className);
          break;
        case 'rate':
          comparison = a.summary.rate - b.summary.rate;
          break;
        case 'status':
          const aStatus = a.editHistory.length > 0 ? 1 : 0;
          const bStatus = b.editHistory.length > 0 ? 1 : 0;
          comparison = aStatus - bStatus;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [records, latestRecords, searchQuery, sortField, sortOrder]);

  // Paginate records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedRecords, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredAndSortedRecords.length);

  const calculateAverageRate = (): number => {
    // Calculate weighted overall attendance rate to match Reports page:
    // (total present across classes) / (total students across classes) * 100
    if (filteredAndSortedRecords.length === 0) return 0;

    const totalPresent = filteredAndSortedRecords.reduce(
      (acc, record) => acc + (record.summary.present || 0),
      0
    );
    const totalStudents = filteredAndSortedRecords.reduce(
      (acc, record) => acc + (record.summary.total || 0),
      0
    );

    if (totalStudents === 0) return 0;

    // Round to 2 decimal places
    return Math.round((totalPresent / totalStudents) * 10000) / 100;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (record: Attendance) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const handleExport = () => {
    const dateRangeText =
      viewMode === 'single' && singleDate
        ? format(singleDate, 'yyyy-MM-dd')
        : viewMode === 'range' && startDate && endDate
          ? `${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`
          : 'AllTime';

    if (selectedClass === 'all') {
      const fileName =
        selectedGrade === 'all'
          ? `All_Classes_Attendance_${dateRangeText}.csv`
          : `Grade_${selectedGrade}_Attendance_${dateRangeText}.csv`;

      exportAllClassesCSV(filteredAndSortedRecords, fileName);
    } else {
      const selectedClassData = classes.find((c) => c.id === selectedClass);
      if (!selectedClassData) {
        toast.error('Please select a class first');
        return;
      }
      const exportStart =
        viewMode === 'single' && singleDate
          ? format(singleDate, 'yyyy-MM-dd')
          : viewMode === 'range' && startDate
            ? format(startDate, 'yyyy-MM-dd')
            : 'AllTime';
      const exportEnd =
        viewMode === 'single' && singleDate
          ? format(singleDate, 'yyyy-MM-dd')
          : viewMode === 'range' && endDate
            ? format(endDate, 'yyyy-MM-dd')
            : 'AllTime';
      exportAttendanceToCSV(filteredAndSortedRecords, selectedClassData, exportStart, exportEnd);
    }
  };

  const exportAllClassesCSV = (records: Attendance[], fileName: string) => {
    if (records.length === 0) {
      toast.error('No records to export');
      return;
    }

    const headers = [
      'Date',
      'Class',
      'Grade',
      'Total',
      'Present',
      'Late',
      'Absent',
      'Excused',
      'Rate (%)',
      'Submitted By',
    ];
    const rows = records.map((r) => [
      r.date,
      r.className,
      classes.find((c) => c.id === r.classId)?.grade || 'N/A',
      r.summary.total,
      r.summary.present,
      r.summary.late,
      r.summary.absent,
      r.summary.excused,
      r.summary.rate.toFixed(2),
      r.submittedByName,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    toast.success('CSV exported successfully!');
  };

  const getAverageRateVariant = (rate: number): 'default' | 'success' | 'warning' | 'danger' => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'danger';
  };

  const getDateRangeDisplay = () => {
    if (viewMode === 'single' && singleDate) {
      return singleDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } else if (viewMode === 'range' && startDate && endDate) {
      return `${startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${endDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`;
    }
    return 'All Time';
  };

  const getDaysTracked = () => {
    if (viewMode === 'single') return '1 day';
    if (viewMode === 'range' && startDate && endDate) {
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `${days} days tracked`;
    }
    return `${filteredAndSortedRecords.length} records`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Attendance History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and export historical attendance records
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={filteredAndSortedRecords.length === 0}
          aria-label="Export attendance history to CSV"
        >
          <Download className="w-4 h-4 mr-2" aria-hidden="true" />
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <AttendanceHistoryFilters
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        classes={classes}
        viewMode={viewMode}
        setViewMode={handleViewModeChange}
        singleDate={singleDate}
        setSingleDate={setSingleDate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Summary Cards */}
      {filteredAndSortedRecords.length > 0 && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Summary statistics">
          <AttendanceStatCard
            title="Total Records"
            value={filteredAndSortedRecords.length}
            icon={FileText}
          />
          <AttendanceStatCard
            title="Average Attendance"
            value={`${calculateAverageRate()}%`}
            variant={getAverageRateVariant(calculateAverageRate())}
            icon={TrendingUp}
          />
          <AttendanceStatCard
            title="Date Range"
            value={getDateRangeDisplay()}
            icon={Calendar}
            description={getDaysTracked()}
          />
          <AttendanceStatCard
            title={selectedClass === 'all' ? 'Classes' : 'Selected Class'}
            value={
              selectedClass === 'all'
                ? `${selectedGrade === 'all' ? 'Grades' : `Grade ${selectedGrade}`}`
                : classes.find((c) => c.id === selectedClass)?.name || 'N/A'
            }
            icon={Filter}
            description={
              selectedClass === 'all'
                ? `${
                    Array.from(new Set(filteredAndSortedRecords.map((r) => r.classId))).length
                  } classes`
                : `Grade ${classes.find((c) => c.id === selectedClass)?.grade}`
            }
          />
        </section>
      )}

      {/* Records Table or Empty States */}
      <section aria-label="Attendance records">
        {loading ? (
          <LoadingState message="Loading attendance history..." />
        ) : filteredAndSortedRecords.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Records Found"
            description="No attendance records found for the selected filters"
          />
        ) : (
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page">Show</Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger id="items-per-page" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>
            </div>

            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block">
              <AttendanceHistoryTable
                records={paginatedRecords}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                onRowClick={handleRowClick}
              />
            </div>

            {/* Mobile Card View (hidden on desktop) */}
            <div className="md:hidden px-4  space-y-3">
              {paginatedRecords.map((record) => (
                <AttendanceRecordMobileCard
                  key={record.id}
                  record={record}
                  onClick={handleRowClick}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalRecords={filteredAndSortedRecords.length}
            />
          </Card>
        )}
      </section>

      {/* Detail Dialog */}
      <AttendanceDetailDialog
        attendance={selectedRecord}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
