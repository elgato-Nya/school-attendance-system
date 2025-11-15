/**
 * Mark Attendance Page - Refactored with separation of concerns
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DateSelectionCard } from '@/components/attendance/DateSelectionCard';
import { StudentAttendanceCard } from '@/components/attendance/StudentAttendanceCard';
import { AttendanceSummaryCard } from '@/components/attendance/AttendanceSummaryCard';
import { useAttendanceForm } from '@/hooks/useAttendanceForm';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, AlertTriangle, CheckCircle2, Save, Copy, Check } from 'lucide-react';

export default function MarkAttendance() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    classData,
    loading,
    submitting,
    selectedDate,
    isHolidayDate,
    holidayName,
    existingSubmission,
    lateReason,
    showReasonField,
    copied,
    records,
    summary,
    setSelectedDate,
    setLateReason,
    handleStatusChange,
    handleLateTimeChange,
    handleRemarksChange,
    handleMarkAllPresent,
    handleCopyAttendance,
    handleSubmit,
  } = useAttendanceForm({
    classId: classId || '',
    userId: user?.id || '',
    userName: user?.name || '',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading class data...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Class not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div
      className="space-y-4 sm:space-y-6 pb-8 px-2 sm:px-0"
      role="main"
      aria-label="Mark attendance form"
    >
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/teacher/classes')}
          aria-label="Back to class selection"
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            Mark Attendance
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground truncate">
            {classData.name} Grade {classData.grade} {classData.students.length} Students
          </p>
        </div>
      </div>

      {/* Date Selection */}
      <DateSelectionCard
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isHolidayDate={isHolidayDate}
        holidayName={holidayName}
        existingSubmission={existingSubmission}
        showReasonField={showReasonField}
        lateReason={lateReason}
        onLateReasonChange={setLateReason}
      />

      {/* Quick Actions */}
      {!isHolidayDate && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllPresent}
            aria-label="Mark all students as present"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Mark All Present
          </Button>
          <Button
            variant="outline"
            onClick={handleCopyAttendance}
            aria-label="Copy attendance report"
            className="ml-auto"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                Copy Report
              </>
            )}
          </Button>
        </div>
      )}

      {/* Student Attendance Records */}
      {!isHolidayDate && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance</CardTitle>
            <CardDescription>
              Mark exceptions only. All students are pre-marked as present.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {records.map((record, index) => (
                <StudentAttendanceCard
                  key={index}
                  record={record}
                  index={index}
                  totalRecords={records.length}
                  onStatusChange={(status) => handleStatusChange(index, status)}
                  onLateTimeChange={(time) => handleLateTimeChange(index, time)}
                  onRemarksChange={(remarks) => handleRemarksChange(index, remarks)}
                  showSeparator={index < records.length - 1}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {!isHolidayDate && (
        <AttendanceSummaryCard
          total={summary.total}
          present={summary.present}
          late={summary.late}
          absent={summary.absent}
          attendanceRate={summary.rate}
        />
      )}

      {/* Submit Buttons */}
      {!isHolidayDate && (
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-2 px-2 sm:mx-0 sm:px-0 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:py-0 border-t sm:border-0">
          <Button
            variant="outline"
            onClick={() => navigate('/teacher/classes')}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (showReasonField && !lateReason.trim())}
            aria-label="Submit attendance"
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" aria-hidden="true" />
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </div>
      )}
    </div>
  );
}
