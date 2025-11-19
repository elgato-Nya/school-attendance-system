/**
 * HolidayList Component
 * Grid display of holiday cards or empty state
 */

import { HolidayCard } from './HolidayCard';
import { EmptyState } from './EmptyState';
import { Calendar } from 'lucide-react';
import type { Holiday } from '@/types';

interface HolidayListProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
  onDelete: (holidayId: string) => void;
  onAddNew: () => void;
}

export function HolidayList({ holidays, onEdit, onDelete, onAddNew }: HolidayListProps) {
  if (holidays.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Tiada cuti dijumpai"
        description="Tambah cuti secara manual atau import cuti Malaysia 2025"
        actionLabel="Tambah Cuti"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {holidays.map((holiday) => (
        <HolidayCard key={holiday.id} holiday={holiday} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
