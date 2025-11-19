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
    return { variant: 'default' as const, label: 'Cemerlang' };
  }
  if (rate >= 75) {
    return { variant: 'secondary' as const, label: 'Baik' };
  }
  return { variant: 'destructive' as const, label: 'Berisiko' };
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
            <TableHead>Nombor IC</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Kelas</TableHead>
            {viewMode === 'single' ? (
              <>
                <TableHead className="text-right">Status Kehadiran</TableHead>
                <TableHead className="text-right">Maklumat Lewat</TableHead>
              </>
            ) : (
              <>
                <TableHead className="text-right">Hari Dijejak</TableHead>
                <TableHead className="text-right">Hadir</TableHead>
                <TableHead className="text-right">Lewat</TableHead>
                <TableHead className="text-right">Tidak Hadir</TableHead>
                <TableHead className="text-right">Kadar Kehadiran</TableHead>
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
                  {classInfo ? `Tingkatan ${classInfo.grade} - ${classInfo.name}` : 'T/A'}
                </TableCell>

                {viewMode === 'single' ? (
                  <>
                    <TableCell className="text-right">
                      {student.totalDays === 0 ? (
                        <Badge variant="secondary">Tiada Rekod</Badge>
                      ) : isPresent ? (
                        <Badge
                          variant="default"
                          style={{
                            backgroundColor: 'hsl(var(--success))',
                            color: 'hsl(var(--success-foreground))',
                          }}
                        >
                          Hadir
                        </Badge>
                      ) : isAbsent ? (
                        <Badge variant="destructive">Tidak Hadir</Badge>
                      ) : (
                        <Badge variant="secondary">Tiada Rekod</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isLate && student.lateTime ? (
                        <span style={{ color: 'hsl(var(--warning))' }} className="font-medium">
                          Tiba pada {student.lateTime}
                        </span>
                      ) : isLate ? (
                        <span style={{ color: 'hsl(var(--warning))' }} className="font-medium">
                          Tiba Lewat
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
