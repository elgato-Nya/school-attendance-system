/**
 * Unified Layout Component
 * Single reusable layout for the entire platform
 */

import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ClipboardCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface LayoutProps {
  children?: ReactNode;
  /** Navigation groups for the navbar */
  navGroups: readonly {
    readonly label?: string;
    readonly items: readonly {
      readonly path: string;
      readonly label: string;
      readonly icon: LucideIcon;
    }[];
  }[];
  /** Text to display in the logo */
  logoText: string;
  /** Optional custom logo icon */
  logoIcon?: ReactNode;
  /** Home page path */
  homePath: string;
  /** Profile page path */
  profilePath: string;
  /** Settings page path */
  settingsPath: string;
  /** Use default school logo (S icon) */
  useSchoolLogo?: boolean;
}

export function Layout({
  children,
  navGroups,
  logoText,
  logoIcon,
  homePath,
  profilePath,
  settingsPath,
  useSchoolLogo = false,
}: LayoutProps) {
  // Default logo based on useSchoolLogo prop
  const defaultLogoIcon = useSchoolLogo ? (
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-sm flex-shrink-0">
      S
    </div>
  ) : (
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
      <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        navGroups={navGroups}
        logoText={logoText}
        logoIcon={logoIcon || defaultLogoIcon}
        homePath={homePath}
        profilePath={profilePath}
        settingsPath={settingsPath}
      />

      <main className="flex-1 container mx-auto px-4 py-6" role="main">
        {children || <Outlet />}
      </main>

      <Footer />
    </div>
  );
}
