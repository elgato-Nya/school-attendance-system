/**
 * Reports Page - Generate various attendance reports
 * Phase 4: Comprehensive reporting system (Refactored)
 */

import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { ReportTabContent } from '@/components/reports/ReportTabContent';
import { ReportResultsCard } from '@/components/reports/ReportResultsCard';
import { useReportState } from '@/hooks/useReportState';

export default function ReportsPage() {
  const {
    classes,
    students,
    loading,
    reportData,
    reportType,
    selectedDate,
    startDate,
    endDate,
    selectedClass,
    selectedStudentIC,
    setSelectedDate,
    setStartDate,
    setEndDate,
    setSelectedClass,
    setSelectedStudentIC,
    handleGenerateReport,
    isGenerateDisabled,
    handleReportTypeChange,
  } = useReportState();

  return (
    <div className="space-y-4 md:space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 md:h-8 md:w-8" aria-hidden="true" />
            Attendance Reports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Generate comprehensive attendance reports with various filters
          </p>
        </div>
      </div>

      <Separator />

      {/* Report Type Tabs - Mobile Optimized */}
      <Tabs value={reportType} onValueChange={handleReportTypeChange}>
        {/* Mobile: Dropdown Select for Report Type */}
        <div className="block sm:hidden mb-4" role="navigation" aria-label="Report type selection">
          <Select value={reportType} onValueChange={handleReportTypeChange}>
            <SelectTrigger aria-label="Select report type">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Report</SelectItem>
              <SelectItem value="class">Class Report</SelectItem>
              <SelectItem value="student">Student Report</SelectItem>
              <SelectItem value="cumulative">Cumulative Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tab List */}
        <TabsList
          className="hidden sm:grid w-full grid-cols-2 lg:grid-cols-4"
          role="tablist"
          aria-label="Report types"
        >
          <TabsTrigger value="daily">Daily Report</TabsTrigger>
          <TabsTrigger value="class">Class Report</TabsTrigger>
          <TabsTrigger value="student">Student Report</TabsTrigger>
          <TabsTrigger value="cumulative">Cumulative Report</TabsTrigger>
        </TabsList>

        {/* Daily Report Tab */}
        <TabsContent
          value="daily"
          className="space-y-4 md:space-y-6"
          role="tabpanel"
          aria-labelledby="daily-report-tab"
        >
          <ReportTabContent
            title="Daily Attendance Report"
            description="View attendance summary for all classes on a specific date"
            reportType="daily"
            sheetTitle="Daily Report Filters"
            sheetDescription="Select date to generate the report"
            selectedDate={selectedDate}
            startDate={startDate}
            endDate={endDate}
            selectedClass={selectedClass}
            selectedStudentIC={selectedStudentIC}
            classes={classes}
            students={students}
            onDateChange={setSelectedDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClassChange={setSelectedClass}
            onStudentICChange={setSelectedStudentIC}
            onGenerateReport={handleGenerateReport}
            loading={loading}
            disabled={isGenerateDisabled()}
          />
        </TabsContent>

        {/* Class Report Tab */}
        <TabsContent
          value="class"
          className="space-y-4 md:space-y-6"
          role="tabpanel"
          aria-labelledby="class-report-tab"
        >
          <ReportTabContent
            title="Class Attendance Report"
            description="View attendance history for a specific class over a date range"
            reportType="class"
            sheetTitle="Class Report Filters"
            sheetDescription="Select class and date range"
            selectedDate={selectedDate}
            startDate={startDate}
            endDate={endDate}
            selectedClass={selectedClass}
            selectedStudentIC={selectedStudentIC}
            classes={classes}
            students={students}
            onDateChange={setSelectedDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClassChange={setSelectedClass}
            onStudentICChange={setSelectedStudentIC}
            onGenerateReport={handleGenerateReport}
            loading={loading}
            disabled={isGenerateDisabled()}
          />
        </TabsContent>

        {/* Student Report Tab */}
        <TabsContent
          value="student"
          className="space-y-4 md:space-y-6"
          role="tabpanel"
          aria-labelledby="student-report-tab"
        >
          <ReportTabContent
            title="Individual Student Report"
            description="View attendance history for a specific student over a date range"
            reportType="student"
            sheetTitle="Student Report Filters"
            sheetDescription="Select student and date range"
            selectedDate={selectedDate}
            startDate={startDate}
            endDate={endDate}
            selectedClass={selectedClass}
            selectedStudentIC={selectedStudentIC}
            classes={classes}
            students={students}
            onDateChange={setSelectedDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClassChange={setSelectedClass}
            onStudentICChange={setSelectedStudentIC}
            onGenerateReport={handleGenerateReport}
            loading={loading}
            disabled={isGenerateDisabled()}
          />
        </TabsContent>

        {/* Cumulative Report Tab */}
        <TabsContent
          value="cumulative"
          className="space-y-4 md:space-y-6"
          role="tabpanel"
          aria-labelledby="cumulative-report-tab"
        >
          <ReportTabContent
            title="Cumulative School Report"
            description="View overall attendance statistics for the entire school over a date range"
            reportType="cumulative"
            sheetTitle="Cumulative Report Filters"
            sheetDescription="Select date range for school-wide report"
            selectedDate={selectedDate}
            startDate={startDate}
            endDate={endDate}
            selectedClass={selectedClass}
            selectedStudentIC={selectedStudentIC}
            classes={classes}
            students={students}
            onDateChange={setSelectedDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClassChange={setSelectedClass}
            onStudentICChange={setSelectedStudentIC}
            onGenerateReport={handleGenerateReport}
            loading={loading}
            disabled={isGenerateDisabled()}
          />
        </TabsContent>
      </Tabs>

      {/* Report Results */}
      {reportData && (
        <section aria-labelledby="report-results-title">
          <h2 id="report-results-title" className="sr-only">
            Report Results
          </h2>
          <ReportResultsCard reportData={reportData} />
        </section>
      )}
    </div>
  );
}
