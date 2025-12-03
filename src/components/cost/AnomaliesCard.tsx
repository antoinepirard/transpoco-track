import type { FuelAnomalySummary } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnomaliesCardProps {
  summary: FuelAnomalySummary;
  currency: string;
  emphasis?: 'finance' | 'ops';
}

export function AnomaliesCard({ summary, currency, emphasis }: AnomaliesCardProps) {
  const formatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  });

  return (
    <Card
      className={cn(
        'h-full overflow-hidden',
        emphasis === 'ops' && 'ring-1 ring-rose-200 shadow-sm shadow-rose-100'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Fuel anomalies</CardTitle>
          <Badge variant="secondary">{summary.unresolvedCount} open</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Cross-checks fuel card vs telematics</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.anomalies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No anomalies in the last 30 days.</p>
        ) : (
          summary.anomalies.slice(0, 4).map(anomaly => (
            <div key={anomaly.id} className="rounded-md border bg-background p-3 text-sm">
              <div className="flex items-start justify-between gap-2 font-medium">
                <span className="min-w-0">{anomaly.vehicleLabel}</span>
                <span className="shrink-0">{formatter.format(anomaly.impact)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{anomaly.description}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="capitalize text-muted-foreground">{anomaly.type.replace('-', ' ')}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-semibold',
                    anomaly.status === 'open'
                      ? 'bg-rose-50 text-rose-700'
                      : anomaly.status === 'investigating'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                  )}
                >
                  {anomaly.status}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

