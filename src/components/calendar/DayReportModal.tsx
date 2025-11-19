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
        aria-describedby="penerangan-report-harian"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">Report Kehadiran</DialogTitle>
          <DialogDescription id="penerangan-report-harian" className="text-sm sm:text-base">
            {new Intl.DateTimeFormat('ms-MY', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }).format(parseISO(dayReport.date))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6" role="document">
          {/* Overall Summary */}
          <Card className="border-2" role="region" aria-labelledby="tajuk-ringkasan-keseluruhan">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle id="tajuk-ringkasan-keseluruhan" className="text-base sm:text-lg">
                Ringkasan Keseluruhan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-4 gap-2 sm:gap-4 mb-4">
                <div className="text-center">
                  <dt className="sr-only">Jumlah Murid</dt>
                  <dd className="text-xl sm:text-3xl font-bold">
                    {dayReport.overall.totalStudents}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Jumlah</dd>
                </div>
                <div className="text-center">
                  <dt className="sr-only">Murid Hadir</dt>
                  <dd className="text-xl sm:text-3xl font-bold text-[hsl(var(--success))]">
                    {dayReport.overall.present}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Hadir</dd>
                </div>
                <div className="text-center">
                  <dt className="sr-only">Murid Lewat</dt>
                  <dd className="text-xl sm:text-3xl font-bold text-[hsl(var(--warning))]">
                    {dayReport.overall.late}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Lewat</dd>
                </div>
                <div className="text-center">
                  <dt className="sr-only">Murid Tidak Hadir</dt>
                  <dd className="text-xl sm:text-3xl font-bold text-[hsl(var(--destructive))]">
                    {dayReport.overall.absent}
                  </dd>
                  <dd className="text-xs sm:text-sm text-muted-foreground mt-1">Tidak Hadir</dd>
                </div>
              </dl>
              <Separator className="my-3 sm:my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base font-medium">Kadar Kehadiran</span>
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
          <Card className="bg-muted/50 gap-0.5" role="search" aria-labelledby="tajuk-tapisan">
            <CardHeader>
              <CardTitle id="tajuk-tapisan" className="text-sm sm:text-base">
                Tapisan Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-3 grid-cols-1 sm:grid-cols-3"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="space-y-2">
                  <Label htmlFor="tapisan-tingkatan" className="text-sm">
                    Tingkatan
                  </Label>
                  <Select value={filterGrade} onValueChange={handleGradeChange}>
                    <SelectTrigger id="tapisan-tingkatan">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tingkatan</SelectItem>
                      {uniqueGrades.map((grade) => (
                        <SelectItem key={grade} value={String(grade)}>
                          Form {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tapisan-kelas" className="text-sm">
                    Kelas
                  </Label>
                  <Select value={filterClass} onValueChange={handleClassChange}>
                    <SelectTrigger id="tapisan-kelas">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filterGrade !== 'all' && (
                    <p className="text-xs text-muted-foreground">
                      Menunjukkan kelas Tingkatan {filterGrade} sahaja
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tapisan-kadar" className="text-sm">
                    Tunjukkan Kelas Di Bawah
                  </Label>
                  <Select value={filterRateThreshold} onValueChange={setFilterRateThreshold}>
                    <SelectTrigger id="tapisan-kadar">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kelas</SelectItem>
                      <SelectItem value="95">Di Bawah 95% (Cemerlang)</SelectItem>
                      <SelectItem value="90">Di Bawah 90% (Baik)</SelectItem>
                      <SelectItem value="85">Di Bawah 85% (Sederhana)</SelectItem>
                      <SelectItem value="75">Di Bawah 75% (Kurang)</SelectItem>
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
                Menunjukkan {filteredReports.length} daripada {dayReport.classReports.length} kelas
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
                Kosongkan tapisan
              </button>
            </div>
          )}

          {/* Class Reports */}
          <section className="space-y-3 sm:space-y-4" aria-labelledby="tajuk-pecahanan-kelas">
            <header className="flex items-center justify-between">
              <h3 id="tajuk-pecahan-kelas" className="text-base sm:text-lg font-semibold">
                Pecahan Kelas
              </h3>
              {filteredReports.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  aria-label={`Jumlah kelas: ${filteredReports.length}`}
                >
                  {filteredReports.length} {filteredReports.length === 1 ? 'Kelas' : 'Kelas'}
                </Badge>
              )}
            </header>
            {filteredReports.length === 0 ? (
              <Card className="border-dashed" role="status">
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground text-sm">
                    {dayReport.classReports.length === 0
                      ? 'Tiada rekod kehadiran untuk tarikh ini'
                      : 'Tiada kelas yang sepadan dengan tapisan yang dipilih'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                {filteredReports.map((report, index) => (
                  <article
                    key={`${report.classId}-${index}`}
                    className="hover:shadow-md transition-shadow"
                    aria-labelledby={`nama-kelas-${report.classId}-${index}`}
                  >
                    <Card>
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div>
                            <h4
                              id={`nama-kelas-${report.classId}-${index}`}
                              className="text-sm sm:text-base font-semibold"
                            >
                              {report.className}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Tingkatan {report.grade}
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
                            aria-label={`Kadar kehadiran untuk ${report.className}: ${report.rate.toFixed(1)} peratus`}
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
                              <span className="sr-only">Jumlah Murid</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base">
                              {report.totalStudents}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Jumlah</dd>
                          </div>
                          <div className="space-y-1">
                            <dt>
                              <CheckCircle2
                                className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-[hsl(var(--success))]"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Murid Hadir</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base text-[hsl(var(--success))]">
                              {report.present}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Hadir</dd>
                          </div>
                          <div className="space-y-1">
                            <dt>
                              <Clock
                                className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-[hsl(var(--warning))]"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Murid Lewat</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base text-[hsl(var(--warning))]">
                              {report.late}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Lewat</dd>
                          </div>
                          <div className="space-y-1">
                            <dt>
                              <XCircle
                                className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-[hsl(var(--destructive))]"
                                aria-hidden="true"
                              />
                              <span className="sr-only">Murid Tidak Hadir</span>
                            </dt>
                            <dd className="font-semibold text-sm sm:text-base text-[hsl(var(--destructive))]">
                              {report.absent}
                            </dd>
                            <dd className="text-xs text-muted-foreground">Tidak Hadir</dd>
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
