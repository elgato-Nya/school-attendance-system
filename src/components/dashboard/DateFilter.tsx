import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface DateFilterProps {
  value: {
    from: Date;
    to: Date;
  };
  onChange: (range: { from: Date; to: Date }) => void;
  onReset: () => void;
}

type FilterOption = 'single' | 'last7' | 'last30' | 'alltime' | 'custom';

export function DateFilter({ value, onChange, onReset }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FilterOption>('single');
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempFromDate, setTempFromDate] = useState<Date>(value.from);
  const [tempToDate, setTempToDate] = useState<Date>(value.to);
  const [customStep, setCustomStep] = useState<'from' | 'to'>('from');

  // Sync with props
  useEffect(() => {
    setTempFromDate(value.from);
    setTempToDate(value.to);
  }, [value]);

  const applyPreset = (option: FilterOption) => {
    setSelectedOption(option);

    if (option === 'last7') {
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      const from = new Date();
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      onChange({ from, to });
      setIsOpen(false);
      setShowCalendar(false);
    } else if (option === 'last30') {
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      const from = new Date();
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      onChange({ from, to });
      setIsOpen(false);
      setShowCalendar(false);
    } else if (option === 'alltime') {
      const to = new Date();
      to.setHours(23, 59, 59, 999);
      const from = new Date();
      from.setFullYear(from.getFullYear() - 2);
      from.setHours(0, 0, 0, 0);
      onChange({ from, to });
      setIsOpen(false);
      setShowCalendar(false);
    } else if (option === 'single') {
      setShowCalendar(true);
    } else if (option === 'custom') {
      setCustomStep('from');
      setShowCalendar(true);
    }
  };

  const handleSingleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setTempFromDate(newDate);
    setTempToDate(newDate);
    onChange({ from: newDate, to: newDate });
    setIsOpen(false);
    setShowCalendar(false);
  };

  const handleCustomFromSelect = (date: Date | undefined) => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setTempFromDate(newDate);

    // Auto-switch to "to" step
    setCustomStep('to');
  };

  const handleCustomToSelect = (date: Date | undefined) => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    setTempToDate(newDate);

    // Apply the range
    onChange({ from: tempFromDate, to: newDate });
    setIsOpen(false);
    setShowCalendar(false);
  };

  const handleReset = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setSelectedOption('single');
    setShowCalendar(false);
    setIsOpen(false);
    onReset();
  };

  const isDefault =
    selectedOption === 'single' &&
    format(value.from, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
    format(value.to, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getDisplayText = () => {
    const daysDiff = differenceInDays(value.to, value.from);
    const isToday = format(new Date(), 'yyyy-MM-dd') === format(value.to, 'yyyy-MM-dd');

    if (daysDiff === 0) {
      return format(value.from, 'MMM d, yyyy');
    } else if (daysDiff === 6 && isToday) {
      return '7 Hari Lepas';
    } else if (daysDiff === 29 && isToday) {
      return '30 Hari Lepas';
    } else if (daysDiff > 365) {
      return 'Sepanjang Masa';
    } else {
      return `${format(value.from, 'MMM d')} - ${format(value.to, 'MMM d, yyyy')}`;
    }
  };

  const options = [
    { value: 'single', label: 'Tarikh Tunggal', icon: CalendarIcon },
    { value: 'last7', label: '7 Hari Lepas', icon: CalendarIcon },
    { value: 'last30', label: '30 Hari Lepas', icon: CalendarIcon },
    { value: 'alltime', label: 'Sepanjang Masa', icon: CalendarIcon },
    { value: 'custom', label: 'Julat Tersuai', icon: CalendarIcon },
  ] as const;

  return (
    <div className="relative w-full sm:w-[260px]">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal w-full',
              !isDefault && 'pr-10' // Add padding for X button
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{getDisplayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start" side="bottom">
          {!showCalendar ? (
            // Options List
            <div className="p-2">
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedOption === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => applyPreset(option.value)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm',
                      'hover:bg-accent transition-colors',
                      isSelected && 'bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          ) : (
            // Calendar View
            <div className="p-3">
              {selectedOption === 'single' && (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Pilih tarikh</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalendar(false)}
                      className="h-7 text-xs"
                    >
                      Kembali
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={tempFromDate}
                    onSelect={handleSingleDateSelect}
                    initialFocus
                  />
                </>
              )}

              {selectedOption === 'custom' && customStep === 'from' && (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Pilih tarikh mula</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalendar(false)}
                      className="h-7 text-xs"
                    >
                      Kembali
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={tempFromDate}
                    onSelect={handleCustomFromSelect}
                    initialFocus
                  />
                </>
              )}

              {selectedOption === 'custom' && customStep === 'to' && (
                <>
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Pilih tarikh akhir</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCustomStep('from')}
                        className="h-7 text-xs"
                      >
                        Kembali
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dari: {format(tempFromDate, 'MMM d, yyyy')}
                    </div>
                  </div>
                  <Calendar
                    mode="single"
                    selected={tempToDate}
                    onSelect={handleCustomToSelect}
                    disabled={(date) => date < tempFromDate}
                    initialFocus
                  />
                </>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {!isDefault && (
        <button
          onClick={handleReset}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted transition-colors"
          title="Set semula ke hari ini"
          aria-label="Kosongkan penapis tarikh"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
