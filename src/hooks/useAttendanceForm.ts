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
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<{
    existingId: string;
    records: AttendanceRecord[];
    reason: string;
  } | null>(null);

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
      console.error('Ralat semasa memuatkan data kelas:', error);
      toast.error('Terdapat masalah dalam memuatkan data kelas.');
      navigate('/teacher/classes');
    } finally {
      setLoading(false);
    }
  };

  const checkDateValidation = async () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    if (isFuture(selectedDate)) {
      toast.error('Tarikh yang dipilih tidak boleh pada masa hadapan.');
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
      console.error('Ralat semasa memeriksa cuti:', error);
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
    toast.success('Semua pelajar ditanda hadir');
  };

  const handleCopyAttendance = () => {
    if (!classData) return;

    const dateStr = format(selectedDate, 'EEEE, dd MMMM yyyy');
    const lateRecords = records.filter((r) => r.status === 'late');
    const absentRecords = records.filter((r) => r.status === 'absent');
    const summary = calculateSummary();

    let message = `📋 *Laporan Kehadiran*\n`;
    message += `Kelas: ${classData.name} (Tingkatan ${classData.grade})\n`;
    message += `Tarikh: ${dateStr}\n`;
    message += `Guru: ${userName}\n\n`;

    message += `📊 *Ringkasan*\n`;
    message += `Jumlah Pelajar: ${summary.total}\n`;
    message += `Hadir: ${summary.present} (${summary.rate}%)\n`;
    message += `Lewat: ${summary.late}\n`;
    message += `Tidak Hadir: ${summary.absent}\n\n`;
    if (lateRecords.length > 0) {
      message += `⏰ *Pelajar Lewat (${lateRecords.length})*\n`;
      lateRecords.forEach((record, index) => {
        message += `${index + 1}. ${record.studentName}`;
        if (record.lateTime) message += ` - ${record.lateTime}`;
        if (record.remarks) message += ` (${record.remarks})`;
        message += `\n`;
      });
      message += `\n`;
    }

    if (absentRecords.length > 0) {
      message += `❌ *Pelajar Tidak Hadir (${absentRecords.length})*\n`;
      absentRecords.forEach((record, index) => {
        message += `${index + 1}. ${record.studentName}`;
        if (record.remarks) message += ` - ${record.remarks}`;
        message += `\n`;
      });
      message += `\n`;
    }

    if (lateRecords.length === 0 && absentRecords.length === 0) {
      message += `✅ *Kehadiran Sempurna!*\nSemua pelajar hadir tepat pada waktunya.\n\n`;
    }

    message += `Dihasilkan pada ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;

    navigator.clipboard
      .writeText(message)
      .then(() => {
        setCopied(true);
        toast.success('Laporan kehadiran disalin ke papan klip!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Gagal menyalin ke papan klip');
      });
  };

  const handleSubmit = async () => {
    if (!classData || !classId) return;

    if (isHolidayDate) {
      toast.error(`Tidak boleh menghantar kehadiran pada ${holidayName}. Ia adalah cuti.`);
      return;
    }

    if (showReasonField && !lateReason.trim()) {
      toast.error('Sila berikan sebab untuk penghantaran lewat');
      return;
    }

    const lateRecords = records.filter((r) => r.status === 'late');
    const missingTimes = lateRecords.filter((r) => !r.lateTime);
    if (missingTimes.length > 0) {
      toast.error('Sila berikan masa untuk semua pelajar lewat');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Menghantar kehadiran...');

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const existing = await getAttendanceByClassAndDate(classId, dateStr);

      if (existing) {
        toast.dismiss(loadingToast);
        setSubmitting(false);

        // Show confirmation dialog
        setPendingSubmitData({
          existingId: existing.id,
          records,
          reason: lateReason.trim() || 'Kemas kini rekod kehadiran',
        });
        setShowUpdateConfirm(true);
        return;
      }

      await submitAttendance(classId, classData?.name || '', dateStr, records, userId, userName);

      toast.dismiss(loadingToast);
      toast.success('Kehadiran berjaya dihantar!');

      if (showReasonField && lateReason.trim()) {
        toast.info(`Sebab: ${lateReason}`);
      }

      navigate('/teacher/history');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Ralat menghantar kehadiran:', error);
      toast.error('Gagal menghantar kehadiran. Sila cuba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!pendingSubmitData) return;

    setShowUpdateConfirm(false);
    setSubmitting(true);
    const loadingToast = toast.loading('Mengemas kini kehadiran...');

    try {
      await updateAttendance(
        pendingSubmitData.existingId,
        pendingSubmitData.records,
        userId,
        userName,
        pendingSubmitData.reason
      );

      toast.dismiss(loadingToast);
      toast.success('Kehadiran berjaya dikemas kini!');

      if (showReasonField && lateReason.trim()) {
        toast.info(`Sebab: ${lateReason}`);
      }

      navigate('/teacher/history');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Ralat mengemas kini kehadiran:', error);
      toast.error('Gagal mengemas kini kehadiran. Sila cuba lagi.');
    } finally {
      setSubmitting(false);
      setPendingSubmitData(null);
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateConfirm(false);
    setPendingSubmitData(null);
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
    showUpdateConfirm,

    // Actions
    setSelectedDate,
    setLateReason,
    handleStatusChange,
    handleLateTimeChange,
    handleRemarksChange,
    handleMarkAllPresent,
    handleCopyAttendance,
    handleSubmit,
    handleConfirmUpdate,
    handleCancelUpdate,
  };
}
