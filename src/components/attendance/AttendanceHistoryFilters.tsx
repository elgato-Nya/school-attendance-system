/**
 * AttendanceHistoryFilters
 * Filter controls for attendance history
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { Users } from 'lucide-react';
import type { Class } from '@/types';

interface AttendanceHistoryFiltersProps {
  // Grade and Class
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedClass: string;
  setSelectedClass: (classId: string) => void;
  classes: Class[];

  // Date Filter
  dateFilter: { from: Date; to: Date };
  onDateChange: (range: { from: Date; to: Date }) => void;
  onDateReset: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function AttendanceHistoryFilters({
  selectedGrade,
  setSelectedGrade,
  selectedClass,
  setSelectedClass,
  classes,
  dateFilter,
  onDateChange,
  onDateReset,
  searchQuery,
  setSearchQuery,
}: AttendanceHistoryFiltersProps) {
  const uniqueGrades = Array.from(new Set(classes.map((c) => c.grade))).sort((a, b) => a - b);

  const filteredClasses =
    selectedGrade === 'all' ? classes : classes.filter((c) => c.grade.toString() === selectedGrade);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Row 1: Grade, Class, Date Filter */}
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="grade-filter">Tingkatan</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger id="grade-filter">
                <SelectValue placeholder="Semua Tingkatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Semua Tingkatan
                  </div>
                </SelectItem>
                {uniqueGrades.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Tingkatan {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label htmlFor="class-filter">Kelas</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-filter">
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Semua Kelas
                  </div>
                </SelectItem>
                {filteredClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <Label>Julat Tarikh</Label>
            <DateFilter value={dateFilter} onChange={onDateChange} onReset={onDateReset} />
          </div>
        </div>

        {/* Row 2: Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Cari</Label>
          <Input
            id="search"
            type="text"
            placeholder="Cari mengikut kelas, tarikh, atau penyerah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
