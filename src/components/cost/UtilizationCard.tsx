import type { UtilizationSummary } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UtilizationCardProps {
  summary: UtilizationSummary;
  emphasis?: 'finance' | 'ops';
}

export function UtilizationCard({ summary, emphasis }: UtilizationCardProps) {
  const utilizationPercent = Math.round((summary.utilizationRate ?? 0) * 100);

  return (
    <Card
      className={cn(
        'h-full overflow-hidden',
        emphasis === 'ops' && 'ring-1 ring-sky-200 shadow-sm shadow-sky-100'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Utilisation</CardTitle>
        <p className="text-sm text-muted-foreground">
          {summary.rightSizingOpportunity} vehicles can be redeployed
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Fleet utilisation</span>
            <span>{utilizationPercent}%</span>
          </div>
          <Progress value={utilizationPercent} className="mt-1 h-2" />
          <p className="text-xs text-muted-foreground">
            Threshold for underuse: {summary.inactiveThresholdDays} idle days
          </p>
        </div>

        <div className="rounded-md border bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Inactive vehicles
          </p>
          <p className="text-2xl font-semibold">
            {summary.inactiveVehicles}{' '}
            <span className="text-sm font-normal text-muted-foreground">parked & costing money</span>
          </p>
        </div>

        {summary.inactiveVehiclesList.length === 0 ? (
          <p className="text-sm text-muted-foreground">All vehicles active in the last {summary.inactiveThresholdDays} days.</p>
        ) : (
          <ul className="space-y-2">
            {summary.inactiveVehiclesList.slice(0, 3).map(vehicle => (
              <li key={vehicle.vehicleId} className="rounded-md border bg-background p-3 text-sm">
                <div className="flex items-start justify-between gap-2 font-medium">
                  <span className="min-w-0">{vehicle.vehicleLabel}</span>
                  <span className="shrink-0 text-xs">{vehicle.inactiveDays} days idle</span>
                </div>
                <p className="text-xs text-muted-foreground">Last trip {vehicle.lastTripDate}</p>
                {vehicle.locationHint && (
                  <p className="text-xs text-muted-foreground">{vehicle.locationHint}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

