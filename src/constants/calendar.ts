/**
 * Calendar Color Constants
 * Centralized color configuration for all calendar-related components
 * Uses CSS variables for theme responsiveness
 */

/**
 * Attendance Rate Color Thresholds
 */
export const ATTENDANCE_THRESHOLDS = {
  EXCELLENT: 95, // >= 95%
  GOOD: 85, // >= 85%
  POOR: 0, // < 85%
} as const;

/**
 * Calendar Color Variables (CSS Variable Names)
 * These reference colors defined in index.css that adapt to theme
 */
export const CALENDAR_COLORS = {
  // Attendance colors - auto-adapt to light/dark theme
  ATTENDANCE_EXCELLENT: 'hsl(var(--success))',
  ATTENDANCE_EXCELLENT_FOREGROUND: 'hsl(var(--success-foreground))',

  ATTENDANCE_GOOD: 'hsl(var(--warning))',
  ATTENDANCE_GOOD_FOREGROUND: 'hsl(var(--warning-foreground))',

  ATTENDANCE_POOR: 'hsl(var(--poor-attendance))',
  ATTENDANCE_POOR_FOREGROUND: 'hsl(var(--poor-attendance-foreground))',

  // Holiday colors - auto-adapt to light/dark theme
  HOLIDAY_PUBLIC: 'hsl(var(--holiday-public))',
  HOLIDAY_SCHOOL: 'hsl(var(--holiday-school))',
  HOLIDAY_EVENT: 'hsl(var(--holiday-event))',
  HOLIDAY_FOREGROUND: 'hsl(var(--primary-foreground))',

  // Other calendar colors
  WEEKEND: 'hsl(var(--muted))',
  WEEKEND_FOREGROUND: 'hsl(var(--muted-foreground))',

  NO_DATA: 'hsl(var(--background))',
  NO_DATA_FOREGROUND: 'hsl(var(--foreground))',
} as const;

/**
 * Holiday Type Definitions
 */
export const HOLIDAY_TYPES = {
  PUBLIC: 'public',
  SCHOOL: 'school',
  EVENT: 'event',
} as const;

export type HolidayType = (typeof HOLIDAY_TYPES)[keyof typeof HOLIDAY_TYPES];

/**
 * Holiday Card Colors (for HolidayCard component)
 * Maps holiday types to their visual representation
 */
export const HOLIDAY_CARD_COLORS = {
  [HOLIDAY_TYPES.PUBLIC]: {
    leftBorder: CALENDAR_COLORS.HOLIDAY_PUBLIC,
    badge: 'destructive' as const,
    label: 'Public Holiday',
  },
  [HOLIDAY_TYPES.SCHOOL]: {
    leftBorder: CALENDAR_COLORS.HOLIDAY_SCHOOL,
    badge: 'default' as const,
    label: 'School Holiday',
  },
  [HOLIDAY_TYPES.EVENT]: {
    leftBorder: CALENDAR_COLORS.HOLIDAY_EVENT,
    badge: 'secondary' as const,
    label: 'School Event',
  },
} as const;

/**
 * Chart Colors for Reports (consistent with attendance colors)
 */
export const CHART_COLORS = {
  PRESENT: CALENDAR_COLORS.ATTENDANCE_EXCELLENT,
  LATE: CALENDAR_COLORS.ATTENDANCE_GOOD,
  ABSENT: CALENDAR_COLORS.ATTENDANCE_POOR,
} as const;

/**
 * Helper function to get attendance color based on rate
 */
export function getAttendanceColor(rate: number): {
  background: string;
  foreground: string;
  label: string;
} {
  if (rate >= ATTENDANCE_THRESHOLDS.EXCELLENT) {
    return {
      background: CALENDAR_COLORS.ATTENDANCE_EXCELLENT,
      foreground: CALENDAR_COLORS.ATTENDANCE_EXCELLENT_FOREGROUND,
      label: 'Excellent',
    };
  }

  if (rate >= ATTENDANCE_THRESHOLDS.GOOD) {
    return {
      background: CALENDAR_COLORS.ATTENDANCE_GOOD,
      foreground: CALENDAR_COLORS.ATTENDANCE_GOOD_FOREGROUND,
      label: 'Good',
    };
  }

  return {
    background: CALENDAR_COLORS.ATTENDANCE_POOR,
    foreground: CALENDAR_COLORS.ATTENDANCE_POOR_FOREGROUND,
    label: 'Needs Attention',
  };
}

/**
 * Helper function to get holiday color
 */
export function getHolidayColor(type: HolidayType): {
  background: string;
  foreground: string;
  label: string;
} {
  const colors = {
    [HOLIDAY_TYPES.PUBLIC]: {
      background: CALENDAR_COLORS.HOLIDAY_PUBLIC,
      foreground: CALENDAR_COLORS.HOLIDAY_FOREGROUND,
      label: 'Public Holiday',
    },
    [HOLIDAY_TYPES.SCHOOL]: {
      background: CALENDAR_COLORS.HOLIDAY_SCHOOL,
      foreground: CALENDAR_COLORS.HOLIDAY_FOREGROUND,
      label: 'School Holiday',
    },
    [HOLIDAY_TYPES.EVENT]: {
      background: CALENDAR_COLORS.HOLIDAY_EVENT,
      foreground: CALENDAR_COLORS.HOLIDAY_FOREGROUND,
      label: 'School Event',
    },
  };

  return colors[type];
}

/**
 * Customization Guide:
 *
 * To customize calendar colors:
 * 1. Open src/index.css
 * 2. Find the :root section for light theme
 * 3. Modify the CSS variables:
 *    - --success: Color for excellent attendance (>=95%)
 *    - --warning: Color for good attendance (85-95%)
 *    - --poor-attendance: Color for poor attendance (<85%)
 *    - --holiday-public: Color for public holidays
 *    - --holiday-school: Color for school holidays
 *    - --holiday-event: Color for school events
 * 4. Repeat for .dark section for dark theme colors
 *
 * Color format: HSL values without the hsl() wrapper
 * Example: --success: 142 76% 36% (hue saturation lightness)
 *
 * Recommended color families:
 * - Red: 0-15 degrees
 * - Orange: 15-45 degrees
 * - Yellow: 45-60 degrees
 * - Green: 90-150 degrees
 * - Blue: 200-240 degrees
 * - Purple: 270-300 degrees
 */
