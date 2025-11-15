/**
 * Script to check for duplicate attendance records in Firestore
 * Run with: npm run dev and visit /api/check-duplicates
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/services/firebase.config';
import type { Attendance } from '../src/types';

interface DuplicateInfo {
  classId: string;
  className: string;
  date: string;
  count: number;
  recordIds: string[];
  timestamps: string[];
}

export async function checkForDuplicates(): Promise<{
  hasDuplicates: boolean;
  duplicates: DuplicateInfo[];
  totalRecords: number;
  uniqueRecords: number;
}> {
  console.log('🔍 Checking for duplicate attendance records...');
  
  // Fetch all attendance records
  const snapshot = await getDocs(collection(db, 'attendance'));
  const allRecords: (Attendance & { id: string })[] = [];
  
  snapshot.forEach(doc => {
    const data = doc.data() as Attendance;
    allRecords.push({
      id: doc.id,
      ...data
    });
  });

  console.log(`📊 Total records in database: ${allRecords.length}`);

  // Group by classId + date
  const groups = new Map<string, (Attendance & { id: string })[]>();
  
  allRecords.forEach(record => {
    const key = `${record.classId}-${record.date}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  });

  // Find duplicates
  const duplicates: DuplicateInfo[] = [];
  
  groups.forEach((records, key) => {
    if (records.length > 1) {
      // Sort by timestamp
      records.sort((a, b) => 
        a.timestamp.toMillis() - b.timestamp.toMillis()
      );

      duplicates.push({
        classId: records[0].classId,
        className: records[0].className,
        date: records[0].date,
        count: records.length,
        recordIds: records.map(r => r.id),
        timestamps: records.map(r => 
          new Date(r.timestamp.toMillis()).toISOString()
        ),
      });
    }
  });

  const hasDuplicates = duplicates.length > 0;
  const uniqueRecords = groups.size;

  if (hasDuplicates) {
    console.log(`⚠️ Found ${duplicates.length} sets of duplicates!`);
    duplicates.forEach(dup => {
      console.log(`\n  Class: ${dup.className} | Date: ${dup.date}`);
      console.log(`  Duplicate count: ${dup.count}`);
      console.log(`  Record IDs: ${dup.recordIds.join(', ')}`);
    });
  } else {
    console.log('✅ No duplicates found! Each class+date has only one record.');
  }

  return {
    hasDuplicates,
    duplicates,
    totalRecords: allRecords.length,
    uniqueRecords,
  };
}

// For console testing
if (typeof window !== 'undefined') {
  (window as any).checkForDuplicates = checkForDuplicates;
}
