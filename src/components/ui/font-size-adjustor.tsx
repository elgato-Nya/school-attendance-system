import { Type, RotateCcw } from 'lucide-react';
import { useThemeStore, type FontSize } from '@/stores/themeStore';
import { AppearanceSelector } from '@/components/ui/appearance-selector';

export function FontSizeAdjustor() {
  const { fontSize, setFontSize } = useThemeStore();

  const fontSizeOptions = [
    {
      value: 'small' as FontSize,
      label: 'Small',
      description: 'Compact view',
      meta: '14px',
    },
    {
      value: 'medium' as FontSize,
      label: 'Medium',
      description: 'Default size',
      meta: '16px',
    },
    {
      value: 'large' as FontSize,
      label: 'Large',
      description: 'Comfortable reading',
      meta: '18px',
    },
    {
      value: 'xlarge' as FontSize,
      label: 'Extra Large',
      description: 'Maximum readability',
      meta: '20px',
    },
  ];

  return (
    <AppearanceSelector
      value={fontSize}
      options={fontSizeOptions}
      onChange={setFontSize}
      triggerIcon={Type}
      label="Font Size"
      width="sm"
      showIcons={false}
      highlightVariant="primary"
      footerAction={{
        label: 'Reset to default',
        icon: RotateCcw,
        onClick: () => setFontSize('medium'),
      }}
    />
  );
}
