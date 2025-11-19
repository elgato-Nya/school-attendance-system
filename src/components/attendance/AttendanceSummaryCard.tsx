/**
 * Attendance Summary Card Component
 * Displays attendance statistics and rate
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AttendanceSummaryCardProps {
  total: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: string;
}

export function AttendanceSummaryCard({
  total,
  present,
  late,
  absent,
  attendanceRate,
}: AttendanceSummaryCardProps) {
  const rate = parseFloat(attendanceRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Ringkasan Kehadiran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Jumlah Murid</p>
            <p className="text-xl sm:text-2xl font-bold">{total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Hadir</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{present}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Lewat</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{late}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Tidak Hadir</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{absent}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <p className="text-sm sm:text-base text-muted-foreground">Kadar Kehadiran</p>
          <Badge
            variant={rate >= 90 ? 'success' : rate >= 75 ? 'warning' : 'destructive'}
            className="text-base sm:text-lg font-semibold px-3 py-1"
          >
            {attendanceRate}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
