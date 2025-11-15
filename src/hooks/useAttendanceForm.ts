/**
 * Custom hook for managing attendance form state and logic
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isFuture, differenceInDays } from 'date-fns';
import { getClassById } from '@/services/class/class.service';
import {
  getAttendanceByClassAndDate,
  submitAttendance,
  updateAttendance,
} from '@/services/attendance.service';
import { getHolidayByDate } from '@/services/holiday.service';
import { toast } from '@/utils/toast';
import { LATE_THRESHOLD } from '@/constants/attendance';
import type { Class, AttendanceRecord } from '@/types';

interface UseAttendanceFormProps {
  classId: string;
  userId: string;
  userName: string;
}

export function useAttendanceForm({ classId, userId, userName }: UseAttendanceFormProps) {
  const navigate = useNavigate();

  // State
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isHolidayDate, setIsHolidayDate] = useState(false);
  const [holidayName, setHolidayName] = useState<string>('');
  const [existingSubmission, setExistingSubmission] = useState(false);
  const [lateReason, setLateReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Load class data
  useEffect(() => {
    if (classId) {
      loadClass();
    }
  }, [classId, selectedDate]);

  // Validate date
  useEffect(() => {
    if (selectedDate) {
      checkDateValidation();
    }
  }, [selectedDate, classId]);

  const loadClass = async () => {
    if (!classId) return;

    setLoading(true);
    try {
      const data = await getClassById(classId);
      if (!data) {
        throw new Error('Class not found');
      }
      setClassData(data);

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const existingAttendance = await getAttendanceByClassAndDate(classId, dateStr);

      if (existingAttendance) {
        setRecords(existingAttendance.records);
        setExistingSubmission(true);
      } else {
        const initialRecords: AttendanceRecord[] = data.students.map((student) => ({
          icNumber: student.icNumber,
          studentName: student.name,
          status: 'present',
          remarks: '',
        }));
        setRecords(initialRecords);
        setExistingSubmission(false);
      }
    } catch (error) {
      console.error('Load class error:', error);
      toast.error('Failed to load class data');
      navigate('/teacher/classes');
    } finally {
      setLoading(false);
    }
  };

  const checkDateValidation = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (isFuture(selectedDate)) {
      toast.error('Cannot submit attendance for future dates');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const daysDiff = differenceInDays(today, selected);

    setShowReasonField(daysDiff > 0);

    try {
      const holidayData = await getHolidayByDate(dateStr);
      if (holidayData) {
        setIsHolidayDate(true);
        setHolidayName(holidayData.name);
      } else {
        setIsHolidayDate(false);
        setHolidayName('');
      }
    } catch (error) {
      console.error('Check holiday error:', error);
    }

    if (classId) {
      try {
        const existing = await getAttendanceByClassAndDate(classId, dateStr);
        setExistingSubmission(!!existing);
      } catch (error) {
        setExistingSubmission(false);
      }
    }
  };

  const handleStatusChange = (index: number, status: 'present' | 'absent' | 'late') => {
    setRecords((prev) =>
      prev.map((record, i) => {
        if (i === index) {
          return {
            ...record,
            status,
            lateTime: status === 'late' ? record.lateTime || LATE_THRESHOLD : undefined,
            remarks: status === 'present' ? '' : record.remarks,
          };
        }
        return record;
      })
    );
  };

  const handleLateTimeChange = (index: number, time: string) => {
    setRecords((prev) =>
      prev.map((record, i) => (i === index ? { ...record, lateTime: time } : record))
    );
  };

  const handleRemarksChange = (index: number, remarks: string) => {
    setRecords((prev) => prev.map((record, i) => (i === index ? { ...record, remarks } : record)));
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) =>
      prev.map((record) => ({
        ...record,
        status: 'present',
        lateTime: undefined,
        remarks: '',
      }))
    );
    toast.success('All students marked as present');
  };

  const handleCopyAttendance = () => {
    if (!classData) return;

    const dateStr = format(selectedDate, 'EEEE, dd MMMM yyyy');
    const lateRecords = records.filter((r) => r.status === 'late');
    const absentRecords = records.filter((r) => r.status === 'absent');
    const summary = calculateSummary();

    let message = `📋 *Attendance Report*\n`;
    message += `Class: ${classData.name} (Grade ${classData.grade})\n`;
    message += `Date: ${dateStr}\n`;
    message += `Teacher: ${userName}\n\n`;

    message += `📊 *Summary*\n`;
    message += `Total Students: ${summary.total}\n`;
    message += `Present: ${summary.present} (${summary.rate}%)\n`;
    message += `Late: ${summary.late}\n`;
    message += `Absent: ${summary.absent}\n\n`;

    if (lateRecords.length > 0) {
      message += `⏰ *Late Arrivals (${lateRecords.length})*\n`;
      lateRecords.forEach((record, index) => {
        message += `${index + 1}. ${record.studentName}`;
        if (record.lateTime) message += ` - ${record.lateTime}`;
        if (record.remarks) message += ` (${record.remarks})`;
        message += `\n`;
      });
      message += `\n`;
    }

    if (absentRecords.length > 0) {
      message += `❌ *Absent Students (${absentRecords.length})*\n`;
      absentRecords.forEach((record, index) => {
        message += `${index + 1}. ${record.studentName}`;
        if (record.remarks) message += ` - ${record.remarks}`;
        message += `\n`;
      });
      message += `\n`;
    }

    if (lateRecords.length === 0 && absentRecords.length === 0) {
      message += `✅ *Perfect Attendance!*\nAll students were present on time.\n\n`;
    }

    message += `Generated on ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;

    navigator.clipboard
      .writeText(message)
      .then(() => {
        setCopied(true);
        toast.success('Attendance report copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleSubmit = async () => {
    if (!classData || !classId) return;

    if (isHolidayDate) {
      toast.error(`Cannot submit attendance on ${holidayName}. It's a holiday.`);
      return;
    }

    if (showReasonField && !lateReason.trim()) {
      toast.error('Please provide a reason for late submission');
      return;
    }

    const lateRecords = records.filter((r) => r.status === 'late');
    const missingTimes = lateRecords.filter((r) => !r.lateTime);
    if (missingTimes.length > 0) {
      toast.error('Please provide time for all late students');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting attendance...');

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const existing = await getAttendanceByClassAndDate(classId, dateStr);

      if (existing) {
        const confirm = window.confirm(
          'Attendance already exists for this date. Do you want to update it?'
        );

        if (!confirm) {
          toast.dismiss(loadingToast);
          setSubmitting(false);
          return;
        }

        await updateAttendance(
          existing.id,
          records,
          userId,
          userName,
          lateReason.trim() || 'Updated attendance record'
        );

        toast.dismiss(loadingToast);
        toast.success('Attendance updated successfully!');
      } else {
        await submitAttendance(classId, classData.name, dateStr, records, userId, userName);

        toast.dismiss(loadingToast);
        toast.success('Attendance submitted successfully!');
      }

      if (showReasonField && lateReason.trim()) {
        toast.info(`Reason: ${lateReason}`);
      }

      navigate('/teacher/history');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Submit attendance error:', error);
      toast.error('Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSummary = () => {
    const total = records.length;
    const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

    return { total, present, late, absent, rate };
  };

  return {
    // State
    classData,
    loading,
    submitting,
    selectedDate,
    isHolidayDate,
    holidayName,
    existingSubmission,
    lateReason,
    showReasonField,
    copied,
    records,
    summary: calculateSummary(),

    // Actions
    setSelectedDate,
    setLateReason,
    handleStatusChange,
    handleLateTimeChange,
    handleRemarksChange,
    handleMarkAllPresent,
    handleCopyAttendance,
    handleSubmit,
  };
}
