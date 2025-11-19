/**
 * User Profile Page
 * Display and edit user profile information
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { updateUser } from '@/services/user/user.service';
import { changeEmail, changePassword, login } from '@/services/auth.service';
import { getAuthErrorMessage } from '@/services/auth.service';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Save,
  Edit,
  X,
  GraduationCap,
  Clock,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update name in Firestore
      if (formData.name !== user.name) {
        await updateUser(user.id, { name: formData.name });
      }

      // Update email in both Firebase Auth and Firestore
      if (formData.email !== user.email) {
        await changeEmail(formData.email);
        await updateUser(user.id, { email: formData.email });
      }

      // Refresh user data from Firestore
      await refreshUser();

      toast.success('Profil berjaya dikemas kini');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Kata laluan baharu tidak sepadan');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Kata laluan mesti sekurang-kurangnya 6 aksara');
      return;
    }

    setIsChangingPassword(true);
    try {
      // First, re-authenticate the user with current password
      await login(user.email, passwordData.currentPassword);

      // Then change the password
      await changePassword(passwordData.newPassword);

      toast.success('Kata laluan berjaya ditukar');
      setIsPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'teacher':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-8 w-8" aria-hidden="true" />
              Profil Saya
            </h1>
            <p className="text-muted-foreground mt-2">Lihat dan urus maklumat akaun anda</p>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              aria-label="Sunting profil"
            >
              <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
              Sunting Profil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving} aria-label="Simpan perubahan">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" aria-hidden="true" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
                aria-label="Batal penyuntingan"
              >
                <X className="h-4 w-4 mr-2" aria-hidden="true" />
                Batal
              </Button>
            </div>
          )}
        </div>

        {/* Profile Information Card */}
        <Card role="region" aria-labelledby="personal-info-title">
          <CardHeader>
            <CardTitle id="personal-info-title">Maklumat Peribadi</CardTitle>
            <CardDescription>Butiran akaun asas dan maklumat hubungan anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Avatar Section */}
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg"
                role="img"
                aria-label={`Profile picture for ${user.name}`}
              >
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant={getRoleBadgeColor(user.role)} className="mt-2">
                  <Shield className="h-3 w-3 mr-1" aria-hidden="true" />
                  {user.role}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Editable Fields */}
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" aria-hidden="true" />
                  Nama Penuh
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama penuh anda"
                    aria-required="true"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                    {user.name || 'Tidak ditetapkan'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Alamat Emel
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Masukkan emel anda"
                    aria-required="true"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                    {user.email || 'Tidak ditetapkan'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Peranan
                </Label>
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md capitalize">
                  {user.role || 'Tidak ditetapkan'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Peranan anda tidak boleh diubah. Hubungi pentadbir untuk pengubahsuaian peranan.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Activity Card */}
        <Card role="region" aria-labelledby="activity-title">
          <CardHeader>
            <CardTitle id="activity-title">Aktiviti Akaun</CardTitle>
            <CardDescription>Aktiviti terkini dan statistik penggunaan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <dt className="text-sm font-medium">Ahli Sejak</dt>
                  <dd className="text-xs text-muted-foreground">
                    {user.createdAt
                      ? new Date(user.createdAt.toDate()).toLocaleDateString()
                      : 'T/A'}
                  </dd>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div
                  className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <dt className="text-sm font-medium">Aktif Terakhir</dt>
                  <dd className="text-xs text-muted-foreground">Baru sahaja</dd>
                </div>
              </div>

              {user.role === 'teacher' && user.assignedClasses && (
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div
                    className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <GraduationCap className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium">Kelas Ditugaskan</dt>
                    <dd className="text-xs text-muted-foreground">
                      {user.assignedClasses.length}{' '}
                      {user.assignedClasses.length === 1 ? 'kelas' : 'kelas'}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card role="region" aria-labelledby="security-title">
          <CardHeader>
            <CardTitle id="security-title">Keselamatan</CardTitle>
            <CardDescription>Urus kata laluan dan tetapan keselamatan anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <dt className="text-sm font-medium">Kata Laluan</dt>
                  <dd className="text-sm text-muted-foreground">
                    Pastikan akaun anda selamat dengan kata laluan yang kukuh
                  </dd>
                </div>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Lock className="h-4 w-4 mr-2" />
                      Tukar Kata Laluan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Tukar Kata Laluan</DialogTitle>
                      <DialogDescription>
                        Masukkan kata laluan semasa anda dan pilih kata laluan baharu.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Kata Laluan Semasa</Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, currentPassword: e.target.value })
                            }
                            placeholder="Masukkan kata laluan semasa"
                            disabled={isChangingPassword}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            disabled={isChangingPassword}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Kata Laluan Baharu</Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, newPassword: e.target.value })
                            }
                            placeholder="Masukkan kata laluan baharu"
                            disabled={isChangingPassword}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isChangingPassword}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Kata laluan mesti sekurang-kurangnya 6 aksara
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Sahkan Kata Laluan Baharu</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                            }
                            placeholder="Sahkan kata laluan baharu"
                            disabled={isChangingPassword}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isChangingPassword}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(false)}
                        disabled={isChangingPassword}
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        onClick={handlePasswordChange}
                        disabled={
                          isChangingPassword ||
                          !passwordData.currentPassword ||
                          !passwordData.newPassword ||
                          !passwordData.confirmPassword
                        }
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Menukar...
                          </>
                        ) : (
                          'Tukar Kata Laluan'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <dt className="text-sm font-medium">Pengesahan Dua Faktor</dt>
                  <dd className="text-sm text-muted-foreground">
                    Tambah lapisan keselamatan tambahan
                  </dd>
                </div>
                <Button variant="outline" size="sm" disabled aria-disabled="true">
                  Aktifkan 2FA (Tidak Lama Lagi)
                </Button>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
