/**
 * ReportFilters Component
 * Filter controls for different report types
 */

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRangeSelector } from './DateRangeSelector';
import type { Class, Student } from '@/types';

interface ReportFiltersProps {
  reportType: 'daily' | 'class' | 'student' | 'cumulative';
  selectedDate?: Date;
  startDate?: Date;
  endDate?: Date;
  selectedClass: string;
  selectedStudentIC: string;
  classes: Class[];
  students: Student[];
  onDateChange: (date: Date | undefined) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onClassChange: (classId: string) => void;
  onStudentICChange: (icNumber: string) => void;
}

export function ReportFilters({
  reportType,
  selectedDate,
  startDate,
  endDate,
  selectedClass,
  selectedStudentIC,
  classes,
  students,
  onDateChange,
  onStartDateChange,
  onEndDateChange,
  onClassChange,
  onStudentICChange,
}: ReportFiltersProps) {
  // Daily Report
  if (reportType === 'daily') {
    return (
      <div className="space-y-2">
        <Label htmlFor="daily-date" className="text-sm md:text-base">
          Select Date
        </Label>
        <DatePicker
          date={selectedDate}
          onDateChange={onDateChange}
          disabled={false}
          closeOnSelect={true}
        />
      </div>
    );
  }

  // Class Report
  if (reportType === 'class') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="class-select" className="text-sm md:text-base">
            Select Class
          </Label>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger id="class-select" className="w-full">
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} (Grade {cls.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>
    );
  }

  // Student Report
  if (reportType === 'student') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-class" className="text-sm md:text-base">
            Select Class
          </Label>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger id="student-class" className="w-full">
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} (Grade {cls.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-select" className="text-sm md:text-base">
            Select Student
          </Label>
          <Select
            value={selectedStudentIC}
            onValueChange={onStudentICChange}
            disabled={!selectedClass}
          >
            <SelectTrigger id="student-select" className="w-full">
              <SelectValue
                placeholder={selectedClass ? 'Choose a student' : 'Select a class first'}
              />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.icNumber} value={student.icNumber}>
                  {student.name} ({student.icNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>
    );
  }

  // Cumulative Report
  if (reportType === 'cumulative') {
    return (
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />
    );
  }

  return null;
}
