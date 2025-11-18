import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock } from 'lucide-react';
import { AttendanceDetailDialog } from '@/components/attendance/AttendanceDetailDialog';
import type { Attendance } from '@/types';

interface RecentActivityProps {
  activities: Attendance[];
  maxItems?: number;
}

export function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const displayActivities = activities.slice(0, maxItems);

  const handleRowClick = (activity: Attendance) => {
    setSelectedAttendance(activity);
    setDialogOpen(true);
  };

  const getRateBadgeVariant = (rate: number): 'success' | 'warning' | 'destructive' => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'destructive';
  };

  const getTimeAgo = (timestamp: { seconds: number }) => {
    const now = Date.now();
    const submittedAt = timestamp.seconds * 1000;
    const diffInMinutes = Math.floor((now - submittedAt) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="gap-1">
      <CardHeader>
        <CardTitle className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5" aria-hidden="true" />
            Recent Submissions
          </div>
          <p className="text-xs sm:text-sm font-normal text-muted-foreground">
            Click on the submissions for details
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Clock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No recent activity</p>
            <p className="text-xs text-muted-foreground">Attendance submissions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Rate</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayActivities.map((activity) => (
                  <TableRow
                    key={activity.id}
                    onClick={() => handleRowClick(activity)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{activity.className}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <time dateTime={activity.date}>
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={getRateBadgeVariant(activity.summary.rate)}
                        aria-label={`Attendance rate: ${activity.summary.rate}%`}
                      >
                        {activity.summary.rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {activity.submittedByName}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      <time dateTime={new Date(activity.timestamp.seconds * 1000).toISOString()}>
                        {getTimeAgo(activity.timestamp)}
                      </time>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AttendanceDetailDialog
        attendance={selectedAttendance}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
