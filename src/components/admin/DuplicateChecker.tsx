/**
 * Component to check for duplicate attendance records
 * Temporary diagnostic tool
 */

import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import type { Attendance } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface DuplicateInfo {
  classId: string;
  className: string;
  date: string;
  count: number;
  recordIds: string[];
  timestamps: string[];
}

export function DuplicateChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    hasDuplicates: boolean;
    duplicates: DuplicateInfo[];
    totalRecords: number;
    uniqueRecords: number;
  } | null>(null);

  async function checkForDuplicates() {
    setLoading(true);
    try {
      console.log('🔍 Checking for duplicate attendance records...');

      // Fetch all attendance records
      const snapshot = await getDocs(collection(db, 'attendance'));
      const allRecords: (Attendance & { id: string })[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Attendance, 'id'>;
        allRecords.push({
          ...data,
          id: doc.id,
        });
      });

      console.log(`📊 Total records in database: ${allRecords.length}`);

      // Group by classId + date
      const groups = new Map<string, (Attendance & { id: string })[]>();

      allRecords.forEach((record) => {
        const key = `${record.classId}-${record.date}`;
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(record);
      });

      // Find duplicates
      const duplicates: DuplicateInfo[] = [];

      groups.forEach((records) => {
        if (records.length > 1) {
          // Sort by timestamp
          records.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

          duplicates.push({
            classId: records[0].classId,
            className: records[0].className,
            date: records[0].date,
            count: records.length,
            recordIds: records.map((r) => r.id),
            timestamps: records.map((r) => new Date(r.timestamp.toMillis()).toISOString()),
          });
        }
      });

      const hasDuplicates = duplicates.length > 0;
      const uniqueRecords = groups.size;

      setResult({
        hasDuplicates,
        duplicates,
        totalRecords: allRecords.length,
        uniqueRecords,
      });

      if (hasDuplicates) {
        console.log(`⚠️ Found ${duplicates.length} sets of duplicates!`);
        duplicates.forEach((dup) => {
          console.log(`\n  Class: ${dup.className} | Date: ${dup.date}`);
          console.log(`  Duplicate count: ${dup.count}`);
          console.log(`  Record IDs: ${dup.recordIds.join(', ')}`);
        });
      } else {
        console.log('✅ No duplicates found! Each class+date has only one record.');
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
      alert('Error checking duplicates: ' + error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Duplicate Attendance Checker</CardTitle>
        <CardDescription>
          Check if there are duplicate attendance records for the same class and date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkForDuplicates} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Check for Duplicates'
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <Alert variant={result.hasDuplicates ? 'destructive' : 'default'}>
              <div className="flex items-start gap-2">
                {result.hasDuplicates ? (
                  <AlertTriangle className="h-5 w-5 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      {result.hasDuplicates
                        ? `⚠️ Found ${result.duplicates.length} sets of duplicates!`
                        : '✅ No duplicates found!'}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Total records in database: {result.totalRecords}</p>
                      <p>Unique class+date combinations: {result.uniqueRecords}</p>
                      {result.hasDuplicates && (
                        <p>Redundant records: {result.totalRecords - result.uniqueRecords}</p>
                      )}
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {result.hasDuplicates && (
              <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                <h4 className="font-semibold">Duplicate Records:</h4>
                {result.duplicates.map((dup, idx) => (
                  <div
                    key={idx}
                    className="border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50 dark:bg-yellow-950"
                  >
                    <div className="font-medium">
                      {dup.className} - {dup.date}
                    </div>
                    <div className="text-sm text-muted-foreground">{dup.count} records found</div>
                    <div className="text-xs space-y-1 mt-2">
                      {dup.recordIds.map((id, i) => (
                        <div key={id} className="font-mono">
                          {i === dup.recordIds.length - 1 ? '✅ Latest: ' : '🗑️ Old: '}
                          {id.slice(0, 8)}... ({new Date(dup.timestamps[i]).toLocaleString()})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
