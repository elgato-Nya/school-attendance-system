/**
 * Student Filters Component
 * Reusable search and filter controls for students with grade and class filters
 */

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { Class } from '@/types';

interface StudentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedGrade: string;
  onGradeChange: (value: string) => void;
  selectedClass: string;
  onClassChange: (value: string) => void;
  classes: Class[];
  showFilters?: boolean;
}

export function StudentFilters({
  searchTerm,
  onSearchChange,
  selectedGrade,
  onGradeChange,
  selectedClass,
  onClassChange,
  classes,
  showFilters = true,
}: StudentFiltersProps) {
  // Get unique grades from classes
  const availableGrades = Array.from(new Set(classes.map((c) => c.grade))).sort((a, b) => a - b);

  // Filter classes by selected grade
  const filteredClasses =
    selectedGrade === 'all' ? classes : classes.filter((c) => c.grade === Number(selectedGrade));

  return (
    <div className="flex flex-row gap-3 bg-accent">
      {/* Search bar - full width on mobile */}
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Cari mengikut nama atau nombor IC..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Cari murid mengikut nama atau nombor IC"
        />
      </div>

      {/* Filter dropdowns - stack on mobile, row on desktop */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger
              className="w-full sm:w-[180px]"
              aria-label="Tapis murid mengikut tingkatan"
            >
              <SelectValue placeholder="Tapis mengikut tingkatan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkatan</SelectItem>
              {availableGrades.map((grade) => (
                <SelectItem key={grade} value={String(grade)}>
                  Tingkatan {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Tapis murid mengikut kelas">
              <SelectValue placeholder="Tapis mengikut kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {filteredClasses.map((classData) => (
                <SelectItem key={classData.id} value={classData.id}>
                  {classData.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
