/**
 * Navigation Configurations
 */

import { LayoutDashboard, Users, GraduationCap, Calendar, History, UserCog } from 'lucide-react';

// Admin Navigation Groups
export const ADMIN_NAV_GROUPS = [
  {
    label: 'Papan Pemuka',
    items: [{ path: '/admin/dashboard', label: 'Papan Pemuka', icon: LayoutDashboard }],
  },
  {
    label: 'Pengurusan',
    items: [
      { path: '/admin/classes', label: 'Kelas', icon: GraduationCap },
      { path: '/admin/students', label: 'Murid', icon: Users },
      { path: '/admin/users', label: 'Pengguna', icon: UserCog },
      { path: '/admin/holidays', label: 'Cuti', icon: Calendar },
    ],
  },
  {
    label: 'Kehadiran',
    items: [{ path: '/admin/calendar', label: 'Kalendar', icon: Calendar }],
  },
  {
    label: 'Portal Guru',
    items: [
      { path: '/teacher/dashboard', label: 'Papan Pemuka', icon: LayoutDashboard },
      { path: '/teacher/classes', label: 'Kelas', icon: GraduationCap },
      { path: '/teacher/students', label: 'Murid', icon: Users },
      { path: '/teacher/history', label: 'Sejarah', icon: History },
    ],
  },
] as const;

// Teacher Navigation Groups
export const TEACHER_NAV_GROUPS = [
  {
    label: 'Papan Pemuka',
    items: [{ path: '/teacher/dashboard', label: 'Papan Pemuka', icon: LayoutDashboard }],
  },
  {
    label: 'Pengajaran',
    items: [
      { path: '/teacher/classes', label: 'Kelas', icon: GraduationCap },
      { path: '/teacher/students', label: 'Murid', icon: Users },
      { path: '/teacher/manage-students', label: 'Urus Murid', icon: UserCog },
    ],
  },
  {
    label: 'Kehadiran',
    items: [
      { path: '/teacher/history', label: 'Sejarah', icon: History },
      { path: '/teacher/calendar', label: 'Kalendar', icon: Calendar },
    ],
  },
] as const;

// Legacy flat arrays for backward compatibility
export const ADMIN_NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Papan Pemuka', icon: LayoutDashboard },
  { path: '/admin/classes', label: 'Kelas', icon: GraduationCap },
  { path: '/admin/users', label: 'Pengguna', icon: Users },
  { path: '/admin/holidays', label: 'Cuti', icon: Calendar },
  { path: '/admin/calendar', label: 'Kalendar', icon: Calendar },
] as const;

export const TEACHER_NAV_ITEMS = [
  { path: '/teacher/dashboard', label: 'Papan Pemuka', icon: LayoutDashboard },
  { path: '/teacher/classes', label: 'Kelas', icon: GraduationCap },
  { path: '/teacher/students', label: 'Murid', icon: Users },
  { path: '/teacher/manage-students', label: 'Urus Murid', icon: UserCog },
  { path: '/teacher/history', label: 'Sejarah', icon: History },
  { path: '/teacher/calendar', label: 'Kalendar', icon: Calendar },
] as const;
