/**
 * useReportState Hook
 * Custom hook to manage report state and logic
 */

import { useState, useEffect } from 'react';
import { getAllClasses } from '@/services/class/class.service';
import type { Class, Student } from '@/types';
import {
  generateDailyReport,
  generateClassReport,
  generateStudentReport,
  generateCumulativeReport,
  type ReportData,
} from '@/hooks/useReportGeneration';

export function useReportState() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Report filters
  const [reportType, setReportType] = useState<'daily' | 'class' | 'student' | 'cumulative'>(
    'daily'
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentIC, setSelectedStudentIC] = useState<string>('');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass);
    } else {
      setStudents([]);
      setSelectedStudentIC('');
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error('Load classes error:', error);
    }
  };

  const loadStudents = async (classId: string) => {
    try {
      const classData = classes.find((c) => c.id === classId);
      if (classData && classData.students) {
        setStudents(classData.students);
      } else {
        const { getClassById } = await import('@/services/class/class.service');
        const freshClass = await getClassById(classId);
        if (freshClass && freshClass.students) {
          setStudents(freshClass.students);
        } else {
          setStudents([]);
        }
      }
    } catch (error) {
      console.error('Load students error:', error);
      setStudents([]);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      let data: ReportData | null = null;

      switch (reportType) {
        case 'daily':
          if (selectedDate) {
            data = await generateDailyReport(selectedDate);
          }
          break;

        case 'class':
          if (selectedClass && startDate && endDate) {
            data = await generateClassReport(selectedClass, startDate, endDate, classes);
          }
          break;

        case 'student':
          if (selectedClass && selectedStudentIC && startDate && endDate) {
            data = await generateStudentReport(
              selectedClass,
              selectedStudentIC,
              startDate,
              endDate,
              students
            );
          }
          break;

        case 'cumulative':
          if (startDate && endDate) {
            data = await generateCumulativeReport(startDate, endDate);
          }
          break;
      }

      setReportData(data);
    } catch (error) {
      console.error('Generate report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isGenerateDisabled = () => {
    switch (reportType) {
      case 'daily':
        return !selectedDate;
      case 'class':
        return !selectedClass || !startDate || !endDate;
      case 'student':
        return !selectedClass || !selectedStudentIC || !startDate || !endDate;
      case 'cumulative':
        return !startDate || !endDate;
      default:
        return true;
    }
  };

  const handleReportTypeChange = (value: string) => {
    setReportType(value as typeof reportType);
    setReportData(null);
  };

  return {
    // State
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

    // Setters
    setSelectedDate,
    setStartDate,
    setEndDate,
    setSelectedClass,
    setSelectedStudentIC,

    // Methods
    handleGenerateReport,
    isGenerateDisabled,
    handleReportTypeChange,
  };
}
