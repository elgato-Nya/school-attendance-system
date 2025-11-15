/**
 * DateRangeSelector Component
 * Allows user to select either a single date or date range
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';

interface DateRangeSelectorProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeSelectorProps) {
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');

  const handleDateModeChange = (value: string) => {
    const mode = value as 'single' | 'range';
    setDateMode(mode);

    // When switching to single date mode, set end date to match start date
    if (mode === 'single' && startDate) {
      onEndDateChange(startDate);
    }
  };

  const handleSingleDateChange = (date: Date | undefined) => {
    onStartDateChange(date);
    onEndDateChange(date); // Set both to same date in single mode
  };

  return (
    <div className="space-y-4">
      {/* Date Mode Selection */}
      <div className="space-y-3">
        <Label className="text-sm md:text-base">Report Period</Label>
        <RadioGroup value={dateMode} onValueChange={handleDateModeChange} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="font-normal cursor-pointer text-sm">
              Single Date
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="range" id="range" />
            <Label htmlFor="range" className="font-normal cursor-pointer text-sm">
              Date Range
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Date Picker(s) */}
      {dateMode === 'single' ? (
        <div className="space-y-2">
          <Label htmlFor="single-date" className="text-sm md:text-base">
            Select Date
          </Label>
          <DatePicker
            date={startDate}
            onDateChange={handleSingleDateChange}
            disabled={false}
            closeOnSelect={true}
          />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="range-start" className="text-sm md:text-base">
              Start Date
            </Label>
            <DatePicker
              date={startDate}
              onDateChange={onStartDateChange}
              disabled={false}
              closeOnSelect={true}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="range-end" className="text-sm md:text-base">
              End Date
            </Label>
            <DatePicker
              date={endDate}
              onDateChange={onEndDateChange}
              disabled={false}
              closeOnSelect={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
