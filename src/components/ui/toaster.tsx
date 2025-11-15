import { Toaster as HotToaster } from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === 'dark' ? '#1f2937' : '#ffffff',
          color: theme === 'dark' ? '#f9fafb' : '#111827',
          border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
}
