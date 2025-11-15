/**
 * Search and Filters Component for Class Management
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  gradeFilter: string;
  onGradeFilterChange: (value: string) => void;
  availableGrades: number[];
}

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  gradeFilter,
  onGradeFilterChange,
  availableGrades,
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by class name or teacher..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          aria-label="Search classes"
        />
      </div>
      <Select value={gradeFilter} onValueChange={onGradeFilterChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Grade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Grades</SelectItem>
          {availableGrades.map((grade) => (
            <SelectItem key={grade} value={grade.toString()}>
              Form {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
