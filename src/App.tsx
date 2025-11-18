import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { TeacherLayout } from '@/components/TeacherLayout';
import { ADMIN_NAV_GROUPS } from '@/utils/constants';
import { Login } from '@/pages/Login';
import { Settings } from '@/pages/Settings';
import { Profile } from '@/pages/Profile';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { ClassManagement } from '@/pages/admin/ClassManagement';
import { UserManagement } from '@/pages/admin/UserManagement';
import { HolidayManagement } from '@/pages/admin/HolidayManagement';
import { StudentManagement } from '@/pages/admin/StudentManagement';
import CalendarPage from '@/pages/Calendar';
import { TeacherDashboard } from '@/pages/teacher/Dashboard';
import ClassSelection from '@/pages/teacher/ClassSelection';
import MarkAttendance from '@/pages/teacher/MarkAttendance';
import StudentList from '@/pages/teacher/StudentList';
import ManageStudents from '@/pages/teacher/ManageStudents';
import AttendanceHistory from '@/pages/teacher/AttendanceHistory';
import { Toaster } from '@/components/ui/sonner';
import { ROLES } from '@/utils/constants';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="school-attendance-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <ClassManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/holidays"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <HolidayManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/calendar"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <CalendarPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <StudentManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Settings routes */}
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/settings"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <Settings />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            {/* Profile routes */}
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <Layout
                    navGroups={ADMIN_NAV_GROUPS}
                    logoText="SMK Taman Melawati"
                    homePath="/admin/dashboard"
                    profilePath="/admin/profile"
                    settingsPath="/admin/settings"
                    useSchoolLogo={true}
                  >
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/profile"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <Profile />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <TeacherDashboard />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <ClassSelection />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <StudentList />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/manage-students"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <ManageStudents />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/history"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <AttendanceHistory />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/calendar"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <CalendarPage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/mark-attendance/:classId"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.ADMIN]}>
                  <TeacherLayout>
                    <MarkAttendance />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
