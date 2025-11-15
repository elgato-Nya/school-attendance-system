/**
 * AttendanceHistoryTable
 * Desktop table view for attendance records with sorting
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { Attendance } from '@/types';

type SortField = 'date' | 'class' | 'rate' | 'status';
type SortOrder = 'asc' | 'desc';

interface AttendanceHistoryTableProps {
  records: Attendance[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onRowClick: (record: Attendance) => void;
}

// Helper function to parse date string without timezone issues
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function AttendanceHistoryTable({
  records,
  sortField,
  sortOrder,
  onSort,
  onRowClick,
}: AttendanceHistoryTableProps) {
  const getRateBadgeVariant = (rate: number): 'success' | 'warning' | 'destructive' => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'destructive';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => onSort('date')}
              >
                Date
                <SortIcon field="date" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => onSort('class')}
              >
                Class
                <SortIcon field="class" />
              </Button>
            </TableHead>
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Present</TableHead>
            <TableHead className="text-center">Late</TableHead>
            <TableHead className="text-center">Absent</TableHead>
            <TableHead className="text-center">Excused</TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => onSort('rate')}
              >
                Rate
                <SortIcon field="rate" />
              </Button>
            </TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => onSort('status')}
              >
                Status
                <SortIcon field="status" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              onClick={() => onRowClick(record)}
              className="cursor-pointer hover:bg-accent/50"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRowClick(record);
                }
              }}
            >
              <TableCell className="font-medium">
                <time dateTime={record.date}>
                  {parseDateString(record.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </TableCell>
              <TableCell>{record.className}</TableCell>
              <TableCell className="text-center">{record.summary.total}</TableCell>
              <TableCell className="text-center text-green-600 dark:text-green-400">
                {record.summary.present}
              </TableCell>
              <TableCell className="text-center text-yellow-600 dark:text-yellow-400">
                {record.summary.late}
              </TableCell>
              <TableCell className="text-center text-red-600 dark:text-red-400">
                {record.summary.absent}
              </TableCell>
              <TableCell className="text-center text-blue-600 dark:text-blue-400">
                {record.summary.excused}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={getRateBadgeVariant(record.summary.rate)}
                  aria-label={`Attendance rate: ${record.summary.rate}%`}
                >
                  {record.summary.rate}%
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{record.submittedByName}</TableCell>
              <TableCell>
                {record.editHistory.length > 0 ? (
                  <Badge variant="warning" title={`Edited ${record.editHistory.length} time(s)`}>
                    Edited
                  </Badge>
                ) : (
                  <Badge variant="outline">Original</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
