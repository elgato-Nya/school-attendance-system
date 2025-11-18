/**
 * Admin Classes Grid - Mobile-first card layout
 * Replaces table for better mobile experience
 */

import { Button } from '@/components/ui/button';
import { ClassCard } from '@/components/shared/class';
import {
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  GraduationCap,
  Archive,
  ArchiveRestore,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Class, User } from '@/types';

interface ClassesGridProps {
  classes: Class[];
  teachers: User[];
  onViewStudents: (classItem: Class) => void;
  onEditClass?: (classItem: Class) => void;
  onDeleteClass: (classId: string) => void;
  onArchiveClass?: (classItem: Class) => void;
  onRestoreClass?: (classId: string) => void;
  onClassClick: (classId: string) => void;
  searchQuery: string;
  gradeFilter: string;
  onCreateFirstClass: () => void;
  isArchived: boolean;
}

export function ClassesGrid({
  classes,
  teachers,
  onViewStudents,
  onEditClass,
  onDeleteClass,
  onArchiveClass,
  onRestoreClass,
  onClassClick,
  searchQuery,
  gradeFilter,
  onCreateFirstClass,
  isArchived,
}: ClassesGridProps) {
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
            <UserPlus className="h-4 w-4 mr-2" />
            Create First Class
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((classItem) => {
        const teacher = teachers.find((t) => t.id === classItem.teacherRep);
        const studentCount = classItem.students?.length || 0;

        return (
          <ClassCard
            key={classItem.id}
            name={classItem.name}
            grade={classItem.grade}
            studentCount={studentCount}
            teacherName={teacher?.name || 'Unassigned'}
            primaryAction={{
              label: 'View Students',
              onClick: () => onViewStudents(classItem),
              variant: 'outline',
            }}
            secondaryActions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isArchived && onEditClass && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClass(classItem);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                      Edit Class
                    </DropdownMenuItem>
                  )}

                  {!isArchived && onArchiveClass && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveClass(classItem);
                      }}
                      className="text-orange-500 focus:text-orange-600"
                    >
                      <Archive className="h-4 w-4 mr-2" aria-hidden="true" />
                      Archive Class
                    </DropdownMenuItem>
                  )}

                  {isArchived && onRestoreClass && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreClass(classItem.id!);
                      }}
                      className="text-green-500 focus:text-green-600"
                    >
                      <ArchiveRestore className="h-4 w-4 mr-2" aria-hidden="true" />
                      Restore Class
                    </DropdownMenuItem>
                  )}

                  {((!isArchived && onArchiveClass) || (isArchived && onRestoreClass)) && (
                    <DropdownMenuSeparator />
                  )}

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClass(classItem.id!);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                    {isArchived ? 'Permanently Delete' : 'Delete Class'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            onClick={() => onClassClick(classItem.id!)}
          />
        );
      })}
    </div>
  );
}
