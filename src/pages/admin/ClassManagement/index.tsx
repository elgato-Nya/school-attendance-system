/**
 * Enhanced Class Management Page - Main Entry Point
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAllClasses,
  createClass,
  deleteClass,
  getArchivedClasses,
} from '@/services/class/class.service';
import {
  updateClassWithCascade,
  getAttendanceRecordCount,
} from '@/services/class/class-update-cascade.service';
import {
  archiveClass,
  restoreClass,
  permanentlyDeleteClass,
} from '@/services/class/class-archive.service';
import { getAllTeachers } from '@/services/user/user.service';
import { useAuth } from '@/hooks/useAuth';
import type { Class, User, ClassFormData } from '@/types';
import { validateClassForm } from '@/utils/validators';
import { ClassFormDialog } from '@/components/admin/ClassFormDialog';
import { EditClassDialog } from '@/components/admin/EditClassDialog';
import { StudentListDialog } from '@/components/admin/StudentListDialog';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { toast, parseError, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/toast';
import { SearchAndFilters } from './SearchAndFilters';
import { ClassesGrid } from './ClassesGrid';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ArchiveClassDialog } from './ArchiveClassDialog';

export function ClassManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeClasses, setActiveClasses] = useState<Class[]>([]);
  const [archivedClasses, setArchivedClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [currentTab, setCurrentTab] = useState<'active' | 'archived'>('active');

  const [classFormOpen, setClassFormOpen] = useState(false);
  const [classForm, setClassForm] = useState<ClassFormData>({
    name: '',
    grade: 0,
    teacherRep: '',
  });
  const [classFormErrors, setClassFormErrors] = useState<Record<string, string>>({});

  // Edit class dialog state
  const [editClassOpen, setEditClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editClassForm, setEditClassForm] = useState<ClassFormData>({
    name: '',
    grade: 0,
    teacherRep: '',
  });
  const [editClassFormErrors, setEditClassFormErrors] = useState<Record<string, string>>({});
  const [attendanceRecordCount, setAttendanceRecordCount] = useState(0);

  const [studentListOpen, setStudentListOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [classToArchive, setClassToArchive] = useState<Class | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allClassesData, archivedClassesData, teachersData] = await Promise.all([
        getAllClasses(),
        getArchivedClasses(),
        getAllTeachers(),
      ]);
      setActiveClasses(allClassesData);
      setArchivedClasses(archivedClassesData);
      setTeachers(teachersData);

      if (teachersData.length === 0) {
        toast.warning('No teachers available. Please create teacher accounts first.');
      }
    } catch (error) {
      console.error('Load data error:', error);
      toast.error(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (teachers.length === 0) {
      toast.warning(ERROR_MESSAGES.NO_TEACHER_AVAILABLE);
      return;
    }

    const validation = validateClassForm(classForm);
    if (!validation.isValid) {
      setClassFormErrors(validation.errors);
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    const loadingToast = toast.loading('Creating class...');

    try {
      await createClass(classForm);
      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.CLASS_CREATED);
      setClassFormOpen(false);
      resetClassForm();
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Create class error:', error);
      toast.error(parseError(error));
    }
  };

  const handleEditClass = async (classItem: Class) => {
    setEditingClass(classItem);
    setEditClassForm({
      name: classItem.name,
      grade: classItem.grade,
      teacherRep: classItem.teacherRep,
    });
    setEditClassFormErrors({});

    // Get attendance record count
    const count = await getAttendanceRecordCount(classItem.id);
    setAttendanceRecordCount(count);

    setEditClassOpen(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingClass) return;

    const validation = validateClassForm(editClassForm);
    if (!validation.isValid) {
      setEditClassFormErrors(validation.errors);
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    const loadingToast = toast.loading('Updating class...');

    try {
      const result = await updateClassWithCascade(
        editingClass.id,
        editClassForm,
        editingClass.teacherRep
      );

      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || 'Failed to update class');
        return;
      }

      // Build success message with details
      let message = 'Class updated successfully!';
      if (result.attendanceRecordsUpdated > 0) {
        message += ` ${result.attendanceRecordsUpdated} attendance record${
          result.attendanceRecordsUpdated !== 1 ? 's' : ''
        } updated.`;
      }
      if (result.teacherUpdated) {
        message += ' Teacher assignments updated.';
      }

      toast.success(message);
      setEditClassOpen(false);
      setEditingClass(null);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Update class error:', error);
      toast.error(parseError(error));
    }
  };

  const handleArchiveClass = async (classItem: Class) => {
    setClassToArchive(classItem);
    setArchiveDialogOpen(true);
  };

  const confirmArchiveClass = async (reason: string) => {
    if (!classToArchive || !user) return;

    const loadingToast = toast.loading('Archiving class...');

    try {
      await archiveClass(classToArchive.id, user.id!, reason);
      toast.dismiss(loadingToast);
      toast.success('Class archived successfully!');
      setArchiveDialogOpen(false);
      setClassToArchive(null);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Archive class error:', error);
      toast.error(parseError(error));
    }
  };

  const handleRestoreClass = async (classId: string) => {
    const loadingToast = toast.loading('Restoring class...');

    try {
      await restoreClass(classId);
      toast.dismiss(loadingToast);
      toast.success('Class restored successfully!');
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Restore class error:', error);
      toast.error(parseError(error));
    }
  };

  const handleDeleteClass = async (classId: string) => {
    // Show confirmation dialog
    setClassToDelete(classId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;

    const loadingToast = toast.loading('Deleting class...');

    try {
      // For archived classes, permanently delete
      if (currentTab === 'archived') {
        await permanentlyDeleteClass(classToDelete);
        toast.dismiss(loadingToast);
        toast.success('Class permanently deleted!');
      } else {
        // For active classes, normal delete (will fail if attendance exists)
        await deleteClass(classToDelete);
        toast.dismiss(loadingToast);
        toast.success(SUCCESS_MESSAGES.CLASS_DELETED);
      }
      setDeleteDialogOpen(false);
      setClassToDelete(null);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Delete class error:', error);
      toast.error(parseError(error));
    }
  };

  const handleViewStudents = (classItem: Class) => {
    setSelectedClass(classItem);
    setStudentListOpen(true);
  };

  const resetClassForm = () => {
    setClassForm({
      name: '',
      grade: 0,
      teacherRep: '',
    });
    setClassFormErrors({});
  };

  // Get current classes based on tab
  const currentClasses = currentTab === 'active' ? activeClasses : archivedClasses;

  // Get available grades from current classes
  const availableGrades = Array.from(new Set(currentClasses.map((c) => c.grade))).sort(
    (a, b) => a - b
  );

  // Filter classes
  const filteredClasses = currentClasses.filter((classItem) => {
    const matchesGrade = gradeFilter === 'all' || classItem.grade === parseInt(gradeFilter);
    const teacher = teachers.find((t) => t.id === classItem.teacherRep);
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Loading classes..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Class Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage classes, assign teachers, and add students
          </p>
        </div>
        <Button
          onClick={() => {
            resetClassForm();
            setClassFormOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {/* Tabs for Active/Archived */}
      <Tabs
        value={currentTab}
        onValueChange={(value) => setCurrentTab(value as 'active' | 'archived')}
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="active" className="flex-1 sm:flex-none">
            Active Classes ({activeClasses.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex-1 sm:flex-none">
            Archived Classes ({archivedClasses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {/* Search and Filters */}
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            gradeFilter={gradeFilter}
            onGradeFilterChange={setGradeFilter}
            availableGrades={availableGrades}
          />

          {/* Classes Grid - Mobile-first design */}
          <ClassesGrid
            classes={filteredClasses}
            teachers={teachers}
            onViewStudents={handleViewStudents}
            onEditClass={handleEditClass}
            onDeleteClass={handleDeleteClass}
            onArchiveClass={handleArchiveClass}
            onClassClick={(classId: string) => navigate(`/teacher/mark-attendance/${classId}`)}
            searchQuery={searchQuery}
            gradeFilter={gradeFilter}
            onCreateFirstClass={() => {
              resetClassForm();
              setClassFormOpen(true);
            }}
            isArchived={false}
          />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-4">
          {/* Search and Filters */}
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            gradeFilter={gradeFilter}
            onGradeFilterChange={setGradeFilter}
            availableGrades={availableGrades}
          />

          {/* Archived Classes Grid */}
          <ClassesGrid
            classes={filteredClasses}
            teachers={teachers}
            onViewStudents={handleViewStudents}
            onDeleteClass={handleDeleteClass}
            onRestoreClass={handleRestoreClass}
            onClassClick={(classId: string) => navigate(`/teacher/mark-attendance/${classId}`)}
            searchQuery={searchQuery}
            gradeFilter={gradeFilter}
            onCreateFirstClass={() => {
              resetClassForm();
              setClassFormOpen(true);
            }}
            isArchived={true}
          />
        </TabsContent>
      </Tabs>

      {/* Class Form Dialog */}
      <ClassFormDialog
        open={classFormOpen}
        onOpenChange={setClassFormOpen}
        formData={classForm}
        onChange={setClassForm}
        formErrors={classFormErrors}
        teachers={teachers}
        onSubmit={handleCreateClass}
        onReset={resetClassForm}
      />

      {/* Edit Class Dialog */}
      <EditClassDialog
        open={editClassOpen}
        onOpenChange={setEditClassOpen}
        classData={editingClass}
        formData={editClassForm}
        onChange={setEditClassForm}
        formErrors={editClassFormErrors}
        teachers={teachers}
        attendanceRecordCount={attendanceRecordCount}
        onSubmit={handleUpdateClass}
      />

      {/* Student List Dialog (Read-Only) */}
      <Dialog open={studentListOpen} onOpenChange={setStudentListOpen}>
        <StudentListDialog classItem={selectedClass} />
      </Dialog>

      {/* Archive Class Dialog */}
      <ArchiveClassDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        classData={classToArchive}
        onConfirm={confirmArchiveClass}
        onCancel={() => {
          setArchiveDialogOpen(false);
          setClassToArchive(null);
        }}
      />

      {/* Delete Class Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setClassToDelete(null);
        }}
        onConfirm={confirmDeleteClass}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setClassToDelete(null);
        }}
        title={currentTab === 'archived' ? 'Permanently Delete Class' : 'Delete Class'}
        description={
          currentTab === 'archived'
            ? 'Are you sure you want to permanently delete this archived class? This action cannot be undone and all data will be lost forever.'
            : 'Are you sure you want to delete this class? This action cannot be undone. All student assignments and attendance records will be removed permanently. Consider archiving instead to preserve historical data.'
        }
      />
    </div>
  );
}
