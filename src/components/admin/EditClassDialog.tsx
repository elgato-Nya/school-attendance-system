/**
 * Edit class dialog - update existing class with cascade
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import type { ClassFormData, User, Class } from '@/types';

interface EditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: Class | null;
  formData: ClassFormData;
  formErrors: Record<string, string>;
  teachers: User[];
  attendanceRecordCount?: number;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: ClassFormData) => void;
}

export function EditClassDialog({
  open,
  onOpenChange,
  classData,
  formData,
  formErrors,
  teachers,
  attendanceRecordCount = 0,
  onSubmit,
  onChange,
}: EditClassDialogProps) {
  // Check if name changed
  const nameChanged = classData && classData.name !== formData.name;

  // Check if teacher changed
  const teacherChanged = classData && classData.teacherRep !== formData.teacherRep;

  const hasChanges = nameChanged || teacherChanged;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Update class information. Changes will be reflected across all records.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Class Name Warning */}
          {nameChanged && attendanceRecordCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Class Name Change Detected
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This will update <strong>{attendanceRecordCount}</strong> attendance record
                    {attendanceRecordCount !== 1 ? 's' : ''} with the new class name.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Change Warning */}
          {teacherChanged && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Teacher Assignment Change
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    The class will be removed from the previous teacher's assignments and added to
                    the new teacher.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Class Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Science A, Mathematics B"
              value={formData.name}
              onChange={(e) => {
                onChange({ ...formData, name: e.target.value });
              }}
            />
            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-grade">Grade/Form (Number)</Label>
            <select
              id="edit-grade"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.grade || ''}
              onChange={(e) => onChange({ ...formData, grade: parseInt(e.target.value) || 0 })}
            >
              <option value="">Select grade...</option>
              <option value="1">Form 1</option>
              <option value="2">Form 2</option>
              <option value="3">Form 3</option>
              <option value="4">Form 4</option>
              <option value="5">Form 5</option>
            </select>
            {formErrors.grade && <p className="text-sm text-destructive">{formErrors.grade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-teacherRep">Class Teacher</Label>
            <select
              id="edit-teacherRep"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.teacherRep}
              onChange={(e) => {
                onChange({ ...formData, teacherRep: e.target.value });
              }}
            >
              <option value="">Select teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                  {teacher.id === classData?.teacherRep && ' (Current)'}
                </option>
              ))}
            </select>
            {formErrors.teacherRep && (
              <p className="text-sm text-destructive">{formErrors.teacherRep}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={!hasChanges}>
              {hasChanges ? 'Update Class' : 'No Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
