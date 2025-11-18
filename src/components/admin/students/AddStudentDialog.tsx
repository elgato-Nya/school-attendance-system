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
      errors.name = 'Student name is required';
    }

    if (!formData.icNumber.trim()) {
      errors.icNumber = 'IC number is required';
    } else if (!/^\d{6}-\d{2}-\d{4}$/.test(formData.icNumber)) {
      errors.icNumber = 'IC number must be in format XXXXXX-XX-XXXX';
    }

    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }

    if (!formData.guardianName.trim()) {
      errors.guardianName = 'Guardian name is required';
    }

    if (!formData.guardianContact.trim()) {
      errors.guardianContact = 'Guardian contact is required';
    } else if (!/^01\d-\d{7,8}$/.test(formData.guardianContact)) {
      errors.guardianContact = 'Contact must be in format 01X-XXXXXXX';
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
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student information and select which class to assign them to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="classSelect">Assign to Class *</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger id="classSelect" aria-label="Select class for new student">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <div key={grade}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      Form {grade}
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
            <Label htmlFor="studentName">Student Name *</Label>
            <Input
              id="studentName"
              placeholder="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              aria-label="Student full name"
            />
            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
          </div>

          {/* IC Number */}
          <div className="space-y-2">
            <Label htmlFor="icNumber">IC Number *</Label>
            <Input
              id="icNumber"
              placeholder="XXXXXX-XX-XXXX"
              value={formData.icNumber}
              onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
              aria-label="Student IC number"
            />
            {formErrors.icNumber && (
              <p className="text-sm text-destructive">{formErrors.icNumber}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth *</Label>
            <DatePicker
              date={formData.dob ? new Date(formData.dob) : undefined}
              onDateChange={(date) => {
                setFormData({
                  ...formData,
                  dob: date ? format(date, 'yyyy-MM-dd') : '',
                });
              }}
              placeholder="Select date of birth"
              closeOnSelect={true}
              captionLayout="dropdown"
              fromYear={1990}
              toYear={new Date().getFullYear()}
            />
            {formErrors.dob && <p className="text-sm text-destructive">{formErrors.dob}</p>}
          </div>

          {/* Guardian Name */}
          <div className="space-y-2">
            <Label htmlFor="guardianName">Guardian Name *</Label>
            <Input
              id="guardianName"
              placeholder="Parent/Guardian name"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              aria-label="Guardian full name"
            />
            {formErrors.guardianName && (
              <p className="text-sm text-destructive">{formErrors.guardianName}</p>
            )}
          </div>

          {/* Guardian Contact */}
          <div className="space-y-2">
            <Label htmlFor="guardianContact">Guardian Contact *</Label>
            <Input
              id="guardianContact"
              placeholder="012-3456789"
              value={formData.guardianContact}
              onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
              aria-label="Guardian contact number"
            />
            {formErrors.guardianContact && (
              <p className="text-sm text-destructive">{formErrors.guardianContact}</p>
            )}
          </div>

          {/* Address (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              placeholder="Home address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              aria-label="Student home address"
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
