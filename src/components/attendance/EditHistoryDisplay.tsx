/**
 * Edit History Display Component
 * Shows audit trail of attendance edits
 */

import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, User, Calendar, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import type { EditHistory } from '@/types';
import { getSummaryChanges } from '@/utils/attendance/audit';

interface EditHistoryDisplayProps {
  editHistory: EditHistory[];
  currentSummary: {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    rate: number;
  };
  className?: string;
}

export function EditHistoryDisplay({
  editHistory,
  currentSummary,
  className,
}: EditHistoryDisplayProps) {
  if (!editHistory || editHistory.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Edit History
          </CardTitle>
          <CardDescription>No edits have been made to this attendance record.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Edit History
          <Badge variant="secondary" className="ml-auto">
            {editHistory.length} {editHistory.length === 1 ? 'Edit' : 'Edits'}
          </Badge>
        </CardTitle>
        <CardDescription>Complete audit trail of all modifications</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {editHistory.map((edit, index) => {
              const isLastEdit = index === editHistory.length - 1;
              const changes = isLastEdit
                ? getSummaryChanges(edit.previousSummary, currentSummary)
                : editHistory[index + 1]
                  ? getSummaryChanges(edit.previousSummary, editHistory[index + 1].previousSummary)
                  : null;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          Edit #{editHistory.length - index}
                        </Badge>
                        {isLastEdit && (
                          <Badge variant="default" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{edit.editedByName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{format(edit.editedAt.toDate(), 'dd MMM yyyy, HH:mm:ss')}</span>
                      </div>

                      <div className="flex items-start gap-2 text-sm mt-2">
                        <FileText className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground italic">"{edit.reason}"</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Changes */}
                  {changes && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Changes Made:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {changes.present !== 0 && (
                          <div className="flex items-center gap-1">
                            {changes.present > 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span>
                              Present: {changes.present > 0 ? '+' : ''}
                              {changes.present}
                            </span>
                          </div>
                        )}
                        {changes.late !== 0 && (
                          <div className="flex items-center gap-1">
                            {changes.late > 0 ? (
                              <TrendingUp className="h-3 w-3 text-orange-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span>
                              Late: {changes.late > 0 ? '+' : ''}
                              {changes.late}
                            </span>
                          </div>
                        )}
                        {changes.absent !== 0 && (
                          <div className="flex items-center gap-1">
                            {changes.absent > 0 ? (
                              <TrendingUp className="h-3 w-3 text-red-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-green-600" />
                            )}
                            <span>
                              Absent: {changes.absent > 0 ? '+' : ''}
                              {changes.absent}
                            </span>
                          </div>
                        )}
                        {changes.rate !== 0 && (
                          <div className="flex items-center gap-1">
                            {changes.rate > 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            )}
                            <span>
                              Rate: {changes.rate > 0 ? '+' : ''}
                              {changes.rate.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                        Previous Rate: {edit.previousSummary.rate.toFixed(1)}%
                      </div>
                    </div>
                  )}

                  {index < editHistory.length - 1 && <Separator className="my-4" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
