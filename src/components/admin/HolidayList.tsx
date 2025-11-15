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
        title="No holidays found"
        description="Add holidays manually or import Malaysia 2025 holidays"
        actionLabel="Add Holiday"
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
