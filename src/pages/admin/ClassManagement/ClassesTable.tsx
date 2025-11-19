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
        <h3 className="text-lg font-medium mb-2">Tiada kelas dijumpai</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          {searchQuery || gradeFilter !== 'all'
            ? 'Cuba laraskan carian atau penapis anda'
            : 'Mulakan dengan mencipta kelas pertama anda'}
        </p>
        {!searchQuery && gradeFilter === 'all' && (
          <Button onClick={onCreateFirstClass}>
            <Plus className="h-4 w-4 mr-2" />
            Cipta Kelas Pertama
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
                <TableHead>Nama Kelas</TableHead>
                <TableHead className="hidden sm:table-cell">Tingkatan</TableHead>
                <TableHead className="hidden md:table-cell">Guru</TableHead>
                <TableHead className="text-center">Murid</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
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
                    <TableCell>
                      <div onClick={() => onClassClick(classItem.id!)}>
                        <p className="font-medium">{classItem.name}</p>
                        <div className="sm:hidden mt-1 space-y-1">
                          <Badge variant="secondary" className="text-xs">
                            Tingkatan {classItem.grade}
                          </Badge>
                          {teacher && (
                            <p className="text-xs text-muted-foreground">{teacher.name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">Tingkatan {classItem.grade}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {teacher ? (
                        <span className="text-sm">{teacher.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Belum Ditetapkan</span>
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
                          title="Tambah murid"
                          aria-label={`Tambah murid ke ${classItem.name}`}
                        >
                          <UserPlus className="h-4 w-4" />
                          <span className="sr-only">Tambah Murid</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditClass(classItem)}
                          title="Sunting kelas"
                          aria-label={`Sunting ${classItem.name}`}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Sunting</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteClass(classItem.id!)}
                          className="text-destructive hover:text-destructive"
                          title="Padam kelas"
                          aria-label={`Padam ${classItem.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Padam</span>
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
        Menunjukkan {classes.length} daripada {allClasses.length}{' '}
        {classes.length === 1 ? 'kelas' : 'kelas'}
      </div>
    </>
  );
}
