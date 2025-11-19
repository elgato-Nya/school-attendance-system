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

    if (diffInMinutes < 1) return 'Baru sahaja';
    if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}j lalu`;
    return `${Math.floor(diffInMinutes / 1440)}h lalu`;
  };

  return (
    <Card className="gap-1">
      <CardHeader>
        <CardTitle className="flex flex-col gap-1">
          <div className="flex flex-row items-center gap-2">
            <Clock className="h-5 w-5" aria-hidden="true" />
            Penyerahan Terkini
          </div>
          <p className="text-xs sm:text-sm font-normal text-muted-foreground">
            Klik pada penyerahan untuk butiran
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Clock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Tiada aktiviti terkini</p>
            <p className="text-xs text-muted-foreground">
              Penyerahan kehadiran akan muncul di sini
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Tarikh</TableHead>
                    <TableHead className="text-center">Kadar</TableHead>
                    <TableHead>Diserahkan Oleh</TableHead>
                    <TableHead className="text-right">Masa</TableHead>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {displayActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleRowClick(activity)}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(activity);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{activity.className}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        <time dateTime={activity.date}>
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      </p>
                    </div>
                    <Badge
                      variant={getRateBadgeVariant(activity.summary.rate)}
                      aria-label={`Attendance rate: ${activity.summary.rate}%`}
                      className="shrink-0"
                    >
                      {activity.summary.rate}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate flex-1 mr-2">
                      {activity.submittedByName}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      <time dateTime={new Date(activity.timestamp.seconds * 1000).toISOString()}>
                        {getTimeAgo(activity.timestamp)}
                      </time>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
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
