/**
 * Student Details Dialog Component
 * Displays full student information in a dialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, Phone, MapPin, Hash } from 'lucide-react';
import type { Student, ArchivedStudent, Class } from '@/types';

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | ArchivedStudent | null;
  classes: Class[];
}

export function StudentDetailsDialog({
  open,
  onOpenChange,
  student,
  classes,
}: StudentDetailsDialogProps) {
  if (!student) return null;

  // Extract student data based on type
  const isArchived = 'studentData' in student;
  const studentData = isArchived ? (student as ArchivedStudent).studentData : (student as Student);
  const classId = isArchived
    ? (student as ArchivedStudent).originalClassId
    : (student as Student).classId;

  const classInfo = classes.find((c) => c.id === classId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" aria-hidden="true" />
            Butiran Murid
          </DialogTitle>
          <DialogDescription>Maklumat lengkap tentang murid</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header with Name and Status */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold break-words">{studentData.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{studentData.icNumber}</p>
            </div>
            <Badge variant={isArchived ? 'secondary' : 'default'}>
              {isArchived ? 'Diarkib' : 'Aktif'}
            </Badge>
          </div>

          {/* Student Information */}
          <div className="space-y-3">
            {/* Class */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Class</p>
                <p className="text-sm text-muted-foreground break-words">
                  {classInfo ? `Form ${classInfo.grade} - ${classInfo.name}` : 'Unknown Class'}
                </p>
              </div>
            </div>

            {/* IC Number */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Hash className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">IC Number</p>
                <p className="text-sm text-muted-foreground font-mono">{studentData.icNumber}</p>
              </div>
            </div>

            {/* Date of Birth */}
            {studentData.dob && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Tarikh Lahir</p>
                  <p className="text-sm text-muted-foreground">{studentData.dob}</p>
                </div>
              </div>
            )}

            {/* Guardian */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Guardian</p>
                <p className="text-sm text-muted-foreground break-words">
                  {studentData.guardianName}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Nombor Telefon</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {studentData.guardianContact}
                </p>
              </div>
            </div>

            {/* Address */}
            {studentData.address && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Alamat</p>
                  <p className="text-sm text-muted-foreground break-words">{studentData.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
