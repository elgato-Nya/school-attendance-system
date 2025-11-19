/**
 * Admin Remove Student Dialog
 * Allows admin to either archive (soft delete) or permanently delete students
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Archive, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ArchiveReason = 'Transferred' | 'Graduated' | 'Withdrawn' | 'Other';
type RemovalAction = 'archive' | 'delete';

interface AdminRemoveStudentDialogProps {
  open: boolean;
  studentName: string;
  onArchive: (reason: ArchiveReason, reasonDetails: string) => Promise<void>;
  onPermanentDelete: () => Promise<void>;
  onCancel: () => void;
}

export function AdminRemoveStudentDialog({
  open,
  studentName,
  onArchive,
  onPermanentDelete,
  onCancel,
}: AdminRemoveStudentDialogProps) {
  const [action, setAction] = useState<RemovalAction>('archive');
  const [reason, setReason] = useState<ArchiveReason>('Other');
  const [reasonDetails, setReasonDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (action === 'archive') {
        if (!reason || (reason === 'Other' && !reasonDetails.trim())) {
          return;
        }
        await onArchive(reason, reasonDetails);
      } else {
        await onPermanentDelete();
      }
      // Reset form
      setAction('archive');
      setReason('Other');
      setReasonDetails('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setAction('archive');
    setReason('Other');
    setReasonDetails('');
    onCancel();
  };

  const isFormValid =
    action === 'delete' || (reason && (reason !== 'Other' || reasonDetails.trim()));

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buang Murid</DialogTitle>
          <DialogDescription>
            Pilih cara untuk membuang <strong>{studentName}</strong> daripada sistem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Action Selection */}
          <RadioGroup value={action} onValueChange={(value) => setAction(value as RemovalAction)}>
            <div className="space-y-2">
              {/* Archive Option */}
              <label
                htmlFor="archive"
                className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  action === 'archive'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="archive" id="archive" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-sm">Arkib (Disyorkan)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Memelihara semua data. Boleh dipulihkan bila-bila masa.
                  </p>
                </div>
              </label>

              {/* Permanent Delete Option */}
              <label
                htmlFor="delete"
                className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  action === 'delete'
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="delete" id="delete" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="font-semibold text-sm">Padam Kekal</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tidak boleh dibatalkan. Semua data akan hilang.
                  </p>
                </div>
              </label>
            </div>
          </RadioGroup>

          {/* Archive Reason Form (only shown when archiving) */}
          {action === 'archive' && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="archive-reason" className="text-sm">
                  Sebab <span className="text-destructive">*</span>
                </Label>
                <Select value={reason} onValueChange={(value) => setReason(value as ArchiveReason)}>
                  <SelectTrigger id="archive-reason">
                    <SelectValue placeholder="Pilih sebab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transferred">Berpindah</SelectItem>
                    <SelectItem value="Graduated">Tamat Pengajian</SelectItem>
                    <SelectItem value="Withdrawn">Berhenti Sekolah</SelectItem>
                    <SelectItem value="Other">Lain-lain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="archive-details" className="text-sm">
                  Butiran {reason === 'Other' && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                  id="archive-details"
                  placeholder={reason === 'Other' ? 'Diperlukan...' : 'Catatan pilihan...'}
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !isFormValid}
            variant={action === 'delete' ? 'destructive' : 'default'}
            className={action === 'archive' ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {isSubmitting
              ? action === 'archive'
                ? 'Mengarkib...'
                : 'Memadam...'
              : action === 'archive'
                ? 'Arkib'
                : 'Padam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
