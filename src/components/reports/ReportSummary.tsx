/**
 * ReportSummary Component
 * Display report summary statistics
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';

interface ReportSummaryProps {
  summary: {
    totalStudents: number;
    totalDays: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
  };
  reportType: 'daily' | 'class' | 'student' | 'cumulative';
  recordsCount: number;
}

export function ReportSummary({ summary, reportType, recordsCount }: ReportSummaryProps) {
  const getRecordsText = () => {
    switch (reportType) {
      case 'daily':
        return `${recordsCount} class(es) reported`;
      case 'class':
        return `${summary.totalDays} day(s) of attendance`;
      case 'student':
        return `${summary.totalDays} day(s) tracked`;
      case 'cumulative':
        return `${recordsCount} total submissions across ${summary.totalDays} day(s)`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* Summary Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-center">
              <Users
                className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-lg md:text-2xl font-bold">{Math.round(summary.totalStudents)}</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {reportType === 'student' ? 'Student' : 'Avg Students/Day'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-center">
              <CheckCircle2
                className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-green-600"
                aria-hidden="true"
              />
              <p className="text-lg md:text-2xl font-bold text-green-600">{summary.present}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Present</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-center">
              <Clock
                className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-yellow-600"
                aria-hidden="true"
              />
              <p className="text-lg md:text-2xl font-bold text-yellow-600">{summary.late}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Late</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
            <div className="text-center">
              <XCircle
                className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-red-600"
                aria-hidden="true"
              />
              <p className="text-lg md:text-2xl font-bold text-red-600">{summary.absent}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Overall Rate */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" aria-hidden="true" />
          <span className="font-semibold text-sm md:text-base">Overall Attendance Rate</span>
        </div>
        <Badge
          variant={summary.rate >= 85 ? 'default' : 'destructive'}
          className="text-base md:text-lg px-3 md:px-4 py-1 w-fit"
        >
          {summary.rate.toFixed(1)}%
        </Badge>
      </div>

      {/* Records Count */}
      <div className="text-xs md:text-sm text-muted-foreground text-center">{getRecordsText()}</div>
    </>
  );
}
