/**
 * Reusable Class Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface ClassStatusBadgeProps {
  submitted: boolean;
}

export function ClassStatusBadge({ submitted }: ClassStatusBadgeProps) {
  if (!submitted) return null;

  return (
    <Badge
      variant="secondary"
      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 flex items-center gap-1"
    >
      <CheckCircle2 className="h-3 w-3" />
      Diserahkan
    </Badge>
  );
}
