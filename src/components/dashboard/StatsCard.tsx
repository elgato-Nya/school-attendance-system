import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default',
  loading = false,
}: StatsCardProps) {
  const variantClasses = {
    default: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    success: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
    info: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  };

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-3 w-3" />;
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-gray-500 dark:text-gray-400';
    if (change > 0) return 'text-green-600 dark:text-green-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            {change !== undefined && changeLabel && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span>
                  {Math.abs(change)}% {changeLabel}
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              variantClasses[variant]
            )}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
