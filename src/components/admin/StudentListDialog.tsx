/**
 * Enhanced Student List Dialog with Mobile Support
 */

import { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Class } from '@/types';
import { Search, UserPlus, Trash2, Users, Phone, User } from 'lucide-react';

interface StudentListDialogProps {
  classItem: Class | null;
  onAddStudent: () => void;
  onRemoveStudent: (classId: string, studentIndex: number) => void;
}

export function StudentListDialog({
  classItem,
  onAddStudent,
  onRemoveStudent,
}: StudentListDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!classItem) return null;

  // Filter students based on search
  const filteredStudents = classItem.students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.guardianName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
      {/* Header */}
      <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl sm:text-2xl truncate">
              Students in {classItem.name}
            </DialogTitle>
            <DialogDescription className="mt-1">
              <Badge variant="secondary" className="text-xs">
                Grade {classItem.grade} • {classItem.students.length}{' '}
                {classItem.students.length === 1 ? 'student' : 'students'}
              </Badge>
            </DialogDescription>
          </div>
          <Button onClick={onAddStudent} size="sm" className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </DialogHeader>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 py-3 border-b bg-muted/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students or guardians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search students"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No students found' : 'No students yet'}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Get started by adding your first student'}
            </p>
            {!searchQuery && (
              <Button onClick={onAddStudent} size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Student
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => {
                    // Get original index from full list
                    const originalIndex = classItem.students.findIndex(
                      (s) => s.icNumber === student.icNumber
                    );
                    return (
                      <TableRow key={student.icNumber}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.guardianName}</TableCell>
                        <TableCell>{student.guardianContact}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveStudent(classItem.id, originalIndex)}
                            className="text-destructive hover:text-destructive"
                            aria-label={`Remove ${student.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {filteredStudents.map((student, index) => {
                const originalIndex = classItem.students.findIndex(
                  (s) => s.icNumber === student.icNumber
                );
                return (
                  <div key={student.icNumber} className="border rounded-lg p-4 space-y-3 bg-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <h4 className="font-medium truncate">{student.name}</h4>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{student.guardianName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{student.guardianContact}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveStudent(classItem.id, originalIndex)}
                        className="text-destructive hover:text-destructive shrink-0"
                        aria-label={`Remove ${student.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer with Summary */}
      {filteredStudents.length > 0 && (
        <div className="px-4 sm:px-6 py-3 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing {filteredStudents.length} of {classItem.students.length}{' '}
            {filteredStudents.length === 1 ? 'student' : 'students'}
          </p>
        </div>
      )}
    </DialogContent>
  );
}
