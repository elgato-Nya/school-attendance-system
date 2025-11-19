/**
 * Student Statistics Component
 * Displays student count statistics
 */

import { Users, Archive, Search, BookOpen } from 'lucide-react';

interface StudentStatsProps {
  totalActive: number;
  totalArchived: number;
  filteredCount: number;
  classCount: number;
}

export function StudentStats({
  totalActive,
  totalArchived,
  filteredCount,
  classCount,
}: StudentStatsProps) {
  const stats = [
    {
      label: 'Murid Aktif',
      value: totalActive,
      icon: Users,
      ariaLabel: `${totalActive} murid aktif`,
    },
    {
      label: 'Diarkibkan',
      value: totalArchived,
      icon: Archive,
      ariaLabel: `${totalArchived} murid diarkibkan`,
    },
    {
      label: 'Hasil Ditapis',
      value: filteredCount,
      icon: Search,
      ariaLabel: `${filteredCount} murid sepadan dengan tapisan semasa`,
    },
    {
      label: 'Jumlah Kelas',
      value: classCount,
      icon: BookOpen,
      ariaLabel: `${classCount} kelas dalam sistem`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border bg-card p-4"
            role="group"
            aria-label={stat.ariaLabel}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
