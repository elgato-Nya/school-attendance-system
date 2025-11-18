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
    <div className="flex flex-col gap-3">
      {/* Search bar - full width on mobile */}
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search by name or IC number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search students by name or IC number"
        />
      </div>

      {/* Filter dropdowns - stack on mobile, row on desktop */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter students by grade">
              <SelectValue placeholder="Filter by grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {availableGrades.map((grade) => (
                <SelectItem key={grade} value={String(grade)}>
                  Form {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter students by class">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
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
