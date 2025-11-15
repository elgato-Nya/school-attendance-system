/**
 * DayReportModal Component
 * Displays daily attendance report with filters
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { Class } from '@/types';

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

interface DayReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayReport: DayReport | null;
  classes: Class[];
}

export function DayReportModal({ open, onOpenChange, dayReport, classes }: DayReportModalProps) {
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterRateThreshold, setFilterRateThreshold] = useState<string>('all');

  if (!dayReport) return null;

  // Get available classes based on grade filter
  const getAvailableClasses = () => {
    if (filterGrade === 'all') {
      return classes;
    }
    return classes.filter((cls) => cls.grade.toString() === filterGrade);
  };

  // Handle grade change - reset class filter if selected class is not in the new grade
  const handleGradeChange = (grade: string) => {
    setFilterGrade(grade);
    if (grade !== 'all' && filterClass !== 'all') {
      const selectedClass = classes.find((cls) => cls.id === filterClass);
      if (selectedClass && selectedClass.grade.toString() !== grade) {
        setFilterClass('all');
      }
    }
  };

  // Handle class change - auto-update grade filter to match the class's grade
  const handleClassChange = (classId: string) => {
    setFilterClass(classId);
    if (classId !== 'all') {
      const selectedClass = classes.find((cls) => cls.id === classId);
      if (selectedClass) {
        setFilterGrade(selectedClass.grade.toString());
      }
    }
  };

  const getFilteredReports = () => {
    let filtered = [...dayReport.classReports];

    if (filterGrade !== 'all') {
      filtered = filtered.filter((r) => r.grade === parseInt(filterGrade));
    }

    if (filterClass !== 'all') {
      filtered = filtered.filter((r) => r.classId === filterClass);
    }

    if (filterRateThreshold !== 'all') {
      const threshold = parseInt(filterRateThreshold);
      filtered = filtered.filter((r) => r.rate < threshold);
    }

    return filtered;
  };

  const filteredReports = getFilteredReports();
  const uniqueGrades = Array.from(new Set(classes.map((c) => c.grade))).sort();
  const availableClasses = getAvailableClasses();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-1rem)] max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh]"
        aria-describedby="day-report-description"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">Attendance Report</DialogTitle>
          <DialogDescription id="day-report-description" className="text-sm sm:text-base">
            {format(parseISO(dayReport.date), 'EEEE, dd MMMM yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6" role="document">
          {/* Overall Summary */}
          <Card className="border-2" role="region" aria-labelledby="overall-summary-title">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle id="overall-summary-title" className="text-base sm:text-lg">
                Overall Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
                <div className="text-center">
                  <dt className="sr-only">Total Students</dt>
                  <dd className="text-xl sm:text-3xl font-bold">
                    {dayReport.overall.totalStudents}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Total</dd>
                </div>
                <div className="text-center">
                  <dt className="sr-only">Present Students</dt>
                  <dd className="text-xl sm:text-3xl font-bold text-[hsl(var(--success))]">
                    {dayReport.overall.present}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Present</dd>
                </div>
                <div className="text-center">
                  <dt className="sr-only">Late Students</dt>
                  <dd className="text-xl sm:text-3xl font-bold text-[hsl(var(--warning))]">
                    {dayReport.overall.late}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Late</dd>
                </div>
                <div className="text-center">
                  <dt className="sr-only">Absent Students</dt>
                  <dd className="text-xl sm:text-3xl font-bold text-[hsl(var(--destructive))]">
                    {dayReport.overall.absent}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Absent</dd>
                </div>
              </dl>
              <Separator className="my-3 sm:my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-medium">Attendance Rate</span>
                <Badge
                  variant={dayReport.overall.rate >= 85 ? 'default' : 'destructive'}
                  className="text-sm sm:text-base px-3 py-1"
                  aria-label={`Attendance rate: ${dayReport.overall.rate.toFixed(1)} percent`}
                >
                  {dayReport.overall.rate.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-muted/50 gap-0.5" role="search" aria-labelledby="filter-title">
            <CardHeader>
              <CardTitle id="filter-title" className="text-sm sm:text-base">
                Filter Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3 grid-cols-1 sm:grid-cols-3"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="space-y-2">
                  <Label htmlFor="filter-grade" className="text-sm">
                    Grade
                  </Label>
                  <Select value={filterGrade} onValueChange={handleGradeChange}>
                    <SelectTrigger id="filter-grade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {uniqueGrades.map((grade) => (
                        <SelectItem key={grade} value={String(grade)}>
                          Form {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-class" className="text-sm">
                    Class
                  </Label>
                  <Select value={filterClass} onValueChange={handleClassChange}>
                    <SelectTrigger id="filter-class">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filterGrade !== 'all' && (
                    <p className="text-xs text-muted-foreground">
                      Showing Form {filterGrade} classes only
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter-rate" className="text-sm">
                    Show Classes Below
                  </Label>
                  <Select value={filterRateThreshold} onValueChange={setFilterRateThreshold}>
                    <SelectTrigger id="filter-rate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="95">Below 95% (Excellent)</SelectItem>
                      <SelectItem value="90">Below 90% (Good)</SelectItem>
                      <SelectItem value="85">Below 85% (Fair)</SelectItem>
                      <SelectItem value="75">Below 75% (Poor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Filter Summary */}
          {(filterGrade !== 'all' || filterClass !== 'all' || filterRateThreshold !== 'all') && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <span>
                Showing {filteredReports.length} of {dayReport.classReports.length} classes
              </span>
              <button
                onClick={() => {
                  setFilterGrade('all');
                  setFilterClass('all');
                  setFilterRateThreshold('all');
                }}
                className="text-primary hover:underline"
                type="button"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Class Reports */}
          <section className="space-y-3 sm:space-y-4" aria-labelledby="class-breakdown-title">
            <header className="flex items-center justify-between">
              <h3 id="class-breakdown-title" className="text-base sm:text-lg font-semibold">
                Class Breakdown
              </h3>
              {filteredReports.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  aria-label={`Total classes: ${filteredReports.length}`}
                >
                  {filteredReports.length} {filteredReports.length === 1 ? 'Class' : 'Classes'}
                </Badge>
              )}
            </header>
            {filteredReports.length === 0 ? (
              <Card className="border-dashed" role="status">
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground text-sm">
                    {dayReport.classReports.length === 0
                      ? 'No attendance records found for this date'
                      : 'No classes match the selected filters'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                {filteredReports.map((report, index) => (
                  <article
                    key={`${report.classId}-${index}`}
                    className="hover:shadow-md transition-shadow"
                    aria-labelledby={`class-${report.classId}-${index}-name`}
                  >
                    <Card>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div>
                            <h4
                              id={`class-${report.classId}-${index}-name`}
                              className="text-sm sm:text-base font-semibold"
                            >
                              {report.className}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Grade {report.grade}
                            </p>
                          </div>
                          <Badge
                            variant={
                              report.rate >= 95
                                ? 'default'
                                : report.rate >= 85
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className="text-sm font-semibold"
                            aria-label={`Attendance rate for ${report.className}: ${report.rate.toFixed(1)} percent`}
                          >
                            {report.rate.toFixed(1)}%
                          </Badge>
                        </div>

                        <dl className="grid grid-cols-4 gap-2 text-center text-xs sm:text-sm">
                          <div className="space-y-1">
                            <dt>
                              <Users
                                className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-muted-foreground"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Total Students</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base">
                              {report.totalStudents}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Total</dd>
                          </div>
                          <div className="space-y-1">
                            <dt>
                              <CheckCircle2
                                className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-[hsl(var(--success))]"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Present Students</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base text-[hsl(var(--success))]">
                              {report.present}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Present</dd>
                          </div>
                          <div className="space-y-1">
                            <dt>
                              <Clock
                                className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-[hsl(var(--warning))]"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Late Students</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base text-[hsl(var(--warning))]">
                              {report.late}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Late</dd>
                          </div>
                          <div className="space-y-1">
                            <dt>
                              <XCircle
                                className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-[hsl(var(--destructive))]"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Absent Students</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base text-[hsl(var(--destructive))]">
                              {report.absent}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Absent</dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
