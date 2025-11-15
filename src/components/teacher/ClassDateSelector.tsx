import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Class } from '@/types';

interface ClassDateSelectorProps {
  classes: Class[];
  selectedClassId: string;
  selectedDate: string;
  onClassChange: (classId: string) => void;
  onDateChange: (date: string) => void;
  isLoading: boolean;
}

export function ClassDateSelector({
  classes,
  selectedClassId,
  selectedDate,
  onClassChange,
  onDateChange,
  isLoading,
}: ClassDateSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="class-select">Select Class</Label>
        <Select value={selectedClassId} onValueChange={onClassChange} disabled={isLoading}>
          <SelectTrigger id="class-select">
            <SelectValue placeholder="Choose a class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-select">Select Date</Label>
        <Input
          id="date-select"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
