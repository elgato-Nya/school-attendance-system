/**
 * Student form dialog - add student to class
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
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import type { StudentFormData } from '@/types';

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className: string;
  formData: StudentFormData;
  formErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: StudentFormData) => void;
}

export function StudentFormDialog({
  open,
  onOpenChange,
  className,
  formData,
  formErrors,
  onSubmit,
  onChange,
}: StudentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Murid ke {className}</DialogTitle>
          <DialogDescription>Masukkan maklumat murid dan butiran penjaga.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">Nama Murid</Label>
            <Input
              id="studentName"
              placeholder="Nama penuh"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="icNumber">Nombor IC</Label>
            <Input
              id="icNumber"
              placeholder="XXXXXX-XX-XXXX"
              value={formData.icNumber}
              onChange={(e) => onChange({ ...formData, icNumber: e.target.value })}
            />
            {formErrors.icNumber && (
              <p className="text-sm text-destructive">{formErrors.icNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Tarikh Lahir</Label>
            <DatePicker
              date={formData.dob ? new Date(formData.dob) : undefined}
              onDateChange={(date) => {
                onChange({
                  ...formData,
                  dob: date ? format(date, 'yyyy-MM-dd') : '',
                });
              }}
              placeholder="Pilih tarikh lahir"
              closeOnSelect={true}
              captionLayout="dropdown"
              fromYear={1990}
              toYear={new Date().getFullYear()}
            />
            {formErrors.dob && <p className="text-sm text-destructive">{formErrors.dob}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianName">Nama Penjaga</Label>
            <Input
              id="guardianName"
              placeholder="Nama ibu bapa/penjaga"
              value={formData.guardianName}
              onChange={(e) => onChange({ ...formData, guardianName: e.target.value })}
            />
            {formErrors.guardianName && (
              <p className="text-sm text-destructive">{formErrors.guardianName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianContact">Hubungan Penjaga</Label>
            <Input
              id="guardianContact"
              placeholder="012-3456789"
              value={formData.guardianContact}
              onChange={(e) => onChange({ ...formData, guardianContact: e.target.value })}
            />
            {formErrors.guardianContact && (
              <p className="text-sm text-destructive">{formErrors.guardianContact}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat (Pilihan)</Label>
            <Input
              id="address"
              placeholder="Alamat rumah"
              value={formData.address}
              onChange={(e) => onChange({ ...formData, address: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            Tambah Murid
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
