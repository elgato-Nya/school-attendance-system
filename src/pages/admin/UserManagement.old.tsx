/**
 * User Management page for admins
 */

import { useState, useEffect } from 'react';
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
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/user/user.service';
import { getAllClasses } from '@/services/class/class.service';
import type { User, UserFormData, Class } from '@/types';
import { validateUserForm } from '@/utils/validators';
import { toast, parseError, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/toast';
import { UserCard } from '@/components/admin/UserCard';
import { UserFormDialog } from '@/components/admin/UserFormDialog';
import { UserFilterTabs } from '@/components/admin/UserFilterTabs';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { ROLES } from '@/utils/constants';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'teacher'>('all');

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

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === ROLES.ADMIN).length,
    teacher: users.filter((u) => u.role === ROLES.TEACHER).length,
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage teachers and administrators</p>
        </div>
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
      </div>

      {/* Filter Tabs */}
      <UserFilterTabs activeFilter={filter} onFilterChange={setFilter} counts={counts} />

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          description={
            filter === 'all'
              ? 'No users yet. Create your first user to get started!'
              : `No ${filter}s found.`
          }
          actionLabel="Add User"
          onAction={() => setUserFormOpen(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
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
