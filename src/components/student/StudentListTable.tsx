import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import type { Class } from '@/types';

type ViewMode = 'single' | 'range';

export interface StudentWithStats {
  id: string;
  name: string;
  icNumber: string;
  classId: string;
  guardianName: string;
  guardianContact: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  lateTime?: string;
}

interface StudentListTableProps {
  students: StudentWithStats[];
  classes: Class[];
  viewMode: ViewMode;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onStudentClick: (student: StudentWithStats) => void;
}

function getAttendanceBadge(rate: number) {
  if (rate >= 90) {
    return { variant: 'default' as const, label: 'Excellent' };
  }
  if (rate >= 75) {
    return { variant: 'secondary' as const, label: 'Good' };
  }
  return { variant: 'destructive' as const, label: 'At Risk' };
}

export default function StudentListTable({
  students,
  classes,
  viewMode,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalRecords,
  onPageChange,
  onStudentClick,
}: StudentListTableProps) {
  return (
    <Card className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>IC Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            {viewMode === 'single' ? (
              <>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Late Info</TableHead>
              </>
            ) : (
              <>
                <TableHead className="text-right">Days Tracked</TableHead>
                <TableHead className="text-right">Present</TableHead>
                <TableHead className="text-right">Late</TableHead>
                <TableHead className="text-right">Absent</TableHead>
                <TableHead className="text-right">Attendance Rate</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const classInfo = classes.find((c) => c.id === student.classId);
            const badge = getAttendanceBadge(student.attendanceRate);

            // For single day: determine status
            const isPresent = student.presentDays > 0;
            const isLate = student.lateDays > 0;
            const isAbsent = student.absentDays > 0;

            return (
              <TableRow
                key={student.id}
                className="cursor-pointer"
                onClick={() => onStudentClick(student)}
              >
                <TableCell className="font-medium">{student.icNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {classInfo ? `Grade ${classInfo.grade} - ${classInfo.name}` : 'N/A'}
                </TableCell>

                {viewMode === 'single' ? (
                  <>
                    <TableCell className="text-right">
                      {student.totalDays === 0 ? (
                        <Badge variant="secondary">No Record</Badge>
                      ) : isPresent ? (
                        <Badge
                          variant="default"
                          style={{
                            backgroundColor: 'hsl(var(--success))',
                            color: 'hsl(var(--success-foreground))',
                          }}
                        >
                          Present
                        </Badge>
                      ) : isAbsent ? (
                        <Badge variant="destructive">Absent</Badge>
                      ) : (
                        <Badge variant="secondary">No Record</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLate && student.lateTime ? (
                        <span style={{ color: 'hsl(var(--warning))' }} className="font-medium">
                          Arrived at {student.lateTime}
                        </span>
                      ) : isLate ? (
                        <span style={{ color: 'hsl(var(--warning))' }} className="font-medium">
                          Arrived Late
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right text-muted-foreground">
                      {student.totalDays}
                    </TableCell>
                    <TableCell className="text-right">
                      <span style={{ color: 'hsl(var(--success))' }} className="font-medium">
                        {student.presentDays}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span style={{ color: 'hsl(var(--warning))' }} className="font-medium">
                        {student.lateDays}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span style={{ color: 'hsl(var(--destructive))' }} className="font-medium">
                        {student.absentDays}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={badge.variant}>{student.attendanceRate.toFixed(1)}%</Badge>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          startIndex={startIndex}
          endIndex={endIndex}
          totalRecords={totalRecords}
        />
      )}
    </Card>
  );
}
