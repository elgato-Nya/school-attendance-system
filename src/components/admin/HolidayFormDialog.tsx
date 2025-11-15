import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Checkbox } from '@/components/ui/checkbox';
import type { HolidayFormData } from '@/types';

interface HolidayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: HolidayFormData;
  formErrors: Record<string, string>;
  isEditing: boolean;
  onSubmit: () => void;
  onChange: (data: HolidayFormData) => void;
  onReset?: () => void;
}

export function HolidayFormDialog({
  open,
  onOpenChange,
  formData,
  formErrors,
  isEditing,
  onSubmit,
  onChange,
}: HolidayFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md sm:max-w-[520px]"
        aria-describedby="holiday-form-desc"
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
          <p id="holiday-form-desc" className="text-sm text-muted-foreground">
            Fill holiday date, name and type. You can mark it recurring if it repeats annually.
          </p>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="grid gap-4 py-2"
        >
          <div className="grid gap-2">
            <Label htmlFor="holiday-date">Date *</Label>
            <Input
              id="holiday-date"
              type="date"
              value={formData.date}
              onChange={(e) => onChange({ ...formData, date: e.target.value })}
              aria-invalid={!!formErrors.date}
              aria-describedby={formErrors.date ? 'holiday-date-error' : undefined}
            />
            {formErrors.date && (
              <p id="holiday-date-error" className="text-sm text-destructive">
                {formErrors.date}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="holiday-name">Name *</Label>
            <Input
              id="holiday-name"
              placeholder="e.g., Hari Raya Aidilfitri"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              aria-invalid={!!formErrors.name}
              aria-describedby={formErrors.name ? 'holiday-name-error' : undefined}
            />
            {formErrors.name && (
              <p id="holiday-name-error" className="text-sm text-destructive">
                {formErrors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="holiday-type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'public' | 'school' | 'event') =>
                onChange({ ...formData, type: value })
              }
            >
              <SelectTrigger id="holiday-type" aria-invalid={!!formErrors.type}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public Holiday</SelectItem>
                <SelectItem value="school">School Holiday</SelectItem>
                <SelectItem value="event">School Event</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.type && <p className="text-sm text-destructive">{formErrors.type}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                onChange({ ...formData, isRecurring: checked as boolean })
              }
              aria-label="Recurring annually"
            />
            <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
              Recurring annually (e.g., Merdeka Day)
            </Label>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? 'Update Holiday' : 'Add Holiday'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default HolidayFormDialog;
