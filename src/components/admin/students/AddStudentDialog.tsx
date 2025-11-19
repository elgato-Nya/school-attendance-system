/**
 * Add Student Dialog Component
 * Dialog for creating a new student and assigning to a class
 */

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import type { Class, StudentFormData } from '@/types';

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: Class[];
  onSubmit: (classId: string, studentData: StudentFormData) => void;
  defaultClassId?: string;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  classes,
  onSubmit,
  defaultClassId,
}: AddStudentDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId || '');
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    icNumber: '',
    dob: '',
    guardianName: '',
    guardianContact: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Group classes by grade
  const classesByGrade = classes.reduce(
    (acc, cls) => {
      if (!acc[cls.grade]) {
        acc[cls.grade] = [];
      }
      acc[cls.grade].push(cls);
      return acc;
    },
    {} as Record<number, Class[]>
  );

  const grades = Object.keys(classesByGrade)
    .map(Number)
    .sort((a, b) => a - b);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedClassId) {
      errors.class = 'Please select a class';
    }

    if (!formData.name.trim()) {
      errors.name = 'Nama murid diperlukan';
    }

    if (!formData.icNumber.trim()) {
      errors.icNumber = 'Nombor IC diperlukan';
    } else if (!/^\d{6}-\d{2}-\d{4}$/.test(formData.icNumber)) {
      errors.icNumber = 'Nombor IC mesti dalam format XXXXXX-XX-XXXX';
    }

    if (!formData.dob) {
      errors.dob = 'Tarikh lahir diperlukan';
    }

    if (!formData.guardianName.trim()) {
      errors.guardianName = 'Nama penjaga diperlukan';
    }

    if (!formData.guardianContact.trim()) {
      errors.guardianContact = 'Nombor telefon penjaga diperlukan';
    } else if (!/^01\d-\d{7,8}$/.test(formData.guardianContact)) {
      errors.guardianContact = 'Nombor telefon mesti dalam format 01X-XXXXXXX';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(selectedClassId, formData);

      // Reset form
      setFormData({
        name: '',
        icNumber: '',
        dob: '',
        guardianName: '',
        guardianContact: '',
        address: '',
      });
      setSelectedClassId(defaultClassId || '');
      setFormErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Murid Baharu</DialogTitle>
          <DialogDescription>
            Masukkan maklumat murid dan pilih kelas untuk ditugaskan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="classSelect">Tugaskan ke Kelas *</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="classSelect" aria-label="Pilih kelas untuk murid baharu">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <div key={grade}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      Tingkatan {grade}
                    </div>
                    {classesByGrade[grade].map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {formErrors.class && <p className="text-sm text-destructive">{formErrors.class}</p>}
          </div>

          {/* Student Name */}
          <div className="space-y-2">
            <Label htmlFor="studentName">Nama Murid *</Label>
            <Input
              id="studentName"
              placeholder="Nama penuh"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              aria-label="Nama penuh murid"
            />
            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
          </div>

          {/* IC Number */}
          <div className="space-y-2">
            <Label htmlFor="icNumber">Nombor IC *</Label>
            <Input
              id="icNumber"
              placeholder="XXXXXX-XX-XXXX"
              value={formData.icNumber}
              onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
              aria-label="Nombor IC murid"
            />
            {formErrors.icNumber && (
              <p className="text-sm text-destructive">{formErrors.icNumber}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob">Tarikh Lahir *</Label>
            <DatePicker
              date={formData.dob ? new Date(formData.dob) : undefined}
              onDateChange={(date) => {
                setFormData({
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

          {/* Guardian Name */}
          <div className="space-y-2">
            <Label htmlFor="guardianName">Nama Penjaga *</Label>
            <Input
              id="guardianName"
              placeholder="Nama ibu bapa/penjaga"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              aria-label="Nama penuh penjaga"
            />
            {formErrors.guardianName && (
              <p className="text-sm text-destructive">{formErrors.guardianName}</p>
            )}
          </div>

          {/* Guardian Contact */}
          <div className="space-y-2">
            <Label htmlFor="guardianContact">Nombor Hubungan Penjaga *</Label>
            <Input
              id="guardianContact"
              placeholder="012-3456789"
              value={formData.guardianContact}
              onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
              aria-label="Nombor hubungan penjaga"
            />
            {formErrors.guardianContact && (
              <p className="text-sm text-destructive">{formErrors.guardianContact}</p>
            )}
          </div>

          {/* Address (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat (Pilihan)</Label>
            <Input
              id="address"
              placeholder="Alamat rumah"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              aria-label="Alamat rumah murid"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:flex-1" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
