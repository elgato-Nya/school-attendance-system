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
import { DatePicker } from '@/components/ui/date-picker';
import { Users } from 'lucide-react';
import type { Class } from '@/types';

type ViewMode = 'all' | 'range' | 'single';

interface AttendanceHistoryFiltersProps {
  // Grade and Class
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedClass: string;
  setSelectedClass: (classId: string) => void;
  classes: Class[];

  // View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Dates
  singleDate?: Date;
  setSingleDate: (date: Date | undefined) => void;
  startDate?: Date;
  setStartDate: (date: Date | undefined) => void;
  endDate?: Date;
  setEndDate: (date: Date | undefined) => void;

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
  viewMode,
  setViewMode,
  singleDate,
  setSingleDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  searchQuery,
  setSearchQuery,
}: AttendanceHistoryFiltersProps) {
  const uniqueGrades = Array.from(new Set(classes.map((c) => c.grade))).sort((a, b) => a - b);

  const filteredClasses =
    selectedGrade === 'all' ? classes : classes.filter((c) => c.grade.toString() === selectedGrade);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Row 1: Grade, Class, View Mode */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="grade-filter">Grade / Form</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger id="grade-filter">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    All Grades
                  </div>
                </SelectItem>
                {uniqueGrades.map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Form {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-filter">Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-filter">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    All Classes
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

          <div className="space-y-2">
            <Label htmlFor="view-mode">View Mode</Label>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <SelectTrigger id="view-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="single">Single Day</SelectItem>
                <SelectItem value="range">Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Date Pickers (conditional) and Search */}
        <div className="grid gap-4 md:grid-cols-3">
          {viewMode === 'single' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="single-date">Select Date</Label>
                <DatePicker
                  date={singleDate}
                  onDateChange={setSingleDate}
                  placeholder="Pick a date"
                  closeOnSelect={true}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by class, date, or submitter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </>
          )}

          {viewMode === 'range' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Pick start date"
                  closeOnSelect={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <DatePicker
                  date={endDate}
                  onDateChange={setEndDate}
                  placeholder="Pick end date"
                  closeOnSelect={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by class, date, or submitter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </>
          )}

          {viewMode === 'all' && (
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by class, date, or submitter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
