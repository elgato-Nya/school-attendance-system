import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AttendanceStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  description?: string;
}

export function AttendanceStatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  description,
}: AttendanceStatCardProps) {
  const colorClasses = {
    default: 'text-gray-900 dark:text-white',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn('text-md md:text-3xl font-bold', colorClasses[variant])}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
