/**
 * Enhanced User Management Page with Table View and Search
 */

import { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/user/user.service';
import { getAllClasses } from '@/services/class/class.service';
import type { User, UserFormData, Class } from '@/types';
import { validateUserForm } from '@/utils/validators';
import { toast, parseError, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/toast';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { ROLES } from '@/utils/constants';
import { Search, UserPlus, Edit, Trash2, Users } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher'>('all');

  const [userFormOpen, setUserFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormData>({
    name: '',
    email: '',
    role: ROLES.TEACHER,
    assignedClasses: [],
    password: '',
  });
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});

  // Alert dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, classesData] = await Promise.all([getAllUsers(), getAllClasses()]);
      setUsers(usersData);
      setClasses(classesData);
    } catch (error) {
      console.error('Load data error:', error);
      toast.error(parseError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateUserForm(userForm, !isEditing);
    if (!validation.isValid) {
      setUserFormErrors(validation.errors);
      toast.error(ERROR_MESSAGES.VALIDATION_ERROR);
      return;
    }

    const loadingToast = toast.loading(
      isEditing ? 'Mengemaskini pengguna...' : 'Mencipta pengguna...'
    );
    try {
      if (isEditing && editingUserId) {
        await updateUser(editingUserId, {
          name: userForm.name,
          role: userForm.role,
          assignedClasses: userForm.assignedClasses,
        });
        toast.dismiss(loadingToast);
        toast.success(SUCCESS_MESSAGES.USER_UPDATED);
      } else {
        await createUser(userForm);
        toast.dismiss(loadingToast);
        toast.success(SUCCESS_MESSAGES.USER_CREATED);
      }

      setUserFormOpen(false);
      resetUserForm();
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Create/Update user error:', error);
      toast.error(parseError(error));
    }
  };

  const handleEditUser = (user: User) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedClasses: user.assignedClasses,
    });
    setUserFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    // Show confirmation dialog
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    const loadingToast = toast.loading('Memadam pengguna...');
    try {
      await deleteUser(userToDelete);
      toast.dismiss(loadingToast);
      toast.success(SUCCESS_MESSAGES.USER_DELETED);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Delete user error:', error);
      toast.error(parseError(error));
    }
  };

  const resetUserForm = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      role: ROLES.TEACHER,
      assignedClasses: [],
      password: '',
    });
    setUserFormErrors({});
  };

  // Filter and search users
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Memuatkan pengguna..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pengurusan Pengguna</h1>
          <p className="text-sm text-muted-foreground">Urus guru dan pentadbir</p>
        </div>
        <Button
          onClick={() => {
            resetUserForm();
            setUserFormOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari mengikut nama atau emel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Cari pengguna"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Tapis mengikut peranan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Pengguna ({users.length})</SelectItem>
            <SelectItem value="admin">
              Pentadbir ({users.filter((u) => u.role === ROLES.ADMIN).length})
            </SelectItem>
            <SelectItem value="teacher">
              Guru ({users.filter((u) => u.role === ROLES.TEACHER).length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Tiada pengguna dijumpai</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {searchQuery || roleFilter !== 'all'
              ? 'Cuba laraskan carian atau penapis anda'
              : 'Mulakan dengan mencipta pengguna pertama anda'}
          </p>
          {!searchQuery && roleFilter === 'all' && (
            <Button
              onClick={() => {
                resetUserForm();
                setUserFormOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Pengguna Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] sm:w-auto">Nama</TableHead>
                  <TableHead className="hidden sm:table-cell">Emel</TableHead>
                  <TableHead>Peranan</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Kelas</TableHead>
                  <TableHead className="text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="break-words">{user.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden mt-1 break-all">
                          {user.email}
                        </p>
                        <div className="sm:hidden mt-1">
                          <Badge
                            variant={user.role === ROLES.ADMIN ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {user.role === ROLES.ADMIN ? 'Pentadbir Utama' : 'Guru'}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {user.assignedClasses?.length || 0}{' '}
                            {user.assignedClasses?.length === 1 ? 'kelas' : 'kelas'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="break-all text-sm">{user.email}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={user.role === ROLES.ADMIN ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {user.role === ROLES.ADMIN ? 'Pentadbir Utama' : 'Guru'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      <span className="text-sm">
                        {user.assignedClasses?.length || 0}{' '}
                        {user.assignedClasses?.length === 1 ? 'kelas' : 'kelas'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          aria-label={`Sunting ${user.name}`}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-2">Sunting</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Padam ${user.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Padam</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* User Form Dialog */}
      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        formData={userForm}
        formErrors={userFormErrors}
        classes={classes}
        isEditing={isEditing}
        onSubmit={handleCreateOrUpdateUser}
        onChange={setUserForm}
        onReset={resetUserForm}
      />

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Padam Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Adakah anda pasti mahu memadam pengguna ini? Tindakan ini tidak boleh dibatalkan dan
              akan membuang akaun pengguna secara kekal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
