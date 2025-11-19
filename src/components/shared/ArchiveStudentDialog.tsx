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
          <AlertDialogTitle>Arkib Murid</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Anda akan mengarkib <strong>{studentName}</strong>.
              </p>

              <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                <p className="font-semibold">Apa yang berlaku apabila anda mengarkib:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Murid dikeluarkan daripada senarai kelas</li>
                  <li>Sejarah kehadiran lengkap dipelihara</li>
                  <li>Boleh dipulihkan oleh admin jika diperlukan</li>
                  <li>Statistik kehadiran kekal tepat</li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-foreground">
                    Sebab mengarkib <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={reason}
                    onValueChange={(value) => setReason(value as ArchiveReason)}
                  >
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Pilih sebab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transferred">Berpindah ke sekolah lain</SelectItem>
                      <SelectItem value="Graduated">Tamat Pengajian</SelectItem>
                      <SelectItem value="Withdrawn">Berhenti Sekolah</SelectItem>
                      <SelectItem value="Other">Lain-lain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonDetails" className="text-foreground">
                    Butiran tambahan{' '}
                    {reason === 'Other' && <span className="text-destructive">*</span>}
                  </Label>
                  <Textarea
                    id="reasonDetails"
                    placeholder={
                      reason === 'Other'
                        ? 'Sila berikan butiran...'
                        : 'Pilihan: Tambah sebarang catatan tambahan...'
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
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting || !reason || (reason === 'Other' && !reasonDetails.trim())}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            {isSubmitting ? 'Mengarkib...' : 'Arkib Murid'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
