import type { MaintenanceForecastSummary } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MaintenanceForecastProps {
  summary: MaintenanceForecastSummary;
  currency: string;
  emphasis?: 'finance' | 'ops';
}

export function MaintenanceForecast({ summary, currency, emphasis }: MaintenanceForecastProps) {
  const formatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  });

  return (
    <Card
      className={cn(
        'h-full overflow-hidden',
        emphasis === 'ops' && 'ring-1 ring-amber-200 shadow-sm shadow-amber-100'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Maintenance forecast</CardTitle>
        <p className="text-sm text-muted-foreground">
          Next 30 days: {formatter.format(summary.monthlyEstimate)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary.next30Days.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services scheduled in the next 30 days.</p>
        ) : (
          summary.next30Days.slice(0, 4).map(service => (
            <div key={service.vehicleId} className="rounded-md border bg-background p-3 text-sm">
              <div className="flex items-start justify-between gap-2 font-medium">
                <span className="min-w-0">{service.vehicleLabel}</span>
                <span className="shrink-0">{formatter.format(service.estimate)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{service.serviceType}</p>
              <p className="text-xs text-muted-foreground">
                Due in {service.dueInDays} days · {service.dueInKm.toLocaleString()} km
              </p>
              <span
                className={cn(
                  'mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  service.riskLevel === 'high'
                    ? 'bg-rose-50 text-rose-700'
                    : service.riskLevel === 'medium'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                )}
              >
                {service.riskLevel.toUpperCase()} risk
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

