/**
 * Teacher layout wrapper
 * Uses the unified Layout component with grouped navigation
 * Dynamically selects navigation based on user role
 */

import { Layout } from '@/components/Layout';
import { ADMIN_NAV_GROUPS, TEACHER_NAV_GROUPS } from '@/constants/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

interface TeacherLayoutProps {
  children?: ReactNode;
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const { isAdmin } = useAuth();

  // Select navigation groups and paths based on user role
  const navGroups = isAdmin ? ADMIN_NAV_GROUPS : TEACHER_NAV_GROUPS;
  const homePath = isAdmin ? '/admin/dashboard' : '/teacher/dashboard';
  const profilePath = isAdmin ? '/admin/profile' : '/teacher/profile';
  const settingsPath = isAdmin ? '/admin/settings' : '/teacher/settings';

  return (
    <Layout
      navGroups={navGroups}
      logoText="Attendance System"
      homePath={homePath}
      profilePath={profilePath}
      settingsPath={settingsPath}
      useSchoolLogo={false}
    >
      {children}
    </Layout>
  );
}
