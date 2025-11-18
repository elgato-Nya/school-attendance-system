/**
 * Delete Student Dialog Component
 * Reusable confirmation dialog for permanently deleting students
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
import { Trash2 } from 'lucide-react';
import type { Student, ArchivedStudent } from '@/types';

interface DeleteStudentDialogProps {
  open: boolean;
  student: Student | ArchivedStudent | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteStudentDialog({
  open,
  student,
  onOpenChange,
  onConfirm,
}: DeleteStudentDialogProps) {
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
            className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto"
            aria-hidden="true"
          >
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">Delete Student Permanently?</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Confirm permanent deletion of student record
          </AlertDialogDescription>
          <div className="text-center space-y-3">
            <div className="space-y-1">
              <p className="text-base font-medium text-foreground">{studentName}</p>
              <p className="text-sm text-muted-foreground">IC: {studentIcNumber}</p>
            </div>

            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive mb-2">⚠️ This cannot be undone</p>
              <p className="text-sm text-muted-foreground">
                All student data will be permanently removed from the system.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-left">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">
                💡 Consider archiving instead
              </p>
              <p className="text-xs text-muted-foreground">
                Keeps all data safe and can be restored anytime
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end gap-4">
          <AlertDialogCancel className="w-auto">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-auto bg-destructive hover:bg-destructive/90"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
