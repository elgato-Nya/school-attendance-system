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
          <DialogTitle>Sunting Kelas</DialogTitle>
          <DialogDescription>
            Kemaskini maklumat kelas. Perubahan akan diterapkan ke semua rekod.
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
                    Perubahan Nama Kelas Dikesan
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Ini akan mengemaskini <strong>{attendanceRecordCount}</strong> rekod kehadiran
                    dengan nama kelas baharu.
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
                    Perubahan Tugasan Guru
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Kelas akan dibuang dari tugasan guru sebelum dan ditambah kepada guru baharu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Kelas</Label>
            <Input
              id="edit-name"
              placeholder="cth., Sains A, Matematik B"
              value={formData.name}
              onChange={(e) => {
                onChange({ ...formData, name: e.target.value });
              }}
            />
            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-grade">Tingkatan (Nombor)</Label>
            <select
              id="edit-grade"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.grade || ''}
              onChange={(e) => onChange({ ...formData, grade: parseInt(e.target.value) || 0 })}
            >
              <option value="">Pilih tingkatan...</option>
              <option value="1">Tingkatan 1</option>
              <option value="2">Tingkatan 2</option>
              <option value="3">Tingkatan 3</option>
              <option value="4">Tingkatan 4</option>
              <option value="5">Tingkatan 5</option>
            </select>
            {formErrors.grade && <p className="text-sm text-destructive">{formErrors.grade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-teacherRep">Guru Kelas</Label>
            <select
              id="edit-teacherRep"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.teacherRep}
              onChange={(e) => {
                onChange({ ...formData, teacherRep: e.target.value });
              }}
            >
              <option value="">Pilih guru...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                  {teacher.id === classData?.teacherRep && ' (Semasa)'}
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
              Batal
            </Button>
            <Button type="submit" className="w-full sm:w-auto" disabled={!hasChanges}>
              {hasChanges ? 'Kemaskini Kelas' : 'Tiada Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
