import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'high-contrast-light' | 'high-contrast-dark';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface ThemeStore {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'medium',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      setFontSize: (fontSize) => {
        set({ fontSize });
        applyFontSize(fontSize);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
          applyFontSize(state.fontSize);
        }
      },
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove('light', 'dark', 'high-contrast');

  // Apply new theme
  switch (theme) {
    case 'light':
      // Light is default, no class needed
      break;
    case 'dark':
      root.classList.add('dark');
      break;
    case 'high-contrast-light':
      root.classList.add('high-contrast');
      break;
    case 'high-contrast-dark':
      root.classList.add('dark', 'high-contrast');
      break;
  }
}

function applyFontSize(fontSize: FontSize) {
  const root = document.documentElement;

  // Remove all font size classes
  root.classList.remove(
    'font-size-small',
    'font-size-medium',
    'font-size-large',
    'font-size-xlarge'
  );

  // Apply new font size
  root.classList.add(`font-size-${fontSize}`);
}

// Initialize theme on app load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      applyTheme(state.theme || 'light');
      applyFontSize(state.fontSize || 'medium');
    } catch (e) {
      // Ignore parse errors, use defaults
    }
  }
}
