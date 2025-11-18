/**
 * Navigation Configurations
 */

import { LayoutDashboard, Users, GraduationCap, Calendar, History, UserCog } from 'lucide-react';

// Admin Navigation Groups
export const ADMIN_NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [{ path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { path: '/admin/classes', label: 'Classes', icon: GraduationCap },
      { path: '/admin/students', label: 'Students', icon: Users },
      { path: '/admin/users', label: 'Users', icon: UserCog },
      { path: '/admin/holidays', label: 'Holidays', icon: Calendar },
    ],
  },
  {
    label: 'Attendance',
    items: [{ path: '/admin/calendar', label: 'Calendar', icon: Calendar }],
  },
  {
    label: 'Teacher Portal',
    items: [
      { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/teacher/classes', label: 'Classes', icon: GraduationCap },
      { path: '/teacher/students', label: 'Students', icon: Users },
      { path: '/teacher/history', label: 'History', icon: History },
    ],
  },
] as const;

// Teacher Navigation Groups
export const TEACHER_NAV_GROUPS = [
  {
    label: 'Dashboard',
    items: [{ path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Teaching',
    items: [
      { path: '/teacher/classes', label: 'Classes', icon: GraduationCap },
      { path: '/teacher/students', label: 'Students', icon: Users },
      { path: '/teacher/manage-students', label: 'Manage Students', icon: UserCog },
    ],
  },
  {
    label: 'Attendance',
    items: [
      { path: '/teacher/history', label: 'History', icon: History },
      { path: '/teacher/calendar', label: 'Calendar', icon: Calendar },
    ],
  },
] as const;

// Legacy flat arrays for backward compatibility
export const ADMIN_NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/classes', label: 'Classes', icon: GraduationCap },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/holidays', label: 'Holidays', icon: Calendar },
  { path: '/admin/calendar', label: 'Calendar', icon: Calendar },
] as const;

export const TEACHER_NAV_ITEMS = [
  { path: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/teacher/classes', label: 'Classes', icon: GraduationCap },
  { path: '/teacher/students', label: 'Students', icon: Users },
  { path: '/teacher/manage-students', label: 'Manage Students', icon: UserCog },
  { path: '/teacher/history', label: 'History', icon: History },
  { path: '/teacher/calendar', label: 'Calendar', icon: Calendar },
] as const;
