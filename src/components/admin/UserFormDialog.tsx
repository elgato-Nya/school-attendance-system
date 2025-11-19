/**
 * User form dialog - create/edit users (teachers and admins)
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import type { UserFormData, Class } from '@/types';
import { ROLES } from '@/utils/constants';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  formErrors: Record<string, string>;
  classes: Class[];
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: UserFormData) => void;
  onReset?: () => void; // Optional since not used in this component
}

export function UserFormDialog({
  open,
  onOpenChange,
  formData,
  formErrors,
  classes,
  isEditing,
  onSubmit,
  onChange,
}: UserFormDialogProps) {
  const handleClassToggle = (classId: string) => {
    const currentClasses = formData.assignedClasses || [];
    const newClasses = currentClasses.includes(classId)
      ? currentClasses.filter((id) => id !== classId)
      : [...currentClasses, classId];
    onChange({ ...formData, assignedClasses: newClasses });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Sunting Pengguna' : 'Cipta Pengguna Baharu'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Kemaskini maklumat pengguna dan kelas yang ditugaskan.'
              : 'Tambah guru atau admin baharu ke sistem.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Penuh</Label>
            <Input
              id="name"
              placeholder="cth., Ahmad bin Ali"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Emel</Label>
            <Input
              id="email"
              type="email"
              placeholder="ahmad@smktm.edu.my"
              value={formData.email}
              onChange={(e) => onChange({ ...formData, email: e.target.value })}
              disabled={isEditing}
            />
            {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Kata Laluan</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 aksara"
                value={formData.password || ''}
                onChange={(e) => onChange({ ...formData, password: e.target.value })}
              />
              {formErrors.password && (
                <p className="text-sm text-destructive">{formErrors.password}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Peranan</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={formData.role}
              onChange={(e) =>
                onChange({
                  ...formData,
                  role: e.target.value as (typeof ROLES)[keyof typeof ROLES],
                })
              }
            >
              <option value="">Pilih peranan...</option>
              <option value={ROLES.ADMIN}>Pentadbir</option>
              <option value={ROLES.TEACHER}>Guru</option>
            </select>
            {formErrors.role && <p className="text-sm text-destructive">{formErrors.role}</p>}
          </div>

          {formData.role === ROLES.TEACHER && (
            <div className="space-y-2">
              <Label htmlFor="assignedClasses">Kelas Ditugaskan</Label>
              {classes.length === 0 ? (
                <div className="text-sm text-muted-foreground border rounded-md p-4 text-center">
                  Tiada kelas tersedia. Cipta kelas terlebih dahulu.
                </div>
              ) : (
                <>
                  <ScrollArea className="h-40 w-full rounded-md border">
                    <div className="p-4 space-y-3">
                      {classes.map((cls) => (
                        <div key={cls.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`class-${cls.id}`}
                            checked={formData.assignedClasses?.includes(cls.id)}
                            onCheckedChange={() => handleClassToggle(cls.id)}
                          />
                          <label
                            htmlFor={`class-${cls.id}`}
                            className="text-sm font-medium leading-none cursor-pointer hover:text-primary"
                          >
                            {cls.grade} {cls.name} -{' '}
                            {cls.grade === 1 ? 'Tingkatan 1' : `Tingkatan ${cls.grade}`}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground">
                    Pilih satu atau lebih kelas untuk ditugaskan
                  </p>
                </>
              )}
            </div>
          )}

          <Button type="submit" className="w-full">
            {isEditing ? 'Kemaskini Pengguna' : 'Cipta Pengguna'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
