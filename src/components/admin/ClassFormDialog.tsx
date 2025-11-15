/**
 * Class form dialog - create new class
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ClassFormData, User } from '@/types';

interface ClassFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ClassFormData;
  formErrors: Record<string, string>;
  teachers: User[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: ClassFormData) => void;
  onReset: () => void;
}

export function ClassFormDialog({
  open,
  onOpenChange,
  formData,
  formErrors,
  teachers,
  onSubmit,
  onChange,
}: ClassFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>Enter class details and assign a class teacher.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="e.g., Science A, Mathematics B"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade/Form (Number)</Label>
            <select
              id="grade"
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
            <Label htmlFor="teacherRep">Class Teacher</Label>
            <select
              id="teacherRep"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.teacherRep}
              onChange={(e) => onChange({ ...formData, teacherRep: e.target.value })}
            >
              <option value="">Select teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {formErrors.teacherRep && (
              <p className="text-sm text-destructive">{formErrors.teacherRep}</p>
            )}
            {teachers.length === 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ No teachers available. Please create a teacher account first.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={teachers.length === 0}>
            Create Class
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
