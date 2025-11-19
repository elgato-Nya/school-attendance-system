/**
 * Submission Details Dialog
 * Shows which classes have submitted attendance and which haven't for today
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, User, UserCircle, Clock, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';
import type { Class, User as UserType } from '@/types';

interface SubmissionDetail {
  classId: string;
  className: string;
  grade: number;
  teacherName: string;
  teacherId?: string;
  submitted: boolean;
  submittedBy?: string;
  submittedByName?: string;
  submittedAt?: Date;
  studentCount: number;
}

interface SubmissionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: Class[];
  todaySubmissions: Array<{
    classId: string;
    className: string;
    submittedBy: string;
    submittedByName: string;
    timestamp: Date;
  }>;
  teachers: UserType[];
}

export function SubmissionDetailsDialog({
  open,
  onOpenChange,
  classes,
  todaySubmissions,
  teachers,
}: SubmissionDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'pending'>('all');

  // Build submission details for each class
  const submissionDetails: SubmissionDetail[] = classes.map((classItem) => {
    const submission = todaySubmissions.find((s) => s.classId === classItem.id);
    const teacher = teachers.find((t) => t.id === classItem.teacherRep);

    return {
      classId: classItem.id,
      className: classItem.name,
      grade: classItem.grade,
      teacherName: teacher?.name || 'Unassigned',
      teacherId: teacher?.id,
      submitted: !!submission,
      submittedBy: submission?.submittedBy,
      submittedByName: submission?.submittedByName,
      submittedAt: submission?.timestamp,
      studentCount: classItem.students?.length || 0,
    };
  });

  // Sort by grade and then by class name
  submissionDetails.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.className.localeCompare(b.className);
  });

  const submittedClasses = submissionDetails.filter((d) => d.submitted);
  const pendingClasses = submissionDetails.filter((d) => !d.submitted);

  const renderClassCard = (detail: SubmissionDetail) => (
    <div
      key={detail.classId}
      className={`rounded-lg border p-4 transition-colors ${
        detail.submitted
          ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900'
          : 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900'
      }`}
      role="article"
      aria-label={`${detail.className} - ${detail.submitted ? 'Submitted' : 'Pending'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base truncate">{detail.className}</h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              <GraduationCap className="h-3 w-3 mr-1" aria-hidden="true" />
              Tingkatan {detail.grade}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{detail.studentCount} murid</span>
          </p>
        </div>
        <Badge
          variant={detail.submitted ? 'default' : 'secondary'}
          className={
            detail.submitted
              ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }
        >
          {detail.submitted ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
              Dihantar
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" aria-hidden="true" />
              Tertunda
            </>
          )}
        </Badge>
      </div>

      <div className="space-y-2 pt-3 border-t">
        <div className="flex items-center gap-2 text-sm">
          <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="text-muted-foreground">Ditugaskan kepada:</span>
          <span className="font-medium truncate">{detail.teacherName}</span>
        </div>

        {detail.submitted && detail.submittedAt && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground">Dihantar oleh:</span>
              <span className="font-medium truncate">{detail.submittedByName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="text-muted-foreground">Masa:</span>
              <span className="font-medium">{format(detail.submittedAt, 'h:mm a')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        aria-describedby="submission-details-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Penyerahan Kehadiran Hari Ini
          </DialogTitle>
          <DialogDescription id="submission-details-description">
            Lihat kelas mana yang sudah hantar kehadiran untuk {format(new Date(), 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{submissionDetails.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Jumlah Kelas</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-100 dark:bg-green-950/30">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {submittedClasses.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Diserahkan</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-100 dark:bg-red-950/30">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {pendingClasses.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Tertunda</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Semua ({submissionDetails.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="text-xs sm:text-sm">
              Dihantar ({submittedClasses.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Tertunda ({pendingClasses.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4 pr-4 overflow-y-auto">
            <TabsContent value="all" className="mt-0 space-y-3">
              {submissionDetails.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Tiada kelas dijumpai</p>
                </div>
              ) : (
                submissionDetails.map(renderClassCard)
              )}
            </TabsContent>

            <TabsContent value="submitted" className="mt-0 space-y-3">
              {submittedClasses.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Tiada penyerahan hari ini</p>
                </div>
              ) : (
                submittedClasses.map(renderClassCard)
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-0 space-y-3">
              {pendingClasses.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Semua kelas telah serahkan!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Kerja bagus semua!</p>
                </div>
              ) : (
                pendingClasses.map(renderClassCard)
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
