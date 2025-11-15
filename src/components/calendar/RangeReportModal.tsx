/**
 * RangeReportModal Component
 * Displays attendance summary for a custom date range with great UX
 */

import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, CheckCircle2, Clock, XCircle, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

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

interface RangeReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rangeReport: RangeReport | null;
}

export function RangeReportModal({ open, onOpenChange, rangeReport }: RangeReportModalProps) {
  if (!rangeReport) return null;

  const { startDate, endDate, totalDays, daysWithData, overall, dailyBreakdown, classPerformance } =
    rangeReport;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-4"
        aria-describedby="range-report-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" aria-hidden="true" />
            <span className="truncate">Range Report</span>
          </DialogTitle>
          <DialogDescription id="range-report-description" className="text-sm sm:text-base">
            <span className="inline-flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm">
                {format(parseISO(startDate), 'MMM dd, yyyy')}
              </span>
              <span className="text-xs sm:text-sm">→</span>
              <span className="text-xs sm:text-sm">
                {format(parseISO(endDate), 'MMM dd, yyyy')}
              </span>
              <Badge variant="secondary" className="text-xs">
                {totalDays} {totalDays === 1 ? 'day' : 'days'}
              </Badge>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Overall Summary Stats */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              Overall Summary
            </h3>
            <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-4">
              <Card>
                <CardContent className="pt-3 sm:pt-6 pb-2 sm:pb-6">
                  <div className="text-center">
                    <Users
                      className="h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="text-xl sm:text-2xl font-bold">
                      {Math.round(overall.totalStudents)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Avg/Day</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {overall.totalAttendanceRecords} records
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-3 sm:pt-6 pb-2 sm:pb-6">
                  <div className="text-center">
                    <CheckCircle2
                      className="h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-green-600"
                      aria-hidden="true"
                    />
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {overall.present}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Present</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {((overall.present / overall.totalAttendanceRecords) * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-3 sm:pt-6 pb-2 sm:pb-6">
                  <div className="text-center">
                    <Clock
                      className="h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-yellow-600"
                      aria-hidden="true"
                    />
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">{overall.late}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Late</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {((overall.late / overall.totalAttendanceRecords) * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-3 sm:pt-6 pb-2 sm:pb-6">
                  <div className="text-center">
                    <XCircle
                      className="h-5 w-5 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-red-600"
                      aria-hidden="true"
                    />
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{overall.absent}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Absent</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                      {((overall.absent / overall.totalAttendanceRecords) * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-2 sm:mt-4">
              <CardContent className="pt-3 sm:pt-6 pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
                    <span className="font-semibold text-sm sm:text-base">Overall Rate</span>
                  </div>
                  <Badge
                    variant={overall.rate >= 85 ? 'default' : 'destructive'}
                    className="text-base sm:text-lg px-3 sm:px-4 py-1"
                  >
                    {overall.rate.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {daysWithData} of {totalDays} days recorded
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Class Performance */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Class Performance</h3>
            <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {classPerformance
                .sort((a, b) => b.avgAttendanceRate - a.avgAttendanceRate)
                .map((cls) => (
                  <Card key={cls.classId}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {cls.className}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {cls.daysReported} {cls.daysReported === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                          <div className="text-xs sm:text-sm flex-1 sm:flex-none">
                            <span className="text-green-600 font-medium">{cls.totalPresent}</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-yellow-600 font-medium">{cls.totalLate}</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-red-600 font-medium">{cls.totalAbsent}</span>
                          </div>
                          <Badge
                            variant={cls.avgAttendanceRate >= 85 ? 'default' : 'destructive'}
                            className="min-w-[50px] sm:min-w-[60px] text-xs sm:text-sm shrink-0"
                          >
                            {cls.avgAttendanceRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          <Separator />

          {/* Daily Breakdown */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">Daily Breakdown</h3>
            <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1">
              {dailyBreakdown
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((day) => (
                  <Card key={day.date} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex-1 min-w-0 w-full">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {format(parseISO(day.date), 'EEE, MMM dd, yyyy')}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {day.classCount} {day.classCount === 1 ? 'class' : 'classes'} •{' '}
                            {day.totalStudents} students
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                          <div className="flex gap-1.5 sm:gap-2 text-xs sm:text-sm flex-wrap">
                            <Badge
                              variant="default"
                              className="bg-green-600 text-[10px] sm:text-xs px-1.5 sm:px-2"
                            >
                              {day.present} P
                            </Badge>
                            {day.late > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2"
                              >
                                {day.late} L
                              </Badge>
                            )}
                            {day.absent > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-[10px] sm:text-xs px-1.5 sm:px-2"
                              >
                                {day.absent} A
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant={day.rate >= 85 ? 'default' : 'destructive'}
                            className="min-w-[50px] sm:min-w-[60px] text-xs sm:text-sm shrink-0"
                          >
                            {day.rate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {dailyBreakdown.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No attendance data available for this date range
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
