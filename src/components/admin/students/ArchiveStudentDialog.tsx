/**
 * Archive Student Dialog Component
 * Reusable confirmation dialog for archiving/restoring students
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Archive, ArchiveRestore } from 'lucide-react';
import type { Student, ArchivedStudent } from '@/types';

interface ArchiveStudentDialogProps {
  open: boolean;
  student: Student | ArchivedStudent | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ArchiveStudentDialog({
  open,
  student,
  onOpenChange,
  onConfirm,
}: ArchiveStudentDialogProps) {
  const isArchived = student ? 'studentData' in student : false;
  const studentName = student
    ? 'studentData' in student
      ? student.studentData.name
      : student.name
    : '';
  const studentIcNumber = student
    ? 'studentData' in student
      ? student.studentData.icNumber
      : student.icNumber
    : '';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="space-y-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto"
            aria-hidden="true"
          >
            {isArchived ? (
              <ArchiveRestore className="h-6 w-6 text-primary" />
            ) : (
              <Archive className="h-6 w-6 text-primary" />
            )}
          </div>
          <AlertDialogTitle className="text-center">
            {isArchived ? 'Restore Student?' : 'Archive Student?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {isArchived
              ? 'Confirm restoring student to active roster'
              : 'Confirm archiving student'}
          </AlertDialogDescription>
          <div className="text-center space-y-3">
            <div className="space-y-1">
              <p className="text-base font-medium text-foreground">{studentName}</p>
              <p className="text-sm text-muted-foreground">IC: {studentIcNumber}</p>
            </div>

            {isArchived ? (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-left">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  ✓ Return to active class roster
                </p>
                <p className="text-xs text-muted-foreground">
                  Student will be able to attend classes and mark attendance again.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-left">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  💾 Safe removal from active roster
                </p>
                <p className="text-xs text-muted-foreground">
                  All data preserved. Can be restored anytime.
                </p>
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-4">
          <AlertDialogCancel className="w-auto">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="w-auto">
            {isArchived ? 'Restore Student' : 'Archive Student'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
