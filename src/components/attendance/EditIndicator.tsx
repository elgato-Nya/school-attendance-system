/**
 * Edit Indicator Component
 * Shows visual indicators when attendance has been edited
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Edit2, History } from 'lucide-react';
import { format } from 'date-fns';
import type { Attendance } from '@/types';
import { getEditCount, getLastEditor } from '@/utils/attendance/audit';

interface EditIndicatorProps {
  record: Attendance;
  variant?: 'badge' | 'icon' | 'full';
  className?: string;
}

export function EditIndicator({ record, variant = 'badge', className }: EditIndicatorProps) {
  const editCount = getEditCount(record);
  const lastEditor = getLastEditor(record);

  if (editCount === 0) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Edit2 className={`h-4 w-4 text-orange-600 ${className}`} aria-label="Edited" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              <p className="font-semibold">
                Edited {editCount} time{editCount > 1 ? 's' : ''}
              </p>
              {lastEditor && (
                <>
                  <p>Last edited by: {lastEditor.name}</p>
                  <p>On: {format(lastEditor.timestamp, 'dd/MM/yyyy HH:mm')}</p>
                  <p className="italic text-muted-foreground">"{lastEditor.reason}"</p>
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <div>
          <p className="font-medium">
            Edited {editCount} time{editCount > 1 ? 's' : ''}
          </p>
          {lastEditor && (
            <p className="text-xs text-muted-foreground">
              Last by {lastEditor.name} on {format(lastEditor.timestamp, 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: badge variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 ${className}`}>
            <History className="h-3 w-3" />
            {editCount} {editCount === 1 ? 'Edit' : 'Edits'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs max-w-xs">
            <p className="font-semibold">Edit History</p>
            {lastEditor && (
              <>
                <p>
                  Last edited by: <span className="font-medium">{lastEditor.name}</span>
                </p>
                <p>On: {format(lastEditor.timestamp, 'dd/MM/yyyy HH:mm:ss')}</p>
                <p className="italic text-muted-foreground pt-1 border-t border-border">
                  "{lastEditor.reason}"
                </p>
              </>
            )}
            <p className="text-muted-foreground pt-1 border-t border-border">
              Click to view full audit trail
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface EditWarningBannerProps {
  record: Attendance;
  className?: string;
}

export function EditWarningBanner({ record, className }: EditWarningBannerProps) {
  const editCount = getEditCount(record);
  const lastEditor = getLastEditor(record);

  if (editCount === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="font-medium text-sm text-orange-900 dark:text-orange-100">
            This attendance record has been edited {editCount} time{editCount > 1 ? 's' : ''}
          </p>
          {lastEditor && (
            <div className="text-xs text-orange-700 dark:text-orange-300 space-y-0.5">
              <p>
                <span className="font-medium">Last edited by:</span> {lastEditor.name}
              </p>
              <p>
                <span className="font-medium">Date:</span>{' '}
                {format(lastEditor.timestamp, 'dd MMMM yyyy, HH:mm:ss')}
              </p>
              <p>
                <span className="font-medium">Reason:</span>{' '}
                <span className="italic">"{lastEditor.reason}"</span>
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-2 border-t border-orange-200 dark:border-orange-800">
            Original submission by {record.submittedByName} on{' '}
            {format(record.timestamp.toDate(), 'dd MMMM yyyy, HH:mm:ss')}
          </p>
        </div>
      </div>
    </div>
  );
}
