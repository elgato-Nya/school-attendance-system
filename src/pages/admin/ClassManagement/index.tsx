/**
 * Enhanced Class Management Page - Main Entry Point
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  getAllClasses,
  createClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
} from '@/services/class/class.service';
import {
  updateClassWithCascade,
  getAttendanceRecordCount,
} from '@/services/class/class-update-cascade.service';
import { getAllTeachers } from '@/services/user/user.service';
import type { Class, User, ClassFormData, StudentFormData } from '@/types';
import { validateClassForm, validateStudentForm } from '@/utils/validators';
import { ClassFormDialog } from '@/components/admin/ClassFormDialog';
import { EditClassDialog } from '@/components/admin/EditClassDialog';
import { StudentFormDialog } from '@/components/admin/StudentFormDialog';
import { StudentListDialog } from '@/components/admin/StudentListDialog';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { toast, parseError, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/toast';
import { SearchAndFilters } from './SearchAndFilters';
import { ClassesTable } from './ClassesTable';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export function ClassManagement() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

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

  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    name: '',
    icNumber: '',
    dob: '',
    guardianName: '',
    guardianContact: '',
    address: '',
  });
  const [studentFormErrors, setStudentFormErrors] = useState<Record<string, string>>({});
  const [selectedClassForStudent, setSelectedClassForStudent] = useState<string | null>(null);

  const [studentListOpen, setStudentListOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const [removeStudentDialogOpen, setRemoveStudentDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{
    classId: string;
    studentIndex: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, teachersData] = await Promise.all([getAllClasses(), getAllTeachers()]);
      setClasses(classesData);
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

  const handleDeleteClass = async (classId: string) => {
    // Check if class can be safely deleted
    const checkingToast = toast.loading('Checking class dependencies...');

    try {
      const { canDeleteClass } = await import('@/services/data-integrity.service');
      const checkResult = await canDeleteClass(classId);

      toast.dismiss(checkingToast);

      if (!checkResult.canDelete) {
        toast.error(checkResult.reason || 'Cannot delete this class');
        return;
      }

      // If safe to delete, show confirmation dialog
      setClassToDelete(classId);
      setDeleteDialogOpen(true);
    } catch (error) {
      toast.dismiss(checkingToast);
      console.error('Delete class check error:', error);
      toast.error('Failed to check class dependencies');
    }
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;

    const loadingToast = toast.loading('Deleting class...');

    try {
      await deleteClass(classToDelete);
      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.CLASS_DELETED);
      setDeleteDialogOpen(false);
      setClassToDelete(null);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Delete class error:', error);
      toast.error(parseError(error));
    }
  };

  const handleAddStudentClick = (classId: string) => {
    setSelectedClassForStudent(classId);
    setStudentFormOpen(true);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassForStudent) return;

    const validation = validateStudentForm(studentForm);
    if (!validation.isValid) {
      setStudentFormErrors(validation.errors);
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    const loadingToast = toast.loading('Adding student...');

    try {
      await addStudentToClass(selectedClassForStudent, studentForm);
      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.STUDENT_ADDED);
      setStudentFormOpen(false);
      resetStudentForm();
      setSelectedClassForStudent(null);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Add student error:', error);
      toast.error(parseError(error));
    }
  };

  const handleViewStudents = (classItem: Class) => {
    setSelectedClass(classItem);
    setStudentListOpen(true);
  };

  const handleRemoveStudentClick = (classId: string, studentIndex: number) => {
    setStudentToRemove({ classId, studentIndex });
    setRemoveStudentDialogOpen(true);
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    const loadingToast = toast.loading('Removing student...');

    try {
      await removeStudentFromClass(studentToRemove.classId, studentToRemove.studentIndex);
      toast.dismiss(loadingToast);
      toast.success('Student removed from class successfully!');
      setRemoveStudentDialogOpen(false);
      setStudentToRemove(null);
      loadData();

      // Update selected class if student list is open
      if (selectedClass && selectedClass.id === studentToRemove.classId) {
        const updatedClass = classes.find((c) => c.id === studentToRemove.classId);
        if (updatedClass) {
          setSelectedClass(updatedClass);
        }
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Remove student error:', error);
      toast.error(parseError(error));
    }
  };

  const resetClassForm = () => {
    setClassForm({
      name: '',
      grade: 0,
      teacherRep: '',
    });
    setClassFormErrors({});
  };

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      icNumber: '',
      dob: '',
      guardianName: '',
      guardianContact: '',
      address: '',
    });
    setStudentFormErrors({});
  };

  // Get available grades from classes
  const availableGrades = Array.from(new Set(classes.map((c) => c.grade))).sort((a, b) => a - b);

  // Filter classes
  const filteredClasses = classes.filter((classItem) => {
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

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        gradeFilter={gradeFilter}
        onGradeFilterChange={setGradeFilter}
        availableGrades={availableGrades}
      />

      {/* Classes Table */}
      <ClassesTable
        classes={filteredClasses}
        allClasses={classes}
        teachers={teachers}
        onViewStudents={handleViewStudents}
        onAddStudent={handleAddStudentClick}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClass}
        onClassClick={(classId: string) => navigate(`/teacher/mark-attendance/${classId}`)}
        searchQuery={searchQuery}
        gradeFilter={gradeFilter}
        onCreateFirstClass={() => {
          resetClassForm();
          setClassFormOpen(true);
        }}
      />

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

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={studentFormOpen}
        onOpenChange={setStudentFormOpen}
        className={
          selectedClassForStudent
            ? classes.find((c) => c.id === selectedClassForStudent)?.name || ''
            : ''
        }
        formData={studentForm}
        onChange={setStudentForm}
        formErrors={studentFormErrors}
        onSubmit={handleAddStudent}
      />

      {/* Student List Dialog */}
      <Dialog open={studentListOpen} onOpenChange={setStudentListOpen}>
        <StudentListDialog
          classItem={selectedClass}
          onAddStudent={() => {
            if (selectedClass) {
              handleAddStudentClick(selectedClass.id!);
              setStudentListOpen(false);
            }
          }}
          onRemoveStudent={handleRemoveStudentClick}
        />
      </Dialog>

      {/* Delete Class Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteClass}
        onCancel={() => setClassToDelete(null)}
        title="Delete Class"
        description="Are you sure you want to delete this class? This action cannot be undone. All student assignments will be removed."
      />

      {/* Remove Student Confirmation Dialog */}
      <DeleteConfirmDialog
        open={removeStudentDialogOpen}
        onOpenChange={setRemoveStudentDialogOpen}
        onConfirm={confirmRemoveStudent}
        onCancel={() => setStudentToRemove(null)}
        title="Remove Student"
        description="Are you sure you want to remove this student from the class? This action cannot be undone."
      />
    </div>
  );
}
