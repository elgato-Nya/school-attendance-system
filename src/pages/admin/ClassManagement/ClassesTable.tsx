/**
 * Classes Table Component
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
import { Plus, Users, UserPlus, Trash2, GraduationCap, Edit } from 'lucide-react';
import type { Class, User } from '@/types';

interface ClassesTableProps {
  classes: Class[];
  allClasses: Class[];
  teachers: User[];
  onViewStudents: (classItem: Class) => void;
  onAddStudent: (classId: string) => void;
  onEditClass: (classItem: Class) => void;
  onDeleteClass: (classId: string) => void;
  onClassClick: (classId: string) => void;
  searchQuery: string;
  gradeFilter: string;
  onCreateFirstClass: () => void;
}

export function ClassesTable({
  classes,
  allClasses,
  teachers,
  onViewStudents,
  onAddStudent,
  onEditClass,
  onDeleteClass,
  onClassClick,
  searchQuery,
  gradeFilter,
  onCreateFirstClass,
}: ClassesTableProps) {
  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20">
        <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No classes found</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          {searchQuery || gradeFilter !== 'all'
            ? 'Try adjusting your search or filters'
            : 'Get started by creating your first class'}
        </p>
        {!searchQuery && gradeFilter === 'all' && (
          <Button onClick={onCreateFirstClass}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Class
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead className="hidden sm:table-cell">Grade</TableHead>
                <TableHead className="hidden md:table-cell">Teacher</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => {
                const teacher = teachers.find((t) => t.id === classItem.teacherRep);
                const studentCount = classItem.students?.length || 0;

                return (
                  <TableRow
                    key={classItem.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onClassClick(classItem.id!)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div onClick={() => onClassClick(classItem.id!)}>
                        <p className="font-medium">{classItem.name}</p>
                        <div className="sm:hidden mt-1 space-y-1">
                          <Badge variant="secondary" className="text-xs">
                            Form {classItem.grade}
                          </Badge>
                          {teacher && (
                            <p className="text-xs text-muted-foreground">{teacher.name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">Form {classItem.grade}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {teacher ? (
                        <span className="text-sm">{teacher.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewStudents(classItem);
                        }}
                        className="w-full sm:w-auto"
                        aria-label={`View ${studentCount} students in ${classItem.name}`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        <span className="font-medium">{studentCount}</span>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-1 sm:gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddStudent(classItem.id!)}
                          title="Add students"
                          aria-label={`Add students to ${classItem.name}`}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="sr-only">Add Students</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditClass(classItem)}
                          title="Edit class"
                          aria-label={`Edit ${classItem.name}`}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteClass(classItem.id!)}
                          className="text-destructive hover:text-destructive"
                          title="Delete class"
                          aria-label={`Delete ${classItem.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
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

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {classes.length} of {allClasses.length} {classes.length === 1 ? 'class' : 'classes'}
      </div>
    </>
  );
}
