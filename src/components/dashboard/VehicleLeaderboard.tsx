'use client';

import { memo, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TcoOutlierSummary, VehicleTco } from '@/types/cost';
import { formatTcoCurrency } from '@/lib/demo/tcoMockData';

interface VehicleLeaderboardProps {
  vehicles: VehicleTco[];
  outlierSummary: TcoOutlierSummary;
  currency?: string;
  isLoading?: boolean;
}

type SortField =
  | 'vehicleId'
  | 'monthlyTco'
  | 'tcoPerKm'
  | 'utilization'
  | 'incidents'
  | 'dataCompleteness';
type SortDirection = 'asc' | 'desc';

interface VehicleWithIncidents extends VehicleTco {
  incidentCount: number;
  isOutlier: boolean;
  outlierSeverity?: 'critical' | 'warning' | 'monitor';
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-40" />
        <div className="h-4 bg-muted rounded w-56 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-10 bg-muted rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SortButton({
  field,
  currentField,
  direction,
  onClick,
  children,
  align = 'left',
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: (field: SortField) => void;
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  const isActive = field === currentField;
  return (
    <button
      onClick={() => onClick(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium uppercase tracking-wide hover:text-foreground transition-colors w-full',
        isActive ? 'text-foreground' : 'text-muted-foreground',
        align === 'right' && 'justify-end',
        align === 'center' && 'justify-center',
        align === 'left' && 'justify-start'
      )}
    >
      {children}
      {isActive ? (
        direction === 'desc' ? (
          <ArrowDown className="h-3 w-3 flex-shrink-0" />
        ) : (
          <ArrowUp className="h-3 w-3 flex-shrink-0" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50 flex-shrink-0" />
      )}
    </button>
  );
}

export const VehicleLeaderboard = memo(function VehicleLeaderboard({
  vehicles,
  outlierSummary,
  currency = 'EUR',
  isLoading,
}: VehicleLeaderboardProps) {
  const [sortField, setSortField] = useState<SortField>('monthlyTco');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Enhance vehicles with incident count and outlier status
  const enhancedVehicles = useMemo<VehicleWithIncidents[]>(() => {
    return vehicles.map((vehicle) => {
      const outlier = outlierSummary.outliers.find(
        (o) => o.vehicle.vehicleId === vehicle.vehicleId
      );

      // Simulate incident count based on maintenance costs and age
      // In real app, this would come from actual incident data
      const maintenanceCost =
        vehicle.costBreakdown.find((b) => b.bucket === 'maintenance')?.amount ??
        0;
      const incidentCount = Math.floor(
        (maintenanceCost / 500) * (vehicle.vehicleAge / 24)
      );

      return {
        ...vehicle,
        incidentCount: Math.min(incidentCount, 12), // Cap at 12 for demo
        isOutlier: !!outlier,
        outlierSeverity: outlier?.severity,
      };
    });
  }, [vehicles, outlierSummary.outliers]);

  // Sort vehicles
  const sortedVehicles = useMemo(() => {
    const sorted = [...enhancedVehicles].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'vehicleId':
          comparison = a.vehicleId.localeCompare(b.vehicleId);
          break;
        case 'monthlyTco':
          comparison = a.monthlyTco - b.monthlyTco;
          break;
        case 'tcoPerKm':
          comparison = a.tcoPerKm - b.tcoPerKm;
          break;
        case 'utilization':
          comparison = a.utilization - b.utilization;
          break;
        case 'incidents':
          comparison = a.incidentCount - b.incidentCount;
          break;
        case 'dataCompleteness':
          comparison = a.dataCompleteness - b.dataCompleteness;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    return sorted.slice(0, 10);
  }, [enhancedVehicles, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Vehicle Leaderboard
        </CardTitle>
        <CardDescription>
          Top 10 vehicles by selected metric - click headers to sort
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b bg-slate-50/50">
                <th className="text-left px-6 py-2.5 w-[160px]">
                  <SortButton
                    field="vehicleId"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                    align="left"
                  >
                    Vehicle
                  </SortButton>
                </th>
                <th className="px-6 py-2.5 w-[120px]">
                  <SortButton
                    field="monthlyTco"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                    align="right"
                  >
                    Cost/mo
                  </SortButton>
                </th>
                <th className="px-6 py-2.5 w-[100px]">
                  <SortButton
                    field="tcoPerKm"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                    align="right"
                  >
                    €/km
                  </SortButton>
                </th>
                <th className="px-6 py-2.5 w-[160px]">
                  <SortButton
                    field="utilization"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                    align="right"
                  >
                    Utilization
                  </SortButton>
                </th>
                <th className="px-6 py-2.5 w-[110px]">
                  <SortButton
                    field="incidents"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                    align="right"
                  >
                    Incidents
                  </SortButton>
                </th>
                <th className="px-6 py-2.5 w-[100px]">
                  <SortButton
                    field="dataCompleteness"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                    align="right"
                  >
                    Data %
                  </SortButton>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedVehicles.map((vehicle, index) => (
                <tr
                  key={vehicle.vehicleId}
                  className={cn(
                    'border-b last:border-0 hover:bg-slate-50 transition-colors',
                    vehicle.isOutlier &&
                      vehicle.outlierSeverity === 'critical' &&
                      'bg-rose-50/30',
                    vehicle.isOutlier &&
                      vehicle.outlierSeverity === 'warning' &&
                      'bg-amber-50/30'
                  )}
                >
                  <td className="px-6 py-2.5 w-[160px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5 tabular-nums">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {vehicle.vehicleId}
                      </span>
                      {vehicle.isOutlier && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1 py-0',
                            vehicle.outlierSeverity === 'critical' &&
                              'bg-rose-100 text-rose-700 border-rose-200',
                            vehicle.outlierSeverity === 'warning' &&
                              'bg-amber-100 text-amber-700 border-amber-200'
                          )}
                        >
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                          {vehicle.outlierSeverity}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="text-right px-6 py-2.5 w-[120px]">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatTcoCurrency(vehicle.monthlyTco, currency)}
                    </span>
                  </td>
                  <td className="text-right px-6 py-2.5 w-[100px]">
                    <span
                      className={cn(
                        'text-sm tabular-nums',
                        vehicle.tcoPerKm > 0.8
                          ? 'text-rose-600 font-medium'
                          : vehicle.tcoPerKm > 0.6
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                      )}
                    >
                      €{vehicle.tcoPerKm.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-2.5 w-[160px]">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            vehicle.utilization >= 70
                              ? 'bg-emerald-500'
                              : vehicle.utilization >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          )}
                          style={{ width: `${vehicle.utilization}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-sm tabular-nums w-10 text-right',
                          vehicle.utilization < 50
                            ? 'text-rose-600 font-medium'
                            : vehicle.utilization < 70
                              ? 'text-amber-600'
                              : 'text-muted-foreground'
                        )}
                      >
                        {vehicle.utilization}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right px-6 py-2.5 w-[110px]">
                    <span
                      className={cn(
                        'text-sm tabular-nums',
                        vehicle.incidentCount > 5
                          ? 'text-rose-600 font-medium'
                          : vehicle.incidentCount > 2
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                      )}
                    >
                      {vehicle.incidentCount}
                    </span>
                  </td>
                  <td className="text-right px-6 py-2.5 w-[100px]">
                    <span
                      className={cn(
                        'text-sm tabular-nums',
                        vehicle.dataCompleteness < 70
                          ? 'text-rose-600 font-medium'
                          : vehicle.dataCompleteness < 85
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      )}
                    >
                      {vehicle.dataCompleteness}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});

VehicleLeaderboard.displayName = 'VehicleLeaderboard';

export default VehicleLeaderboard;
