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

    const loadingToast = toast.loading(isEditing ? 'Updating user...' : 'Creating user...');
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

    const loadingToast = toast.loading('Deleting user...');
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
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage teachers and administrators</p>
        </div>
        <Button
          onClick={() => {
            resetUserForm();
            setUserFormOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search users"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users ({users.length})</SelectItem>
            <SelectItem value="admin">
              Admins ({users.filter((u) => u.role === ROLES.ADMIN).length})
            </SelectItem>
            <SelectItem value="teacher">
              Teachers ({users.filter((u) => u.role === ROLES.TEACHER).length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/20">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No users found</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {searchQuery || roleFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first user'}
          </p>
          {!searchQuery && roleFilter === 'all' && (
            <Button
              onClick={() => {
                resetUserForm();
                setUserFormOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add First User
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] sm:w-auto">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell text-center">Classes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            {user.role === ROLES.ADMIN ? 'Super Admin' : 'Teacher'}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {user.assignedClasses?.length || 0}{' '}
                            {user.assignedClasses?.length === 1 ? 'class' : 'classes'}
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
                        {user.role === ROLES.ADMIN ? 'Super Admin' : 'Teacher'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center">
                      <span className="text-sm">
                        {user.assignedClasses?.length || 0}{' '}
                        {user.assignedClasses?.length === 1 ? 'class' : 'classes'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          aria-label={`Edit ${user.name}`}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${user.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will
              permanently remove the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
