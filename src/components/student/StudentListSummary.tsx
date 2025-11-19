import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SummaryStats {
  total: number;
  excellent: number;
  good: number;
  atRisk: number;
}

interface StudentListSummaryProps {
  stats: SummaryStats;
}

export default function StudentListSummary({ stats }: StudentListSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ringkasan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Jumlah Murid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--success))' }}>
              {stats.excellent}
            </div>
            <div className="text-sm text-muted-foreground">Cemerlang (≥90%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--warning))' }}>
              {stats.good}
            </div>
            <div className="text-sm text-muted-foreground">Baik (75-89%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'hsl(var(--destructive))' }}>
              {stats.atRisk}
            </div>
            <div className="text-sm text-muted-foreground">Berisiko (&lt;75%)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
