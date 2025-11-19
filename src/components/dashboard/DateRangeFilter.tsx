/**
 * Date Range Filter Component for Dashboards
 * Clean, popup-based design with preset options
 * Calendar appears on input click, shows one date at a time
 * Mobile-friendly with collapsible calendar
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type DateRangePreset = 'today' | 'week' | 'month' | 'all' | 'custom';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface DateRangeFilterProps {
  value: DateRangePreset;
  customRange?: DateRange;
  onChange: (preset: DateRangePreset, customRange?: DateRange) => void;
}

type CalendarView = 'none' | 'from' | 'to';

export function DateRangeFilter({ value, customRange, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('none');
  const [tempFrom, setTempFrom] = useState<Date | undefined>();
  const [tempTo, setTempTo] = useState<Date | undefined>();

  const presets = [
    { value: 'today' as const, label: 'Hari Ini', description: 'Data hari ini' },
    { value: 'week' as const, label: 'Minggu Ini', description: '7 hari lepas' },
    { value: 'month' as const, label: 'Bulan Ini', description: '30 hari lepas' },
    { value: 'all' as const, label: 'Sepanjang Masa', description: 'Semua data yang tersedia' },
  ];

  const handlePresetClick = (preset: DateRangePreset) => {
    onChange(preset);
    setShowCalendar(false);
    setCalendarView('none');
    setTempFrom(undefined);
    setTempTo(undefined);
    setIsOpen(false);
  };

  const handleCustomClick = () => {
    setShowCalendar(true);
    setCalendarView('none'); // Start with inputs visible
    // Pre-fill with existing custom range if available
    if (value === 'custom' && customRange) {
      setTempFrom(customRange.from || undefined);
      setTempTo(customRange.to || undefined);
    }
  };

  const handleFromSelect = (date: Date | undefined) => {
    setTempFrom(date);
    // If selecting a new "from" date, clear "to" if it's before the new "from"
    if (date && tempTo && tempTo < date) {
      setTempTo(undefined);
    }
    setCalendarView('none'); // Close calendar after selection
  };

  const handleToSelect = (date: Date | undefined) => {
    setTempTo(date);
    setCalendarView('none'); // Close calendar after selection
  };

  const handleClearFrom = () => {
    setTempFrom(undefined);
    setTempTo(undefined); // Clear "to" as well when clearing "from"
  };

  const handleClearTo = () => {
    setTempTo(undefined);
  };

  const handleApplyCustomRange = () => {
    if (tempFrom) {
      onChange('custom', {
        from: tempFrom,
        to: tempTo || tempFrom,
      });
      setIsOpen(false);
      setShowCalendar(false);
      setCalendarView('none');
    }
  };

  const handleBackToPresets = () => {
    setShowCalendar(false);
    setCalendarView('none');
    setTempFrom(undefined);
    setTempTo(undefined);
  };

  const getDisplayText = () => {
    if (value === 'custom' && customRange?.from) {
      const fromText = format(customRange.from, 'MMM d');
      const toText = customRange.to
        ? format(customRange.to, 'MMM d, yyyy')
        : format(customRange.from, 'MMM d, yyyy');
      return `${fromText} - ${toText}`;
    }
    return presets.find((p) => p.value === value)?.label || 'Pilih Julat';
  };

  const isActiveFilter = value !== 'all';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal w-full transition-all',
            isActiveFilter && 'border-primary ring-2 ring-primary/20'
          )}
        >
          <CalendarIcon className={cn('mr-2 h-4 w-4 shrink-0', isActiveFilter && 'text-primary')} />
          <span className="truncate">{getDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" sideOffset={5}>
        {!showCalendar ? (
          // Preset Selection View
          <div className="p-3">
            <div className="text-sm font-semibold mb-3 text-foreground">Pilihan Pantas</div>
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-md transition-all',
                    value === preset.value
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div
                        className={cn(
                          'text-xs mt-0.5',
                          value === preset.value
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        )}
                      >
                        {preset.description}
                      </div>
                    </div>
                    {value === preset.value && <Check className="h-4 w-4 ml-2 shrink-0" />}
                  </div>
                </button>
              ))}
            </div>

            <Separator className="my-3" />

            <Button variant="outline" className="w-full justify-start" onClick={handleCustomClick}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Julat Tersuai
              {value === 'custom' && (
                <Badge variant="secondary" className="ml-auto">
                  Aktif
                </Badge>
              )}
            </Button>
          </div>
        ) : (
          // Custom Range View with Date Inputs
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-foreground">Julat Tersuai</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToPresets}
                className="h-7 px-2 text-xs"
              >
                Kembali
              </Button>
            </div>

            <div className="space-y-3">
              {/* From Date Input */}
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-xs font-medium">
                  Tarikh Mula
                </Label>
                <div className="relative">
                  <Input
                    id="from-date"
                    readOnly
                    value={tempFrom ? format(tempFrom, 'MMM d, yyyy') : ''}
                    placeholder="Pilih tarikh mula"
                    onClick={() => setCalendarView(calendarView === 'from' ? 'none' : 'from')}
                    className="cursor-pointer pr-8"
                  />
                  {tempFrom ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFrom();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Kosongkan tarikh mula"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  )}
                </div>
              </div>

              {/* From Date Calendar - Shows when clicked */}
              {calendarView === 'from' && (
                <Calendar
                  mode="single"
                  selected={tempFrom}
                  onSelect={handleFromSelect}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="rounded-md border"
                />
              )}

              {/* To Date Input - Only show if From is selected */}
              {tempFrom && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="to-date" className="text-xs font-medium">
                      Tarikh Akhir <span className="text-muted-foreground">(Pilihan)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="to-date"
                        readOnly
                        value={tempTo ? format(tempTo, 'MMM d, yyyy') : ''}
                        placeholder="Pilih tarikh akhir"
                        onClick={() => setCalendarView(calendarView === 'to' ? 'none' : 'to')}
                        className="cursor-pointer pr-8"
                      />
                      {tempTo ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearTo();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label="Kosongkan tarikh akhir"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      )}
                    </div>
                  </div>

                  {/* To Date Calendar - Shows when clicked */}
                  {calendarView === 'to' && (
                    <Calendar
                      mode="single"
                      selected={tempTo}
                      onSelect={handleToSelect}
                      disabled={(date) => date > new Date() || date < tempFrom}
                      className="rounded-md border"
                    />
                  )}
                </>
              )}

              {/* Apply Button - Only show if From is selected and no calendar is open */}
              {tempFrom && calendarView === 'none' && (
                <>
                  <Separator />
                  <Button onClick={handleApplyCustomRange} className="w-full" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Guna Julat
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
