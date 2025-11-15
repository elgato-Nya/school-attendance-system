import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  // Determine the actual theme to use (handle system and high-contrast)
  const getToastTheme = (): ToasterProps['theme'] => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (theme === 'high-contrast-light') {
      return 'light';
    }
    if (theme === 'high-contrast-dark' || theme === 'dark') {
      return 'dark';
    }
    return 'light';
  };

  return (
    <Sonner
      theme={getToastTheme()}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          success:
            'group-[.toast]:bg-success group-[.toast]:text-success-foreground group-[.toast]:border-success',
          error:
            'group-[.toast]:bg-destructive group-[.toast]:text-destructive-foreground group-[.toast]:border-destructive',
          warning:
            'group-[.toast]:bg-warning group-[.toast]:text-warning-foreground group-[.toast]:border-warning',
          info: 'group-[.toast]:bg-info group-[.toast]:text-info-foreground group-[.toast]:border-info',
        },
      }}
      style={
        {
          '--normal-bg': 'hsl(var(--popover))',
          '--normal-text': 'hsl(var(--popover-foreground))',
          '--normal-border': 'hsl(var(--border))',
          '--success-bg': 'hsl(var(--success))',
          '--success-text': 'hsl(var(--success-foreground))',
          '--error-bg': 'hsl(var(--destructive))',
          '--error-text': 'hsl(var(--destructive-foreground))',
          '--warning-bg': 'hsl(var(--warning))',
          '--warning-text': 'hsl(var(--warning-foreground))',
          '--info-bg': 'hsl(var(--info))',
          '--info-text': 'hsl(var(--info-foreground))',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
