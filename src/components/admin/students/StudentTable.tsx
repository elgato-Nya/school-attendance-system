/**
 * Student Table Component
 * Reusable table for displaying active or archived students
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Archive, ArchiveRestore, Trash2, Users, Eye } from 'lucide-react';
import type { Student, Class, ArchivedStudent } from '@/types';

interface StudentTableProps {
  students: (Student | ArchivedStudent)[];
  classes: Class[];
  onArchiveClick: (student: Student | ArchivedStudent) => void;
  onDeleteClick: (student: Student | ArchivedStudent) => void;
  onViewDetails?: (student: Student | ArchivedStudent) => void;
  emptyMessage?: string;
}

export function StudentTable({
  students,
  classes,
  onArchiveClick,
  onDeleteClick,
  onViewDetails,
  emptyMessage = 'No students found',
}: StudentTableProps) {
  const getClassName = (classId: string) => {
    const classData = classes.find((c) => c.id === classId);
    return classData?.name || 'Unknown Class';
  };

  const getStudentData = (item: Student | ArchivedStudent) => {
    if ('studentData' in item) {
      // It's an ArchivedStudent
      const archived = item as ArchivedStudent;
      return {
        id: archived.id,
        name: archived.studentData.name,
        icNumber: archived.studentData.icNumber,
        classId: archived.originalClassId,
        guardianName: archived.studentData.guardianName,
        guardianContact: archived.studentData.guardianContact,
        isArchived: true,
      };
    }
    // It's a regular Student
    const student = item as Student;
    return {
      id: student.id,
      name: student.name,
      icNumber: student.icNumber,
      classId: student.classId,
      guardianName: student.guardianName,
      guardianContact: student.guardianContact,
      isArchived: false,
    };
  };

  if (students.length === 0) {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[140px]">IC Number</TableHead>
                <TableHead className="min-w-[120px]">Class</TableHead>
                <TableHead className="min-w-[150px]">Guardian</TableHead>
                <TableHead className="min-w-[130px]">Contact</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const data = getStudentData(student);
                return (
                  <TableRow key={data.id}>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell className="font-mono text-sm">{data.icNumber}</TableCell>
                    <TableCell>{getClassName(data.classId)}</TableCell>
                    <TableCell>{data.guardianName}</TableCell>
                    <TableCell>{data.guardianContact}</TableCell>
                    <TableCell>
                      {data.isArchived ? (
                        <Badge variant="secondary">Archived</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(student)}
                            aria-label={`View ${data.name} details`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchiveClick(student)}
                          aria-label={
                            data.isArchived ? `Restore ${data.name}` : `Archive ${data.name}`
                          }
                        >
                          {data.isArchived ? (
                            <ArchiveRestore className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Archive className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteClick(student)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${data.name} permanently`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Compact Cards */}
      <div className="md:hidden space-y-2">
        {students.map((student) => {
          const data = getStudentData(student);
          return (
            <div key={data.id} className="rounded-lg border bg-card p-3 space-y-2">
              {/* Header: Name and Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight break-words">{data.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{data.icNumber}</p>
                </div>
                <Badge
                  variant={data.isArchived ? 'secondary' : 'default'}
                  className="shrink-0 text-xs"
                >
                  {data.isArchived ? 'Archived' : 'Active'}
                </Badge>
              </div>

              {/* Class Info */}
              <p className="text-xs text-muted-foreground">{getClassName(data.classId)}</p>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(student);
                    }}
                    className="flex-1 h-8 text-xs"
                    aria-label={`View ${data.name} details`}
                  >
                    <Eye className="h-3 w-3 mr-1" aria-hidden="true" />
                    View
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchiveClick(student);
                  }}
                  className="flex-1 h-8 text-xs"
                  aria-label={data.isArchived ? `Restore ${data.name}` : `Archive ${data.name}`}
                >
                  {data.isArchived ? (
                    <>
                      <ArchiveRestore className="h-3 w-3 mr-1" aria-hidden="true" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="h-3 w-3 mr-1" aria-hidden="true" />
                      Archive
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(student);
                  }}
                  className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                  aria-label={`Delete ${data.name} permanently`}
                >
                  <Trash2 className="h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
