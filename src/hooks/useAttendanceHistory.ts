// src/hooks/useAttendanceHistory.ts
import { useState, useEffect } from 'react';
import { getAttendanceHistory } from '@/services/attendance.service';
import type { Attendance } from '@/types';
import { toast } from 'sonner';

export function useAttendanceHistory(classId: string, startDate: string, endDate: string) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classId && startDate && endDate) {
      loadRecords();
    }
  }, [classId, startDate, endDate]);

  const loadRecords = async () => {
    if (!classId) return;

    setLoading(true);
    try {
      const data = await getAttendanceHistory(classId, startDate, endDate);
      setRecords(data);
    } catch (error) {
      console.error('Error loading attendance history:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  return { records, loading, refetch: loadRecords };
}
