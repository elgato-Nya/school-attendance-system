import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import type { Class } from '@/types';
import type { StudentWithStats } from './StudentListTable';

type ViewMode = 'single' | 'range';

interface StudentListMobileProps {
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

export default function StudentListMobile({
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
}: StudentListMobileProps) {
  return (
    <>
      <div className="md:hidden space-y-3">
        {students.map((student) => {
          const classInfo = classes.find((c) => c.id === student.classId);
          const badge = getAttendanceBadge(student.attendanceRate);

          // For single day: determine status
          const isPresent = student.presentDays > 0;
          const isLate = student.lateDays > 0;
          const isAbsent = student.absentDays > 0;

          return (
            <Card
              key={student.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onStudentClick(student)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.icNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {classInfo ? `Grade ${classInfo.grade} - ${classInfo.name}` : 'N/A'}
                    </p>
                  </div>

                  {viewMode === 'single' ? (
                    <div className="ml-2 shrink-0">
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
                    </div>
                  ) : (
                    <Badge variant={badge.variant} className="ml-2 shrink-0">
                      {student.attendanceRate.toFixed(1)}%
                    </Badge>
                  )}
                </div>

                {viewMode === 'single' ? (
                  <>
                    {isLate && (
                      <div className="text-center py-2">
                        <div style={{ color: 'hsl(var(--warning))' }} className="font-medium">
                          ⚠️ Arrived Late{student.lateTime && ` at ${student.lateTime}`}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold" style={{ color: 'hsl(var(--success))' }}>
                        {student.presentDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Present</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: 'hsl(var(--warning))' }}>
                        {student.lateDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Late</div>
                    </div>
                    <div>
                      <div
                        className="text-lg font-bold"
                        style={{ color: 'hsl(var(--destructive))' }}
                      >
                        {student.absentDays}
                      </div>
                      <div className="text-xs text-muted-foreground">Absent</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <Card>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              startIndex={startIndex}
              endIndex={endIndex}
              totalRecords={totalRecords}
              showFirstLast={true}
            />
          </Card>
        )}
      </div>
    </>
  );
}
