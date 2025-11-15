/**
 * Attendance Filtering Utilities
 * Handles filtering of attendance records by view mode
 */

import type { Attendance } from '@/types';

export type ViewMode = 'latest' | 'all' | 'edited-only';

export interface FilteredAttendanceResult {
  records: Attendance[];
  stats: {
    total: number;
    edited: number;
    original: number;
    superseded: number;
  };
}

/**
 * Filter attendance records based on view mode
 * - 'latest': Only show the most recent version of each attendance (for accurate stats)
 * - 'all': Show all records including old versions (for audit trail)
 * - 'edited-only': Show only records that have been edited
 */
export function filterAttendanceByViewMode(
  records: Attendance[],
  viewMode: ViewMode = 'latest'
): FilteredAttendanceResult {
  let filteredRecords: Attendance[];

  // Get latest versions for statistics
  const latestVersions = getLatestVersions(records);

  switch (viewMode) {
    case 'latest':
      // Only show latest versions (for accurate metrics)
      filteredRecords = latestVersions;
      break;

    case 'edited-only':
      // Only show records that have been edited (latest versions only)
      filteredRecords = latestVersions.filter((r) => r.editHistory && r.editHistory.length > 0);
      break;

    case 'all':
    default:
      // Show all records including superseded ones (for audit)
      filteredRecords = records;
      break;
  }

  // Calculate stats
  const editedRecords = latestVersions.filter((r) => r.editHistory && r.editHistory.length > 0);
  const supersededCount = records.length - latestVersions.length;

  const stats = {
    total: latestVersions.length,
    edited: editedRecords.length,
    original: latestVersions.length - editedRecords.length,
    superseded: supersededCount,
  };

  return { records: filteredRecords, stats };
}

/**
 * Get only the latest version of each attendance record
 * This is CRITICAL for accurate statistics and reporting
 *
 * Groups records by classId + date, keeping only the newest timestamp
 */
export function getLatestVersions(records: Attendance[]): Attendance[] {
  const recordMap = new Map<string, Attendance>();

  records.forEach((record) => {
    const key = `${record.classId}-${record.date}`;
    const existing = recordMap.get(key);

    // Keep the record with the most recent timestamp
    if (!existing || record.timestamp.toMillis() > existing.timestamp.toMillis()) {
      recordMap.set(key, record);
    }
  });

  return Array.from(recordMap.values());
}

/**
 * Check if a record has been superseded by a newer version
 */
export function isSuperseded(record: Attendance, allRecords: Attendance[]): boolean {
  // Find if there's a newer record with the same class and date
  const newerRecord = allRecords.find(
    (r) =>
      r.id !== record.id &&
      r.classId === record.classId &&
      r.date === record.date &&
      r.timestamp.toMillis() > record.timestamp.toMillis()
  );

  return !!newerRecord;
}

/**
 * Get all versions of a specific attendance record (by classId and date)
 */
export function getAttendanceVersions(
  classId: string,
  date: string,
  allRecords: Attendance[]
): Attendance[] {
  return allRecords
    .filter((r) => r.classId === classId && r.date === date)
    .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()); // Newest first
}
