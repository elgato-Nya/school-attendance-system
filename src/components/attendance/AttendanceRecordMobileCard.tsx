/**
 * AttendanceRecordMobileCard
 * Mobile-friendly card view for attendance records
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Attendance } from '@/types';
import { Calendar, User, Edit } from 'lucide-react';

interface AttendanceRecordMobileCardProps {
  record: Attendance;
  onClick: (record: Attendance) => void;
}

// Helper function to parse date string without timezone issues
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function AttendanceRecordMobileCard({ record, onClick }: AttendanceRecordMobileCardProps) {
  const getRateBadgeVariant = (rate: number): 'success' | 'warning' | 'destructive' => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'destructive';
  };

  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors py-1"
      onClick={() => onClick(record)}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header: Date and Class */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <Calendar className="h-3 w-3" />
              <time dateTime={record.date}>
                {parseDateString(record.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-base">{record.className}</h3>
              <div className="flex items-center gap-1 text-primary">
                <span className="text-xs">({record.records.length} students)</span>
              </div>
            </div>
          </div>
          {record.editHistory.length > 0 ? (
            <Badge
              variant="warning"
              className="flex items-center gap-1 text-xs px-2 py-0.5"
              title={`Edited ${record.editHistory.length} time(s)`}
            >
              <Edit className="h-3 w-3" />
              Edited
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              Original
            </Badge>
          )}
        </div>

        {/* Stats Row - Compact */}
        <div className="flex items-center justify-between py-1.5 bg-muted/50 rounded">
          <div className="flex items-center gap-3 text-xs pl-2">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <span className="font-medium">{record.summary.present}</span>
              <span className="text-muted-foreground">Present</span>
            </div>
            {record.summary.late > 0 && (
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <span className="font-medium">{record.summary.late}</span>
                <span className="text-muted-foreground">Late</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <span className="font-medium">{record.summary.absent}</span>
              <span className="text-muted-foreground">Absent</span>
            </div>
          </div>
          <Badge
            variant={getRateBadgeVariant(record.summary.rate)}
            className="text-xs mr-2 px-2 py-0.5"
          >
            {record.summary.rate}%
          </Badge>
        </div>

        {/* Submitter - Compact */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Submitted by: {record.submittedByName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
