/**
 * AttendanceDetailDialog Component
 * Shows detailed attendance information including edit history
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Attendance } from '@/types';
import {
  Calendar,
  Clock,
  User,
  Users,
  TrendingUp,
  History,
  FileEdit,
  CheckCircle2,
  XCircle,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceDetailDialogProps {
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttendanceDetailDialog({
  attendance,
  open,
  onOpenChange,
}: AttendanceDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!attendance) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 dark:text-green-400';
      case 'late':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'absent':
        return 'text-red-600 dark:text-red-400';
      case 'excused':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'late':
        return <Timer className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Attendance Record Details
          </DialogTitle>
          <DialogDescription>
            View complete attendance information, student records, and edit history
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students ({attendance.records.length})</TabsTrigger>
            <TabsTrigger value="history">
              Edit History ({attendance.editHistory.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4 overflow-y-auto pr-4">
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-lg font-medium">
                      {format(new Date(attendance.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="text-lg font-medium">{attendance.className}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted By</p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {attendance.submittedByName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted At</p>
                    <p className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(attendance.timestamp.toDate(), 'h:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {attendance.editHistory.length > 0 ? (
                        <Badge variant="warning">
                          Edited {attendance.editHistory.length} time(s)
                        </Badge>
                      ) : (
                        <Badge variant="outline">Original</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telegram Notification</p>
                    <div className="mt-1">
                      <Badge variant={attendance.telegramSent ? 'success' : 'secondary'}>
                        {attendance.telegramSent ? 'Sent' : 'Not Sent'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Attendance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted">
                      <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-2xl font-bold">{attendance.summary.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                      <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {attendance.summary.present}
                      </p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                      <Timer className="h-5 w-5 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {attendance.summary.late}
                      </p>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                      <XCircle className="h-5 w-5 mx-auto mb-2 text-red-600 dark:text-red-400" />
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {attendance.summary.absent}
                      </p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {attendance.summary.excused}
                      </p>
                      <p className="text-xs text-muted-foreground">Excused</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{attendance.summary.rate}%</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="space-y-4 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Student Records ({attendance.records.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {attendance.records.map((record, index) => (
                      <div
                        key={`${record.icNumber}-${index}`}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{record.studentName}</p>
                          <p className="text-sm text-muted-foreground">{record.icNumber}</p>
                          {record.remarks && (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              Note: {record.remarks}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {record.status === 'late' && record.lateTime && (
                            <div className="text-right">
                              <p className="text-sm font-medium">{record.lateTime}</p>
                              {record.minutesLate && (
                                <p className="text-xs text-muted-foreground">
                                  {record.minutesLate} min late
                                </p>
                              )}
                            </div>
                          )}
                          <Badge
                            variant={
                              record.status === 'present'
                                ? 'success'
                                : record.status === 'late'
                                  ? 'warning'
                                  : record.status === 'excused'
                                    ? 'default'
                                    : 'destructive'
                            }
                            className={`capitalize flex items-center gap-1 ${getStatusColor(record.status)}`}
                          >
                            {getStatusIcon(record.status)}
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              {attendance.editHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Edit History</h3>
                    <p className="text-muted-foreground">This record has never been edited</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {attendance.editHistory.map((edit, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <FileEdit className="h-4 w-4" />
                              Edit #{attendance.editHistory.length - index}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(edit.editedAt.toDate(), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {edit.editedByName}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Reason for Edit:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {edit.reason}
                          </p>
                        </div>

                        <Separator />

                        <div>
                          <p className="text-sm font-medium mb-3">Previous Summary:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div className="text-center p-2 rounded-lg bg-muted text-sm">
                              <p className="font-bold">{edit.previousSummary.total}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-sm">
                              <p className="font-bold text-green-600 dark:text-green-400">
                                {edit.previousSummary.present}
                              </p>
                              <p className="text-xs text-muted-foreground">Present</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-sm">
                              <p className="font-bold text-yellow-600 dark:text-yellow-400">
                                {edit.previousSummary.late}
                              </p>
                              <p className="text-xs text-muted-foreground">Late</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm">
                              <p className="font-bold text-red-600 dark:text-red-400">
                                {edit.previousSummary.absent}
                              </p>
                              <p className="text-xs text-muted-foreground">Absent</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
                              <p className="font-bold text-blue-600 dark:text-blue-400">
                                {edit.previousSummary.excused}
                              </p>
                              <p className="text-xs text-muted-foreground">Excused</p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-primary/10 text-sm">
                              <p className="font-bold">{edit.previousSummary.rate}%</p>
                              <p className="text-xs text-muted-foreground">Rate</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Current/Original Summary */}
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Current Summary
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Active attendance data
                          </p>
                        </div>
                        <Badge variant="success">Current</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="text-center p-2 rounded-lg bg-muted text-sm">
                          <p className="font-bold">{attendance.summary.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-sm">
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {attendance.summary.present}
                          </p>
                          <p className="text-xs text-muted-foreground">Present</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-sm">
                          <p className="font-bold text-yellow-600 dark:text-yellow-400">
                            {attendance.summary.late}
                          </p>
                          <p className="text-xs text-muted-foreground">Late</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm">
                          <p className="font-bold text-red-600 dark:text-red-400">
                            {attendance.summary.absent}
                          </p>
                          <p className="text-xs text-muted-foreground">Absent</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
                          <p className="font-bold text-blue-600 dark:text-blue-400">
                            {attendance.summary.excused}
                          </p>
                          <p className="text-xs text-muted-foreground">Excused</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-primary/10 text-sm">
                          <p className="font-bold">{attendance.summary.rate}%</p>
                          <p className="text-xs text-muted-foreground">Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
