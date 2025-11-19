/**
 * Edit Reason Dialog Component
 * Modal for requiring justification when editing attendance
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { EDIT_REASONS_PRESETS, EDIT_REASON_MIN_LENGTH } from '@/constants/attendance';
import { validateEditReason } from '@/utils/attendance/validation';

interface EditReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  className?: string;
  date?: string;
  loading?: boolean;
}

export function EditReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  className,
  date,
  loading = false,
}: EditReasonDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== 'Other (specify below)') {
      setCustomReason('');
    }
    setError('');
  };

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value);
    setError('');
  };

  const handleConfirm = () => {
    const finalReason = selectedPreset === 'Other (specify below)' ? customReason : selectedPreset;

    const validation = validateEditReason(finalReason);

    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    onConfirm(finalReason);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPreset('');
    setCustomReason('');
    setError('');
    onOpenChange(false);
  };

  const isOtherSelected = selectedPreset === 'Other (specify below)';
  const showCustomInput = isOtherSelected;
  const characterCount = customReason.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Sunting Rekod Kehadiran</DialogTitle>
          <DialogDescription>
            {className && date && (
              <span className="block mt-1">
                {className} - {date}
              </span>
            )}
            Sila berikan sebab untuk menyunting rekod kehadiran ini. Ini akan dilog untuk tujuan
            audit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preset Reasons */}
          <div className="space-y-2">
            <Label htmlFor="preset-reason">Sebab Penyuntingan *</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger id="preset-reason">
                <SelectValue placeholder="Pilih sebab..." />
              </SelectTrigger>
              <SelectContent>
                {EDIT_REASONS_PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason Input */}
          {showCustomInput && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Sila nyatakan sebab *</Label>
              <Textarea
                id="custom-reason"
                placeholder="Masukkan sebab terperinci untuk menyunting kehadiran..."
                value={customReason}
                onChange={(e) => handleCustomReasonChange(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Minimum {EDIT_REASON_MIN_LENGTH} aksara diperlukan</span>
                <span>{characterCount}/500</span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Audit Trail:</strong> This edit will be permanently logged with your name,
              timestamp, and the reason provided. The original attendance data will be preserved for
              reference.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!selectedPreset || loading}>
            {loading ? 'Saving...' : 'Confirm Edit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
