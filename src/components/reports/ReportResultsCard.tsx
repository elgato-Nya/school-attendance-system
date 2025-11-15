/**
 * ReportResultsCard Component
 * Display report results with summary and detailed records
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ReportSummary } from './ReportSummary';
import type { ReportData } from '@/hooks/useReportGeneration';

interface ReportResultsCardProps {
  reportData: ReportData;
}

export function ReportResultsCard({ reportData }: ReportResultsCardProps) {
  const getDescription = () => {
    switch (reportData.type) {
      case 'daily':
        return `Daily report for ${reportData.date}`;
      case 'class':
        return `${reportData.className} report from ${reportData.startDate} to ${reportData.endDate}`;
      case 'student':
        return `${reportData.studentName} report from ${reportData.startDate} to ${reportData.endDate}`;
      case 'cumulative':
        return `School-wide report from ${reportData.startDate} to ${reportData.endDate}`;
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Report Results</CardTitle>
        <CardDescription className="text-sm">{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReportSummary
          summary={reportData.summary}
          reportType={reportData.type}
          recordsCount={reportData.records.length}
        />

        <Separator />

        {/* Detailed Records */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base md:text-lg">Detailed Records</h3>
          {reportData.records.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              No attendance records found for the selected criteria
            </p>
          ) : (
            <div className="space-y-2">
              {reportData.records.map((record) => (
                <Card key={record.id} className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm md:text-base truncate">
                        {record.className}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {format(new Date(record.date), 'EEE, dd MMM yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="text-xs">
                        {record.summary.present} Present
                      </Badge>
                      {record.summary.late > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {record.summary.late} Late
                        </Badge>
                      )}
                      {record.summary.absent > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {record.summary.absent} Absent
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
