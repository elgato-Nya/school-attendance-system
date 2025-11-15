/**
 * CSV Export with Edit History Options
 * Enhanced export functionality with edit history controls
 */

import type { Attendance } from '@/types';
import { formatDisplayDate } from './dateFormatter';
import { isEditedRecord, getEditCount, getLastEditor } from './attendanceHistory';

export interface ExportOptions {
  includeSuperseded?: boolean; // Include original/old versions
  includeEditHistory?: boolean; // Add edit history column
  includeEditDetails?: boolean; // Detailed edit log
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Export attendance records to CSV with edit history options
 */
export function exportAttendanceToCSV(
  records: Attendance[],
  filename: string,
  options: ExportOptions = {}
): void {
  const {
    includeSuperseded = false,
    includeEditHistory = false,
    includeEditDetails = false,
  } = options;

  // Filter records if needed
  let filteredRecords = records;
  if (!includeSuperseded) {
    filteredRecords = getLatestVersionsOnly(records);
  }

  // Build CSV headers
  const headers = [
    'Date',
    'Class Name',
    'Class ID',
    'Present',
    'Absent',
    'Late',
    'Excused',
    'Total',
    'Attendance Rate',
  ];

  if (includeEditHistory) {
    headers.push('Status', 'Edit Count', 'Last Edited By', 'Last Edited At');
  }

  if (includeEditDetails) {
    headers.push('Edit History');
  }

  // Build CSV rows
  const rows = filteredRecords.map((record) => {
    const total = record.summary?.total || 0;
    const rate =
      total > 0
        ? ((((record.summary?.present || 0) + (record.summary?.late || 0)) / total) * 100).toFixed(
            2
          )
        : '0';

    const row = [
      formatDisplayDate(record.date),
      record.className || '',
      record.classId || '', // Using classId since there's no form property
      record.summary?.present?.toString() || '0',
      record.summary?.absent?.toString() || '0',
      record.summary?.late?.toString() || '0',
      record.summary?.excused?.toString() || '0',
      total.toString(),
      `${rate}%`,
    ];

    if (includeEditHistory) {
      const edited = isEditedRecord(record);
      const editCount = getEditCount(record);
      const lastEditor = getLastEditor(record);

      row.push(
        edited ? 'Edited' : 'Original',
        editCount.toString(),
        lastEditor?.name || '-',
        lastEditor ? formatDisplayDate(lastEditor.timestamp) : '-'
      );
    }

    if (includeEditDetails && record.editHistory && record.editHistory.length > 0) {
      const editLog = record.editHistory
        .map(
          (edit, idx) =>
            `Edit ${idx + 1}: ${edit.editedByName} on ${formatDisplayDate(edit.editedAt.toDate().toISOString())}`
        )
        .join(' | ');
      row.push(editLog);
    } else if (includeEditDetails) {
      row.push('-');
    }

    return row;
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n');

  // Download file
  downloadCSV(csvContent, filename);
}

/**
 * Export with full edit history (separate row per version)
 */
export function exportFullEditHistory(records: Attendance[], filename: string): void {
  const headers = [
    'Date',
    'Class Name',
    'Class ID',
    'Version',
    'Present',
    'Absent',
    'Late',
    'Excused',
    'Total',
    'Attendance Rate',
    'Edited By',
    'Edited At',
  ];

  const rows: string[][] = [];

  records.forEach((record) => {
    // Add current version
    rows.push(buildVersionRow(record, 'Latest'));

    // Add each historical version from editHistory
    if (record.editHistory && record.editHistory.length > 0) {
      record.editHistory.forEach((edit, idx) => {
        rows.push(buildVersionRow(record, `Edit ${idx + 1}`, edit));
      });
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCSVField).join(',')),
  ].join('\n');

  downloadCSV(csvContent, filename);
}

/**
 * Helper: Build CSV row for a specific version
 */
function buildVersionRow(record: Attendance, version: string, edit?: any): string[] {
  const data = edit?.previousSummary || record.summary;
  const total = data?.total || 0;

  const rate =
    total > 0 ? ((((data?.present || 0) + (data?.late || 0)) / total) * 100).toFixed(2) : '0';

  return [
    formatDisplayDate(record.date),
    record.className || '',
    record.classId || '', // Using classId since there's no form property
    version,
    data?.present?.toString() || '0',
    data?.absent?.toString() || '0',
    data?.late?.toString() || '0',
    data?.excused?.toString() || '0',
    total.toString(),
    `${rate}%`,
    edit ? edit.editedByName : record.submittedByName || '-',
    edit
      ? formatDisplayDate(edit.editedAt.toDate().toISOString())
      : formatDisplayDate(record.timestamp.toDate().toISOString()),
  ];
}

/**
 * Helper: Get latest versions only
 */
function getLatestVersionsOnly(records: Attendance[]): Attendance[] {
  const recordMap = new Map<string, Attendance>();

  records.forEach((record) => {
    const key = `${record.classId}-${record.date}`;
    const existing = recordMap.get(key);

    if (!existing || record.timestamp.toMillis() > existing.timestamp.toMillis()) {
      recordMap.set(key, record);
    }
  });

  return Array.from(recordMap.values());
}

/**
 * Helper: Escape CSV field
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Helper: Download CSV file
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
