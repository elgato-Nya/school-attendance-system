/**
 * Student Management Page (Admin Only)
 * Centralized hub for managing all students - active and archived
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/attendance/LoadingState';
import {
  getAllClasses,
  removeStudentFromClass,
  addStudentToClass,
} from '@/services/class/class.service';
import {
  archiveStudent,
  getAllArchivedStudents,
  restoreArchivedStudent,
  permanentlyDeleteArchivedStudent,
} from '@/services/student/student-archive.service';
import { StudentFilters } from '@/components/admin/students/StudentFilters';
import { StudentStats } from '@/components/admin/students/StudentStats';
import { StudentTable } from '@/components/admin/students/StudentTable';
import { DeleteStudentDialog } from '@/components/admin/students/DeleteStudentDialog';
import { ArchiveStudentDialog } from '@/components/admin/students/ArchiveStudentDialog';
import { AddStudentDialog } from '@/components/admin/students/AddStudentDialog';
import { StudentDetailsDialog } from '@/components/admin/students/StudentDetailsDialog';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus } from 'lucide-react';
import type { Student, Class, ArchivedStudent, StudentFormData } from '@/types';
import { toast } from 'sonner';

export function StudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [archivedStudents, setArchivedStudents] = useState<ArchivedStudent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | ArchivedStudent | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [studentToArchive, setStudentToArchive] = useState<Student | ArchivedStudent | null>(null);
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [studentToView, setStudentToView] = useState<Student | ArchivedStudent | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesData, archivedData] = await Promise.all([
        getAllClasses(),
        getAllArchivedStudents(),
      ]);

      setClasses(classesData);
      setArchivedStudents(archivedData);

      // Extract all active students from all classes
      const allStudents: Student[] = [];
      classesData.forEach((classDoc) => {
        classDoc.students.forEach((student, index) => {
          // Add a unique ID based on class and index if not present
          // Also store the student index for deletion/archiving
          allStudents.push({
            ...student,
            id: student.id || `${classDoc.id}_${index}`,
            classId: classDoc.id,
            studentIndex: index, // Store index for operations
          } as Student & { studentIndex: number });
        });
      });

      setStudents(allStudents);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Handle grade filter change
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    // If a specific grade is selected and current class doesn't match, reset class filter
    if (grade !== 'all') {
      const selectedClassData = classes.find((c) => c.id === selectedClass);
      if (selectedClassData && selectedClassData.grade !== Number(grade)) {
        setSelectedClass('all');
      }
    }
  };

  // Handle class filter change
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    // If a specific class is selected, update grade filter to match
    if (classId !== 'all') {
      const selectedClassData = classes.find((c) => c.id === classId);
      if (selectedClassData) {
        setSelectedGrade(String(selectedClassData.grade));
      }
    }
  };

  // Filter students based on active tab and search/grade/class filters
  const getFilteredStudents = () => {
    // Use different data source based on active tab
    const sourceData = activeTab === 'active' ? students : archivedStudents;
    let filtered: any[] = [...sourceData];

    // Filter by grade
    if (selectedGrade !== 'all') {
      filtered = filtered.filter((item) => {
        if (activeTab === 'active') {
          const student = item as Student;
          const classData = classes.find((c) => c.id === student.classId);
          return classData?.grade === Number(selectedGrade);
        } else {
          const archived = item as ArchivedStudent;
          const classData = classes.find((c) => c.id === archived.originalClassId);
          return classData?.grade === Number(selectedGrade);
        }
      });
    }

    // Filter by class
    if (selectedClass !== 'all') {
      filtered = filtered.filter((item) => {
        if (activeTab === 'active') {
          return (item as Student).classId === selectedClass;
        } else {
          return (item as ArchivedStudent).originalClassId === selectedClass;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (activeTab === 'active') {
          const student = item as Student;
          return (
            student.name.toLowerCase().includes(lowerSearch) ||
            student.icNumber.includes(searchTerm)
          );
        } else {
          const archived = item as ArchivedStudent;
          return (
            archived.studentData.name.toLowerCase().includes(lowerSearch) ||
            archived.studentData.icNumber.includes(searchTerm)
          );
        }
      });
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const handleDeleteClick = (student: Student | ArchivedStudent) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      if (activeTab === 'active') {
        // Delete from active students - remove from class
        const student = studentToDelete as Student & { studentIndex: number };
        await removeStudentFromClass(student.classId, student.studentIndex);
        toast.success(`${student.name} has been removed from class`);
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
      } else {
        // Permanently delete from archived collection
        const archived = studentToDelete as ArchivedStudent;
        await permanentlyDeleteArchivedStudent(archived.id!);
        toast.success(`${archived.studentData.name} has been permanently deleted`);
        setArchivedStudents((prev) => prev.filter((s) => s.id !== archived.id));
      }

      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleArchiveClick = (student: Student | ArchivedStudent) => {
    setStudentToArchive(student);
    setArchiveDialogOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!studentToArchive || !user) return;

    try {
      if (activeTab === 'active') {
        // Archive active student
        const student = studentToArchive as Student & { studentIndex: number };
        const classData = classes.find((c) => c.id === student.classId);

        if (!classData) {
          toast.error('Class not found');
          return;
        }

        // Archive the student
        await archiveStudent(
          student,
          student.classId,
          classData.name,
          user.id!,
          user.name,
          'Other',
          'Archived from Student Management'
        );

        // Remove from class
        await removeStudentFromClass(student.classId, student.studentIndex);

        toast.success(`${student.name} has been archived`);
      } else {
        // Restore archived student
        const archived = studentToArchive as ArchivedStudent;

        // Ask which class to restore to (default to original class)
        await restoreArchivedStudent(archived.id!, archived.originalClassId);

        toast.success(`${archived.studentData.name} has been restored`);
      }

      await loadData();
      setArchiveDialogOpen(false);
      setStudentToArchive(null);
    } catch (error) {
      console.error('Error archiving/restoring student:', error);
      toast.error('Failed to update student status');
    }
  };

  const handleAddStudent = async (classId: string, studentData: StudentFormData) => {
    try {
      await addStudentToClass(classId, studentData);

      const classData = classes.find((c) => c.id === classId);
      toast.success(`${studentData.name} has been added to ${classData?.name || 'class'}`);

      await loadData();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState message="Loading students..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centralized hub for managing all students across the school
          </p>
        </div>
        <Button
          onClick={() => setAddStudentDialogOpen(true)}
          className="w-full sm:w-auto"
          aria-label="Add new student"
        >
          <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Student
        </Button>
      </div>

      {/* Statistics */}
      <StudentStats
        totalActive={students.length}
        totalArchived={archivedStudents.length}
        filteredCount={filteredStudents.length}
        classCount={classes.length}
      />

      {/* Tabs for Active/Archived */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'active' | 'archived')}
        className="space-y-4"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" aria-label={`View active students, ${students.length} total`}>
            Active Students ({students.length})
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            aria-label={`View archived students, ${archivedStudents.length} total`}
          >
            Archived ({archivedStudents.length})
          </TabsTrigger>
        </TabsList>

        {/* Filters - Common for both tabs */}
        <StudentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedGrade={selectedGrade}
          onGradeChange={handleGradeChange}
          selectedClass={selectedClass}
          onClassChange={handleClassChange}
          classes={classes}
        />

        {/* Active Students Tab */}
        <TabsContent value="active" className="space-y-4">
          <StudentTable
            students={filteredStudents}
            classes={classes}
            onArchiveClick={handleArchiveClick}
            onDeleteClick={handleDeleteClick}
            onViewDetails={(student) => {
              setStudentToView(student);
              setDetailsDialogOpen(true);
            }}
            emptyMessage={
              searchTerm || selectedClass !== 'all' || selectedGrade !== 'all'
                ? 'No active students found matching your filters'
                : 'No active students'
            }
          />
        </TabsContent>

        {/* Archived Students Tab */}
        <TabsContent value="archived" className="space-y-4">
          <StudentTable
            students={filteredStudents}
            classes={classes}
            onArchiveClick={handleArchiveClick}
            onDeleteClick={handleDeleteClick}
            onViewDetails={(student) => {
              setStudentToView(student);
              setDetailsDialogOpen(true);
            }}
            emptyMessage={
              searchTerm || selectedClass !== 'all' || selectedGrade !== 'all'
                ? 'No archived students found matching your filters'
                : 'No archived students'
            }
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DeleteStudentDialog
        open={deleteDialogOpen}
        student={studentToDelete}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />

      <ArchiveStudentDialog
        open={archiveDialogOpen}
        student={studentToArchive}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={handleArchiveConfirm}
      />

      <AddStudentDialog
        open={addStudentDialogOpen}
        onOpenChange={setAddStudentDialogOpen}
        classes={classes}
        onSubmit={handleAddStudent}
      />

      <StudentDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        student={studentToView}
        classes={classes}
      />
    </div>
  );
}
