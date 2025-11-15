import { useEffect, useState, useContext } from 'react';
import type { Theme } from '../contexts/theme-context';
import { ThemeProviderContext } from '../contexts/theme-context';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'school-attendance-theme',
  ...props
}: ThemeProviderProps) {
  // Migrate from old storage keys on first load
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for legacy theme storage and migrate
    const legacyThemeStorage = localStorage.getItem('theme-storage');
    if (legacyThemeStorage) {
      try {
        const parsed = JSON.parse(legacyThemeStorage);
        const legacyTheme = parsed.state?.theme;
        if (
          legacyTheme &&
          ['light', 'dark', 'high-contrast-light', 'high-contrast-dark'].includes(legacyTheme)
        ) {
          localStorage.setItem(storageKey, legacyTheme);
          // Clean up old keys
          localStorage.removeItem('theme-storage');
          localStorage.removeItem('theme');
          localStorage.removeItem('theme-mode');
          return legacyTheme;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes first
    root.classList.remove('light', 'dark', 'high-contrast');

    // Determine which theme to apply
    let appliedTheme = theme;
    if (theme === 'system') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme classes immediately
    if (appliedTheme === 'high-contrast-light') {
      root.classList.add('high-contrast');
    } else if (appliedTheme === 'high-contrast-dark') {
      root.classList.add('dark', 'high-contrast');
    } else {
      root.classList.add(appliedTheme);
    }

    // Force a style recalculation to ensure CSS variables update
    void root.offsetHeight;

    // Dispatch a custom event to notify components of theme change
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: appliedTheme } }));
  }, [theme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
