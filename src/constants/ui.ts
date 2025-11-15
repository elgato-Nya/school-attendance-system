/**
 * UI and Application Constants
 */

// School Name
export const SCHOOL_NAME = import.meta.env.VITE_SCHOOL_NAME || 'SMK Taman Melawati';

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Refresh Intervals
export const METRICS_REFRESH_INTERVAL = 600000; // 10 minutes in ms

// Theme Options
export const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    description: 'Default bright theme',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Easy on the eyes',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Matches your device',
  },
  {
    value: 'high-contrast-light',
    label: 'High Contrast Light',
    description: 'Maximum readability',
  },
  {
    value: 'high-contrast-dark',
    label: 'High Contrast Dark',
    description: 'Maximum readability (dark)',
  },
] as const;

export const FONT_SIZE_OPTIONS = [
  {
    value: 'small',
    label: 'Small',
    description: 'Compact view',
    meta: '14px',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Default size',
    meta: '16px',
  },
  {
    value: 'large',
    label: 'Large',
    description: 'Comfortable reading',
    meta: '18px',
  },
  {
    value: 'xlarge',
    label: 'Extra Large',
    description: 'Maximum readability',
    meta: '20px',
  },
] as const;
