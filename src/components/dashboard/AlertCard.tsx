import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface Alert {
  id: string;
  classId: string;
  className: string;
  grade: number;
  rate: number;
  date: string;
  severity: 'high' | 'medium' | 'low';
}

interface AlertCardProps {
  alerts: Alert[];
  onViewClass?: (classId: string) => void;
}

export function AlertCard({ alerts, onViewClass }: AlertCardProps) {
  const getSeverityVariant = (severity: string): 'destructive' | 'warning' | 'secondary' => {
    if (severity === 'high') return 'destructive';
    if (severity === 'medium') return 'warning';
    return 'secondary';
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
          Low Attendance Alerts
          {alerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-4 shadow-elevation-sm">
              <AlertTriangle className="h-8 w-8 text-success" aria-hidden="true" />
            </div>
            <p className="text-base font-semibold text-foreground mb-2">All classes doing well!</p>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              No attendance alerts at this time
            </p>
          </div>
        ) : (
          <div
            className="space-y-3 max-h-[400px] overflow-y-auto"
            role="list"
            aria-label="Low attendance alerts"
          >
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors"
                role="listitem"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{alert.className}</p>
                    <Badge variant={getSeverityVariant(alert.severity)} className="text-xs">
                      {alert.rate}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Grade {alert.grade} • {new Date(alert.date).toLocaleDateString()}
                  </p>
                </div>
                {onViewClass && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewClass(alert.classId)}
                    aria-label={`View details for ${alert.className}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
