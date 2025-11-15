import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Filter, Search } from 'lucide-react';
import type { Class } from '@/types';

interface AttendanceFiltersProps {
  classes: Class[];
  selectedClass: string;
  onClassChange: (classId: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AttendanceFilters({
  classes,
  selectedClass,
  onClassChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  searchQuery,
  onSearchChange,
}: AttendanceFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" aria-hidden="true" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class-select" className="flex items-center gap-2">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Select Class
            </Label>
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger
                id="class-select"
                className="w-full"
                aria-label="Select class to view attendance history"
              >
                <SelectValue placeholder="-- Select a Class --" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    Grade {cls.grade} - {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Start Date
            </Label>
            <DatePicker
              date={startDate ? new Date(startDate) : undefined}
              onDateChange={(date) => {
                if (date) {
                  onStartDateChange(date.toISOString().split('T')[0]);
                } else {
                  onStartDateChange('');
                }
              }}
              placeholder="Select start date"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="end-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              End Date
            </Label>
            <DatePicker
              date={endDate ? new Date(endDate) : undefined}
              onDateChange={(date) => {
                if (date) {
                  onEndDateChange(date.toISOString().split('T')[0]);
                } else {
                  onEndDateChange('');
                }
              }}
              placeholder="Select end date"
            />
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </Label>
            <Input
              type="search"
              id="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search records..."
              aria-label="Search attendance records"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
