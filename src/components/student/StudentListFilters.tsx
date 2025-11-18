import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Clock, Calendar as CalendarIcon } from 'lucide-react';
import type { Class } from '@/types';

type ViewMode = 'single' | 'range';
type SortOption = 'name' | 'attendance' | 'attendanceLowToHigh';

interface StudentListFiltersProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  singleDate: Date | undefined;
  onSingleDateChange: (date: Date | undefined) => void;
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedGrade: string;
  onSelectedGradeChange: (grade: string) => void;
  selectedClass: string;
  onSelectedClassChange: (classId: string) => void;
  sortBy: SortOption;
  onSortByChange: (sort: SortOption) => void;
  showLateOnly: boolean;
  onShowLateOnlyChange: (show: boolean) => void;
  classes: Class[];
  filteredClasses: Class[];
  uniqueGrades: number[];
}

export default function StudentListFilters({
  viewMode,
  onViewModeChange,
  singleDate,
  onSingleDateChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  searchQuery,
  onSearchQueryChange,
  selectedGrade,
  onSelectedGradeChange,
  selectedClass,
  onSelectedClassChange,
  sortBy,
  onSortByChange,
  showLateOnly,
  onShowLateOnlyChange,
  filteredClasses,
  uniqueGrades,
}: StudentListFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
        <CardDescription>Search and filter students</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* View Mode */}
          <div className="space-y-2">
            <Label htmlFor="view-mode" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date Range
            </Label>
            <Select value={viewMode} onValueChange={(value: ViewMode) => onViewModeChange(value)}>
              <SelectTrigger id="view-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Day</SelectItem>
                <SelectItem value="range">Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Single Date */}
          {viewMode === 'single' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="single-date">Select Date</Label>
                <DatePicker
                  date={singleDate}
                  onDateChange={onSingleDateChange}
                  placeholder="Pick a date"
                  closeOnSelect={true}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="student-search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="student-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="Search by name or IC..."
                    className="pl-9"
                    aria-label="Search students by name or IC number"
                  />
                </div>
              </div>
            </>
          )}

          {/* Date Range */}
          {viewMode === 'range' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <DatePicker
                  date={startDate}
                  onDateChange={onStartDateChange}
                  placeholder="Pick start date"
                  closeOnSelect={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <DatePicker
                  date={endDate}
                  onDateChange={onEndDateChange}
                  placeholder="Pick end date"
                  closeOnSelect={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="student-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="Search by name or IC..."
                    className="pl-9"
                    aria-label="Search students by name or IC number"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Row 2: Class and Sort Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Grade Filter */}
          <div className="space-y-2">
            <Label htmlFor="grade-filter">Filter by Grade</Label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Select
                value={selectedGrade}
                onValueChange={(value) => {
                  onSelectedGradeChange(value);
                  if (value !== 'all') onSelectedClassChange('all'); // Reset class filter
                }}
              >
                <SelectTrigger
                  id="grade-filter"
                  className="pl-9"
                  aria-label="Filter students by grade"
                >
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {uniqueGrades.map((grade) => (
                    <SelectItem key={grade} value={String(grade)}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class Filter */}
          <div className="space-y-2">
            <Label htmlFor="class-filter">Filter by Class</Label>
            <Select value={selectedClass} onValueChange={onSelectedClassChange}>
              <SelectTrigger id="class-filter" aria-label="Filter students by class">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {selectedGrade === 'all' ? 'All Classes' : `All Grade ${selectedGrade} Classes`}
                </SelectItem>
                {filteredClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGrade !== 'all' && filteredClasses.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Showing {filteredClasses.length} class(es) in Grade {selectedGrade}
              </p>
            )}
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label htmlFor="sort-by">Sort By</Label>
            <Select value={sortBy} onValueChange={(value: SortOption) => onSortByChange(value)}>
              <SelectTrigger id="sort-by" aria-label="Sort students">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="attendance">Attendance Rate (High to Low)</SelectItem>
                <SelectItem value="attendanceLowToHigh">Attendance Rate (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Late Filter - Only show in single day mode */}
          {viewMode === 'single' && (
            <div className="space-y-2">
              <Label htmlFor="late-filter">Show Late Only</Label>
              <Button
                id="late-filter"
                variant={showLateOnly ? 'default' : 'outline'}
                className="w-full"
                onClick={() => onShowLateOnlyChange(!showLateOnly)}
              >
                <Clock className="h-4 w-4 mr-2" />
                {showLateOnly ? 'Showing Late Only' : 'Show All'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
