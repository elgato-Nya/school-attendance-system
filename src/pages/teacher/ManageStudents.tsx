/**
 * Manage Students page for teachers
 * Teachers can add, edit, and remove students from their assigned classes
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  addStudentToClass,
  updateStudent,
  removeStudentFromClass,
  getClassById,
} from '@/services/class/class.service';
import type { Class, StudentFormData, Student } from '@/types';
import { toast, parseError, SUCCESS_MESSAGES } from '@/utils/toast';
import { StudentFormDialog } from '@/components/admin/StudentFormDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArchiveStudentDialog } from '@/components/shared/ArchiveStudentDialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { UserPlus, Pencil, Trash2, Users, Search } from 'lucide-react';

export default function ManageStudents() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Form states
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudentIndex, setEditingStudentIndex] = useState<number | null>(null);
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    name: '',
    icNumber: '',
    dob: '',
    guardianName: '',
    guardianContact: '',
    address: '',
  });
  const [studentFormErrors, setStudentFormErrors] = useState<Record<string, string>>({});

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{
    index: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (user?.assignedClasses) {
      loadClasses();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedClassId) {
      loadSelectedClass();
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classPromises = user!.assignedClasses.map((classId) => getClassById(classId));
      const classesData = await Promise.all(classPromises);
      const validClasses = classesData.filter((c) => c !== null) as Class[];
      setClasses(validClasses);

      if (validClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(validClasses[0].id);
      }
    } catch (error) {
      console.error('Load classes error:', error);
      toast.error(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedClass = async () => {
    try {
      const classData = await getClassById(selectedClassId);
      setSelectedClass(classData);
    } catch (error) {
      console.error('Load selected class error:', error);
      toast.error(parseError(error));
    }
  };

  const handleAddStudent = () => {
    setIsEditing(false);
    setEditingStudentIndex(null);
    setStudentForm({
      name: '',
      icNumber: '',
      dob: '',
      guardianName: '',
      guardianContact: '',
      address: '',
    });
    setStudentFormErrors({});
    setStudentFormOpen(true);
  };

  const handleEditStudent = (student: Student, index: number) => {
    setIsEditing(true);
    setEditingStudentIndex(index);
    setStudentForm({
      name: student.name,
      icNumber: student.icNumber,
      dob: student.dob,
      guardianName: student.guardianName,
      guardianContact: student.guardianContact,
      address: student.address,
    });
    setStudentFormErrors({});
    setStudentFormOpen(true);
  };

  const handleDeleteStudent = (index: number, name: string) => {
    setStudentToDelete({ index, name });
    setDeleteDialogOpen(true);
  };

  const handleStudentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassId) {
      toast.error('Sila pilih kelas terlebih dahulu');
      return;
    }

    // Validate form
    const { validateStudentForm } = await import('@/utils/validators');
    const validation = validateStudentForm(studentForm);
    if (!validation.isValid) {
      setStudentFormErrors(validation.errors);
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'Updating student...' : 'Adding student...');
    try {
      if (isEditing && editingStudentIndex !== null) {
        await updateStudent(selectedClassId, editingStudentIndex, studentForm);
        toast.dismiss(loadingToast);
        toast.success(SUCCESS_MESSAGES.STUDENT_UPDATED || 'Murid berjaya dikemaskini');
      } else {
        await addStudentToClass(selectedClassId, studentForm);
        toast.dismiss(loadingToast);
        toast.success(SUCCESS_MESSAGES.STUDENT_ADDED);
      }

      setStudentFormOpen(false);
      await loadSelectedClass();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Student form submit error:', error);
      toast.error(parseError(error));
    }
  };

  const confirmDeleteStudent = async (
    reason: 'Transferred' | 'Graduated' | 'Withdrawn' | 'Other',
    reasonDetails: string
  ) => {
    if (!studentToDelete || !selectedClassId || !selectedClass || !user) return;

    const loadingToast = toast.loading('Archiving student...');
    try {
      const studentData = selectedClass.students[studentToDelete.index];

      // Import archive service
      const { archiveStudent } = await import('@/services/student/student-archive.service');

      // Archive the student with reason (teachers can only archive, not permanently delete)
      await archiveStudent(
        studentData,
        selectedClassId,
        selectedClass.name,
        user.id,
        user.name,
        reason,
        reasonDetails
      );

      // Remove from class after archiving
      await removeStudentFromClass(selectedClassId, studentToDelete.index);

      toast.dismiss(loadingToast);
      toast.success('Murid berjaya diarkibkan dengan sejarah kehadiran dipelihara');
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      await loadSelectedClass();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Archive student error:', error);
      toast.error(parseError(error));
    }
  };

  // Filter students by search query
  const filteredStudents =
    selectedClass?.students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.icNumber.includes(searchQuery)
    ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuatkan kelas...</p>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tiada Kelas Ditugaskan</h3>
          <p className="text-sm text-muted-foreground">
            Anda belum mempunyai kelas yang ditugaskan lagi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Urus Murid</h2>
          <p className="text-muted-foreground">Tambah, sunting, atau buang murid dari kelas anda</p>
        </div>
      </div>

      {/* Class Selector & Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Pilih Kelas</CardTitle>
              <CardDescription>Pilih kelas untuk mengurus murid</CardDescription>
            </div>
            <Button onClick={handleAddStudent} disabled={!selectedClassId}>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Murid
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.students.length} murid)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cari Murid</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari mengikut nama atau nombor IC"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {selectedClass && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">Tingkatan {selectedClass.grade}</Badge>
                <span className="text-muted-foreground">
                  Jumlah Murid: {selectedClass.students.length}
                </span>
                {filteredStudents.length !== selectedClass.students.length && (
                  <span className="text-muted-foreground">
                    Memaparkan: {filteredStudents.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle>Murid dalam {selectedClass.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Tiada murid dijumpai yang sepadan dengan carian anda'
                    : 'Tiada murid dalam kelas ini lagi'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Nombor IC</TableHead>
                      <TableHead>Tarikh Lahir</TableHead>
                      <TableHead>Penjaga</TableHead>
                      <TableHead>Hubungan</TableHead>
                      <TableHead className="text-right">Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const originalIndex = selectedClass.students.indexOf(student);
                      return (
                        <TableRow key={student.icNumber}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.icNumber}</TableCell>
                          <TableCell>{format(new Date(student.dob), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{student.guardianName}</TableCell>
                          <TableCell>{student.guardianContact}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStudent(student, originalIndex)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStudent(originalIndex, student.name)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Form Dialog */}
      <StudentFormDialog
        open={studentFormOpen}
        onOpenChange={setStudentFormOpen}
        className={selectedClass?.name || ''}
        formData={studentForm}
        formErrors={studentFormErrors}
        onSubmit={handleStudentFormSubmit}
        onChange={setStudentForm}
      />

      {/* Archive Student Dialog with Reason */}
      <ArchiveStudentDialog
        open={deleteDialogOpen}
        studentName={studentToDelete?.name || ''}
        onConfirm={confirmDeleteStudent}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setStudentToDelete(null);
        }}
      />
    </div>
  );
}
