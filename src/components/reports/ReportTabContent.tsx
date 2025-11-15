/**
 * ReportTabContent Component
 * Reusable component for each report type tab with mobile/desktop filters
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import type { Class, Student } from '@/types';

interface ReportTabContentProps {
  title: string;
  description: string;
  reportType: 'daily' | 'class' | 'student' | 'cumulative';
  sheetTitle: string;
  sheetDescription: string;

  // Filter state
  selectedDate?: Date;
  startDate?: Date;
  endDate?: Date;
  selectedClass: string;
  selectedStudentIC: string;
  classes: Class[];
  students: Student[];

  // Handlers
  onDateChange: (date: Date | undefined) => void;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onClassChange: (classId: string) => void;
  onStudentICChange: (icNumber: string) => void;
  onGenerateReport: () => void;

  // State
  loading: boolean;
  disabled: boolean;
}

export function ReportTabContent({
  title,
  description,
  reportType,
  sheetTitle,
  sheetDescription,
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
  onGenerateReport,
  loading,
  disabled,
}: ReportTabContentProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleGenerateFromSheet = () => {
    onGenerateReport();
    setSheetOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mobile: Sheet for Filters */}
        <div className="block md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filter & Generate
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] flex flex-col">
              <SheetHeader>
                <SheetTitle>{sheetTitle}</SheetTitle>
                <SheetDescription>{sheetDescription}</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-6">
                <ReportFilters
                  reportType={reportType}
                  selectedDate={selectedDate}
                  onDateChange={onDateChange}
                  startDate={startDate}
                  endDate={endDate}
                  selectedClass={selectedClass}
                  selectedStudentIC={selectedStudentIC}
                  classes={classes}
                  students={students}
                  onStartDateChange={onStartDateChange}
                  onEndDateChange={onEndDateChange}
                  onClassChange={onClassChange}
                  onStudentICChange={onStudentICChange}
                />
              </div>
              <SheetFooter className="pt-4 border-t">
                <Button
                  onClick={handleGenerateFromSheet}
                  disabled={disabled || loading}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop: Inline Filters */}
        <div className="hidden md:block space-y-4">
          <ReportFilters
            reportType={reportType}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            startDate={startDate}
            endDate={endDate}
            selectedClass={selectedClass}
            selectedStudentIC={selectedStudentIC}
            classes={classes}
            students={students}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            onClassChange={onClassChange}
            onStudentICChange={onStudentICChange}
          />
          <Button onClick={onGenerateReport} disabled={disabled || loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
