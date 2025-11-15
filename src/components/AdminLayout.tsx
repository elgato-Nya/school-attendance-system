/**
 * Admin layout wrapper
 * Uses the unified Layout component with grouped navigation
 */

import { Layout } from '@/components/Layout';
import { ADMIN_NAV_GROUPS } from '@/utils/constants';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Layout
      navGroups={ADMIN_NAV_GROUPS}
      logoText="SMK Taman Melawati"
      homePath="/admin/dashboard"
      profilePath="/admin/profile"
      settingsPath="/admin/settings"
      useSchoolLogo={true}
    >
      {children}
    </Layout>
  );
}
