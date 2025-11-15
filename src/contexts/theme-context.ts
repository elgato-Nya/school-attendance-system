import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system' | 'high-contrast-light' | 'high-contrast-dark';

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
