/**
 * Loading spinner component - reusable loading state
 */

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Memuatkan...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
