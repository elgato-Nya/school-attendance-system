/**
 * Reusable Class Card Component
 * Mobile-first design with consistent styling
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, UserCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClassCardProps {
  name: string;
  grade: number;
  studentCount: number;
  teacherName?: string;
  statusBadge?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  secondaryActions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ClassCard({
  name,
  grade,
  studentCount,
  teacherName,
  statusBadge,
  primaryAction,
  secondaryActions,
  onClick,
  className,
}: ClassCardProps) {
  return (
    <Card
      className={cn(
        'h-full transition-all hover:shadow-md hover:border-primary',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl group-hover:text-primary transition-colors truncate">
              {name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 mt-1">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Tingkatan {grade}</span>
            </CardDescription>
          </div>
          {statusBadge && <div className="shrink-0">{statusBadge}</div>}
          {secondaryActions && <div className="shrink-0">{secondaryActions}</div>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Student Count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-medium text-foreground">{studentCount}</span>{' '}
            {studentCount === 1 ? 'murid' : 'murid'}
          </span>
        </div>

        {/* Teacher Name */}
        {teacherName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{teacherName}</span>
          </div>
        )}

        {/* Primary Action Button */}
        {primaryAction && (
          <Button
            variant={primaryAction.variant || 'default'}
            onClick={(e) => {
              e.stopPropagation();
              primaryAction.onClick();
            }}
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            {primaryAction.label}
            <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
