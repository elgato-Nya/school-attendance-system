/**
 * Hook for managing color theme palettes
 */

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/theme-provider';

export type ColourPalette = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red';

const palettes = {
  default: {
    light: { primary: '222.2 47.4% 11.2%', accent: '210 40% 96.1%' },
    dark: { primary: '210 40% 98%', accent: '217.2 32.6% 17.5%' },
  },
  blue: {
    light: { primary: '221.2 83.2% 53.3%', accent: '210 40% 96.1%' },
    dark: { primary: '217.2 91.2% 59.8%', accent: '217.2 32.6% 17.5%' },
  },
  green: {
    light: { primary: '142.1 76.2% 36.3%', accent: '138.5 76.5% 96.7%' },
    dark: { primary: '142.1 70.6% 45.3%', accent: '140 40% 15%' },
  },
  purple: {
    light: { primary: '262.1 83.3% 57.8%', accent: '270 100% 98%' },
    dark: { primary: '263.4 70% 50.4%', accent: '260 40% 15%' },
  },
  orange: {
    light: { primary: '24.6 95% 53.1%', accent: '33.3 100% 96.5%' },
    dark: { primary: '20.5 90.2% 48.2%', accent: '20 40% 15%' },
  },
  red: {
    light: { primary: '0 72.2% 50.6%', accent: '0 85.7% 97.3%' },
    dark: { primary: '0 72.2% 50.6%', accent: '0 40% 15%' },
  },
};

export function useColourTheme() {
  const { theme } = useTheme();
  const [palette, setPalette] = useState<ColourPalette>(
    () => (localStorage.getItem('color-palette') as ColourPalette) || 'default'
  );

  // Update CSS variables when palette or theme changes
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const colors = palettes[palette][isDark ? 'dark' : 'light'];

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
  }, [palette, theme]); // Added theme dependency

  const setColourPalette = (newPalette: ColourPalette) => {
    localStorage.setItem('color-palette', newPalette);
    setPalette(newPalette);
  };

  return { palette, setColourPalette };
}
