import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface AttendanceStatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
}

export function AttendanceStatCard({
  title,
  value,
  icon: Icon,
  description,
}: AttendanceStatCardProps) {
  return (
    <Card>
      <CardContent className="my-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-md md:text-3xl font-bold text-foreground">{value}</p>
            {description && <p className="text-xs text-foreground">{description}</p>}
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
