/**
 * Archive Class Dialog Component
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { Class } from '@/types';
import { Archive } from 'lucide-react';

interface ArchiveClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: Class | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const ARCHIVE_REASONS = [
  { value: 'End of Academic Year', label: 'Akhir Tahun Akademik' },
  { value: 'Class Restructuring', label: 'Penstrukturan Semula Kelas' },
  { value: 'Low Enrollment', label: 'Pendaftaran Rendah' },
  { value: 'Other', label: 'Lain-lain (nyatakan di bawah)' },
] as const;

export function ArchiveClassDialog({
  open,
  onOpenChange,
  classData,
  onConfirm,
  onCancel,
}: ArchiveClassDialogProps) {
  const [reason, setReason] = useState<string>('End of Academic Year');
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    const finalReason = reason === 'Other' && customReason ? customReason : reason;
    onConfirm(finalReason);
    // Reset state
    setReason('End of Academic Year');
    setCustomReason('');
  };

  const handleCancel = () => {
    onCancel();
    // Reset state
    setReason('End of Academic Year');
    setCustomReason('');
  };

  if (!classData) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-orange-500" />
            Arkib Kelas
          </AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan mengarkibkan <strong>{classData.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sebab pengarkiban:</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {ARCHIVE_REASONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {reason === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="customReason" className="text-sm font-medium">
                Sila nyatakan:
              </Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Masukkan sebab pengarkiban..."
                className="min-h-20"
              />
            </div>
          )}

          <div className="rounded-lg bg-muted p-3 space-y-1">
            <p className="text-sm font-medium">Apa yang berlaku apabila anda mengarkib?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Kelas akan disembunyikan daripada senarai aktif</li>
              <li>Semua rekod kehadiran akan dipelihara</li>
              <li>Murid kekal dalam sistem</li>
              <li>Boleh dipulihkan pada bila-bila masa dari tab Arkib</li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={reason === 'Other' && !customReason.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Arkib Kelas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
