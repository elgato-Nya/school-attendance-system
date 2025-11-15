/**
 * Class Management page for admins
 */

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getAllClasses,
  createClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
} from '@/services/class/class.service';
import { getAllTeachers } from '@/services/user/user.service';
import type { Class, User, ClassFormData, StudentFormData } from '@/types';
import { validateClassForm, validateStudentForm } from '@/utils/validators';
import { toast, parseError, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/toast';
import { ClassCard } from '@/components/admin/ClassCard';
import { ClassFormDialog } from '@/components/admin/ClassFormDialog';
import { StudentFormDialog } from '@/components/admin/StudentFormDialog';
import { StudentListDialog } from '@/components/admin/StudentListDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [studentListOpen, setStudentListOpen] = useState(false);

  const [classFormOpen, setClassFormOpen] = useState(false);
  const [classForm, setClassForm] = useState<ClassFormData>({
    name: '',
    grade: 0,
    teacherRep: '',
  });
  const [classFormErrors, setClassFormErrors] = useState<Record<string, string>>({});

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

  // Alert dialog states
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

  const handleDeleteClass = async (classId: string) => {
    setClassToDelete(classId);
    setDeleteDialogOpen(true);
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

  const handleViewStudents = (classItem: Class) => {
    setSelectedClass(classItem);
    setStudentListOpen(true);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    const validation = validateStudentForm(studentForm);
    if (!validation.isValid) {
      setStudentFormErrors(validation.errors);
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    const loadingToast = toast.loading('Adding student...');
    try {
      await addStudentToClass(selectedClass.id, studentForm);
      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.STUDENT_ADDED);
      setStudentFormOpen(false);
      resetStudentForm();
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Add student error:', error);
      toast.error(parseError(error));
    }
  };

  const handleRemoveStudent = async (classId: string, studentIndex: number) => {
    setStudentToRemove({ classId, studentIndex });
    setRemoveStudentDialogOpen(true);
  };

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    const loadingToast = toast.loading('Removing student...');
    try {
      await removeStudentFromClass(studentToRemove.classId, studentToRemove.studentIndex);
      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.STUDENT_DELETED);
      setRemoveStudentDialogOpen(false);
      setStudentToRemove(null);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Remove student error:', error);
      toast.error(parseError(error));
    }
  };

  const resetClassForm = () => {
    setClassForm({ name: '', grade: 0, teacherRep: '' });
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

  if (loading) return <LoadingSpinner message="Loading classes..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Class Management</h2>
          <p className="text-muted-foreground">Manage classes and students</p>
        </div>
        <ClassFormDialog
          open={classFormOpen}
          onOpenChange={setClassFormOpen}
          formData={classForm}
          formErrors={classFormErrors}
          teachers={teachers}
          onSubmit={handleCreateClass}
          onChange={setClassForm}
          onReset={resetClassForm}
        />
      </div>
      {classes.length === 0 ? (
        <EmptyState
          description="No classes yet. Create your first class!"
          actionLabel="Add Class"
          onAction={() => setClassFormOpen(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              teachers={teachers}
              onViewStudents={handleViewStudents}
              onDelete={handleDeleteClass}
            />
          ))}
        </div>
      )}
      <Dialog open={studentListOpen} onOpenChange={setStudentListOpen}>
        <StudentListDialog
          classItem={selectedClass}
          onAddStudent={() => {
            setStudentFormOpen(true);
            resetStudentForm();
          }}
          onRemoveStudent={handleRemoveStudent}
        />
      </Dialog>
      <StudentFormDialog
        open={studentFormOpen}
        onOpenChange={setStudentFormOpen}
        className={selectedClass?.name || ''}
        formData={studentForm}
        formErrors={studentFormErrors}
        onSubmit={handleAddStudent}
        onChange={setStudentForm}
      />

      {/* Delete Class Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class? This action cannot be undone and will
              permanently remove all class data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClassToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClass}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={removeStudentDialogOpen} onOpenChange={setRemoveStudentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this student from the class? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setStudentToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
