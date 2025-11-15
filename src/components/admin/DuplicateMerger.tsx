/**
 * Component to merge duplicate attendance records
 * One-time migration tool
 */

import { useState } from 'react';
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase.config';
import type { Attendance } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface DuplicateInfo {
  classId: string;
  className: string;
  date: string;
  count: number;
  recordIds: string[];
  timestamps: string[];
  records: (Attendance & { id: string })[];
}

export function DuplicateMerger() {
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [merged, setMerged] = useState<string[]>([]);

  async function findDuplicates() {
    setLoading(true);
    try {
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
      const foundDuplicates: DuplicateInfo[] = [];

      groups.forEach((records) => {
        if (records.length > 1) {
          // Sort by timestamp (oldest first)
          records.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

          foundDuplicates.push({
            classId: records[0].classId,
            className: records[0].className,
            date: records[0].date,
            count: records.length,
            recordIds: records.map((r) => r.id),
            timestamps: records.map((r) => new Date(r.timestamp.toMillis()).toLocaleString()),
            records: records,
          });
        }
      });

      setDuplicates(foundDuplicates);
      console.log(`Found ${foundDuplicates.length} sets of duplicates`);
    } catch (error) {
      console.error('Error finding duplicates:', error);
      alert('Error finding duplicates: ' + error);
    } finally {
      setLoading(false);
    }
  }

  async function mergeDuplicates() {
    if (duplicates.length === 0) {
      alert('No duplicates to merge!');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ This will merge ${duplicates.length} sets of duplicate records.\n\n` +
        `For each set:\n` +
        `- Keep the LATEST record\n` +
        `- Merge edit history from older records\n` +
        `- DELETE older records\n\n` +
        `This action cannot be undone!\n\n` +
        `Continue?`
    );

    if (!confirmed) return;

    setLoading(true);
    const mergedIds: string[] = [];

    try {
      for (const dup of duplicates) {
        await mergeDuplicateSet(dup);
        mergedIds.push(dup.recordIds.join(','));
        console.log(`✅ Merged: ${dup.className} - ${dup.date}`);
      }

      setMerged(mergedIds);
      setDuplicates([]); // Clear after merging
      alert(`✅ Successfully merged ${mergedIds.length} sets of duplicates!`);
    } catch (error) {
      console.error('Error merging duplicates:', error);
      alert('❌ Error merging duplicates: ' + error);
    } finally {
      setLoading(false);
    }
  }

  async function mergeDuplicateSet(duplicate: DuplicateInfo) {
    const { records } = duplicate;

    // records are already sorted oldest to newest
    const oldest = records[0];
    const latest = records[records.length - 1];

    // Build consolidated edit history
    const consolidatedEditHistory = [...(oldest.editHistory || [])];

    // Add entries for each subsequent version
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];

      // Create edit history entry for this change
      const editEntry = {
        editedBy: curr.submittedBy,
        editedByName: curr.submittedByName,
        editedAt: curr.timestamp,
        reason: curr.editHistory?.[0]?.reason || 'Merged from duplicate record',
        previousSummary: prev.summary,
      };

      consolidatedEditHistory.push(editEntry);

      // Also include any edit history from this record
      if (curr.editHistory && curr.editHistory.length > 0) {
        consolidatedEditHistory.push(...curr.editHistory);
      }
    }

    // Update the LATEST record with consolidated history
    const latestRef = doc(db, 'attendance', latest.id);
    await updateDoc(latestRef, {
      editHistory: consolidatedEditHistory,
      updatedAt: latest.timestamp, // Keep latest timestamp
    });

    // Delete all older records
    const batch = writeBatch(db);
    for (let i = 0; i < records.length - 1; i++) {
      const oldRef = doc(db, 'attendance', records[i].id);
      batch.delete(oldRef);
    }
    await batch.commit();

    console.log(`Merged ${records.length} records for ${duplicate.className} - ${duplicate.date}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 Duplicate Record Merger</CardTitle>
        <CardDescription>
          Merge duplicate attendance records into single documents with consolidated edit history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={findDuplicates} disabled={loading} variant="outline" className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              'Scan for Duplicates'
            )}
          </Button>

          {duplicates.length > 0 && (
            <Button
              onClick={mergeDuplicates}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Merge {duplicates.length} Set{duplicates.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>

        {duplicates.length > 0 && (
          <Alert variant="destructive">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div className="flex-1">
                <AlertDescription>
                  <div className="font-semibold mb-2">
                    Found {duplicates.length} set{duplicates.length > 1 ? 's' : ''} of duplicates
                  </div>
                  <div className="text-sm space-y-2">
                    {duplicates.map((dup, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-red-500 pl-3 py-2 bg-red-50 dark:bg-red-950"
                      >
                        <div className="font-medium">
                          {dup.className} - {dup.date}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dup.count} records will merge into 1
                        </div>
                        <div className="text-xs space-y-1 mt-2">
                          {dup.recordIds.map((id, i) => (
                            <div key={id} className="font-mono">
                              {i === dup.recordIds.length - 1 ? '✅ Keep: ' : '🗑️ Delete: '}
                              {id.slice(0, 8)}... ({dup.timestamps[i]})
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {merged.length > 0 && (
          <Alert>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 mt-0.5 text-green-500" />
              <div className="flex-1">
                <AlertDescription>
                  <div className="font-semibold mb-2 text-green-700 dark:text-green-400">
                    ✅ Successfully merged {merged.length} set{merged.length > 1 ? 's' : ''} of
                    duplicates!
                  </div>
                  <div className="text-sm">
                    You can now proceed to remove <code>getLatestVersions()</code> filters from the
                    codebase.
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {duplicates.length === 0 && merged.length === 0 && !loading && (
          <div className="text-sm text-muted-foreground text-center py-4">
            Click "Scan for Duplicates" to check for duplicate records
          </div>
        )}
      </CardContent>
    </Card>
  );
}
