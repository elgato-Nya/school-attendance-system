/**
 * Archive Student Dialog Component
 * Used by both teachers and admins to archive students with reason
 */

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type ArchiveReason = 'Transferred' | 'Graduated' | 'Withdrawn' | 'Other';

interface ArchiveStudentDialogProps {
  open: boolean;
  studentName: string;
  onConfirm: (reason: ArchiveReason, reasonDetails: string) => Promise<void>;
  onCancel: () => void;
}

export function ArchiveStudentDialog({
  open,
  studentName,
  onConfirm,
  onCancel,
}: ArchiveStudentDialogProps) {
  const [reason, setReason] = useState<ArchiveReason>('Other');
  const [reasonDetails, setReasonDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    try {
      await onConfirm(reason, reasonDetails);
      // Reset form
      setReason('Other');
      setReasonDetails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setReason('Other');
    setReasonDetails('');
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Student</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                You are about to archive <strong>{studentName}</strong>.
              </p>

              <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                <p className="font-semibold">What happens when you archive:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Student removed from class roster</li>
                  <li>Complete attendance history preserved</li>
                  <li>Can be restored by admin if needed</li>
                  <li>Attendance statistics remain accurate</li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-foreground">
                    Reason for archiving <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={reason}
                    onValueChange={(value) => setReason(value as ArchiveReason)}
                  >
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transferred">Transferred to another school</SelectItem>
                      <SelectItem value="Graduated">Graduated</SelectItem>
                      <SelectItem value="Withdrawn">Withdrawn from school</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonDetails" className="text-foreground">
                    Additional details{' '}
                    {reason === 'Other' && <span className="text-destructive">*</span>}
                  </Label>
                  <Textarea
                    id="reasonDetails"
                    placeholder={
                      reason === 'Other'
                        ? 'Please provide details...'
                        : 'Optional: Add any additional notes...'
                    }
                    value={reasonDetails}
                    onChange={(e) => setReasonDetails(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting || !reason || (reason === 'Other' && !reasonDetails.trim())}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            {isSubmitting ? 'Archiving...' : 'Archive Student'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
