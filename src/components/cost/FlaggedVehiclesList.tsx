'use client';

import { useState, useMemo } from 'react';
import {
  Flag,
  CheckCircle2,
  Clock,
  Eye,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  Car,
  Truck,
  Bike,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VehicleTco, TcoOutlier } from '@/types/cost';
import type { FlaggedVehicle } from '@/app/(dashboard)/cost-management/page';

interface FlaggedVehiclesListProps {
  flaggedVehicles: FlaggedVehicle[];
  vehicles: VehicleTco[];
  outliers: TcoOutlier[];
  onViewDetails: (vehicle: VehicleTco) => void;
  onResolve: (vehicleId: string) => void;
}

// Vehicle type icon
function VehicleIcon({
  type,
  className,
}: {
  type: VehicleTco['vehicleType'];
  className?: string;
}) {
  switch (type) {
    case 'truck':
      return <Truck className={className} />;
    case 'motorcycle':
      return <Bike className={className} />;
    default:
      return <Car className={className} />;
  }
}

// Format time ago
function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  return `${diffDay}d ago`;
}

export function FlaggedVehiclesList({
  flaggedVehicles,
  vehicles,
  outliers,
  onViewDetails,
  onResolve,
}: FlaggedVehiclesListProps) {
  const [showResolved, setShowResolved] = useState(false);

  // Separate active and resolved flagged vehicles
  const { activeFlagged, resolvedFlagged } = useMemo(() => {
    const active: (FlaggedVehicle & {
      vehicle: VehicleTco;
      outlier?: TcoOutlier;
    })[] = [];
    const resolved: (FlaggedVehicle & {
      vehicle: VehicleTco;
      outlier?: TcoOutlier;
    })[] = [];

    flaggedVehicles.forEach((flag) => {
      const vehicle = vehicles.find((v) => v.vehicleId === flag.vehicleId);
      if (!vehicle) return;

      const outlier = outliers.find(
        (o) => o.vehicle.vehicleId === flag.vehicleId
      );
      const enrichedFlag = { ...flag, vehicle, outlier };

      if (flag.resolved) {
        resolved.push(enrichedFlag);
      } else {
        active.push(enrichedFlag);
      }
    });

    // Sort by flagged date (most recent first)
    active.sort(
      (a, b) =>
        new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime()
    );
    resolved.sort(
      (a, b) =>
        new Date(b.resolvedAt || b.flaggedAt).getTime() -
        new Date(a.resolvedAt || a.flaggedAt).getTime()
    );

    return { activeFlagged: active, resolvedFlagged: resolved };
  }, [flaggedVehicles, vehicles, outliers]);

  // Empty state
  if (flaggedVehicles.length === 0) {
    return (
      <div className="border rounded-lg bg-white p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <Flag className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="font-semibold mb-1">No flagged vehicles</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Flag vehicles for review from their detail page to track them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Active flagged vehicles - Table style */}
      {activeFlagged.length > 0 && (
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="divide-y">
            {activeFlagged.map((flagged) => {
              const { vehicle, outlier } = flagged;
              const isOutlier =
                outlier?.isOutlier || vehicle.peerGroupMultiple > 1.3;
              const severity =
                outlier?.severity ||
                (vehicle.peerGroupMultiple > 1.8
                  ? 'critical'
                  : vehicle.peerGroupMultiple > 1.3
                    ? 'warning'
                    : undefined);

              return (
                <div
                  key={flagged.vehicleId}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors',
                    isOutlier &&
                      (severity === 'critical'
                        ? 'border-l-2 border-l-red-500'
                        : 'border-l-2 border-l-amber-500')
                  )}
                >
                  {/* Vehicle icon */}
                  <VehicleIcon
                    type={vehicle.vehicleType}
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isOutlier
                        ? severity === 'critical'
                          ? 'text-red-600'
                          : 'text-amber-600'
                        : 'text-slate-500'
                    )}
                  />

                  {/* Vehicle info */}
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="font-medium text-sm">
                      {vehicle.vehicleId}
                    </span>
                    {isOutlier && (
                      <Badge
                        variant={
                          severity === 'critical' ? 'destructive' : 'outline'
                        }
                        className={cn(
                          'text-[10px] px-1.5 py-0',
                          severity === 'warning' &&
                            'border-amber-300 bg-amber-50 text-amber-700'
                        )}
                      >
                        {severity === 'critical' ? (
                          <AlertOctagon className="h-2.5 w-2.5 mr-0.5" />
                        ) : (
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                        )}
                        {severity === 'critical' ? 'Critical' : 'High'}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {vehicle.vehicleLabel.split('·')[0]?.trim()}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="tabular-nums">
                      €{vehicle.monthlyTco.toLocaleString()}/mo
                    </span>
                    {vehicle.peerGroupMultiple > 1.3 && (
                      <span className="text-amber-600 font-medium tabular-nums">
                        {vehicle.peerGroupMultiple.toFixed(1)}x
                      </span>
                    )}
                  </div>

                  {/* Flagged time */}
                  <span className="text-xs text-muted-foreground flex items-center gap-1 w-20">
                    <Clock className="h-3 w-3" />
                    {timeAgo(new Date(flagged.flaggedAt))}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => onViewDetails(vehicle)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">
                        View
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => onResolve(flagged.vehicleId)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">
                        Resolve
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-slate-50 border-t text-xs text-muted-foreground">
            {activeFlagged.length} vehicle
            {activeFlagged.length !== 1 ? 's' : ''} awaiting review
          </div>
        </div>
      )}

      {/* No active items message */}
      {activeFlagged.length === 0 && resolvedFlagged.length > 0 && (
        <div className="border rounded-lg bg-emerald-50 px-4 py-3 text-center">
          <p className="text-sm text-emerald-700 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            All flagged vehicles have been resolved
          </p>
        </div>
      )}

      {/* Resolved section */}
      {resolvedFlagged.length > 0 && (
        <div className="border rounded-lg bg-slate-50 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowResolved(!showResolved)}
            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {resolvedFlagged.length} resolved
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform',
                showResolved && 'rotate-180'
              )}
            />
          </button>

          {showResolved && (
            <div className="border-t divide-y bg-white">
              {resolvedFlagged.map((flagged) => (
                <div
                  key={flagged.vehicleId}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <VehicleIcon
                    type={flagged.vehicle.vehicleType}
                    className="h-3.5 w-3.5 text-muted-foreground"
                  />
                  <span className="font-medium text-muted-foreground">
                    {flagged.vehicle.vehicleId}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {flagged.resolvedAt
                      ? timeAgo(new Date(flagged.resolvedAt))
                      : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 ml-auto text-xs text-muted-foreground"
                    onClick={() => onViewDetails(flagged.vehicle)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
