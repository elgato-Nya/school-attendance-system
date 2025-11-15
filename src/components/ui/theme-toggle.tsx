import { Moon, Sun, Monitor, Eye, Palette } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import type { Theme } from '@/contexts/theme-context';
import { AppearanceSelector } from '@/components/ui/appearance-selector';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light' as Theme,
      label: 'Light',
      description: 'Default bright theme',
      icon: <Sun className="h-4 w-4" />,
    },
    {
      value: 'dark' as Theme,
      label: 'Dark',
      description: 'Easy on the eyes',
      icon: <Moon className="h-4 w-4" />,
    },
    {
      value: 'system' as Theme,
      label: 'System',
      description: 'Matches your device',
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      value: 'high-contrast-light' as Theme,
      label: 'High Contrast Light',
      description: 'Maximum readability',
      icon: <Eye className="h-4 w-4" />,
    },
    {
      value: 'high-contrast-dark' as Theme,
      label: 'High Contrast Dark',
      description: 'Maximum readability (dark)',
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  return (
    <AppearanceSelector
      value={theme}
      options={themeOptions}
      onChange={setTheme}
      triggerIcon={Palette}
      label="Theme"
      width="md"
      showIcons={true}
      highlightVariant="accent"
    />
  );
}
