/**
 * Empty state component - reusable for any empty list
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ComponentType } from 'react';

interface EmptyStateProps {
  icon?: ComponentType<any>;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center">
          {Icon && (
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-muted/10">
              <Icon className="h-6 w-6 text-muted-foreground" aria-hidden />
            </div>
          )}
          {title ? <h3 className="text-lg font-semibold mb-1">{title}</h3> : null}
          {description ? <p className="text-muted-foreground mb-4">{description}</p> : null}
          {actionLabel && onAction ? (
            <div>
              <Button onClick={onAction}>{actionLabel}</Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
