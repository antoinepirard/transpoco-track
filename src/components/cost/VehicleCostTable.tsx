'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Car,
  Truck,
  Bike,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { VehicleTco, TcoOutlier } from '@/types/cost';

type SortField =
  | 'vehicleLabel'
  | 'tcoPerKm'
  | 'fuel'
  | 'maintenance'
  | 'insurance'
  | 'lease'
  | 'monthlyTco'
  | 'status';
type SortDirection = 'asc' | 'desc';

interface VehicleCostTableProps {
  vehicles: VehicleTco[];
  outliers: TcoOutlier[];
  onRowClick: (vehicle: VehicleTco) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

// Helper to get cost bucket amount
function getCostBucket(vehicle: VehicleTco, bucket: string): number {
  const found = vehicle.costBreakdown.find((b) => b.bucket === bucket);
  return found?.amount ?? 0;
}

// Get vehicle status based on peer comparison
function getVehicleStatus(
  vehicle: VehicleTco,
  outliers: TcoOutlier[]
): { status: 'ok' | 'warning' | 'critical'; label: string; deviation?: number } {
  const outlier = outliers.find(
    (o) => o.vehicle.vehicleId === vehicle.vehicleId
  );

  // Calculate percentage deviation from average (1.0 = average, 1.3 = 30% above)
  const deviationPct = Math.round((vehicle.peerGroupMultiple - 1) * 100);

  if (outlier?.severity === 'critical') {
    return { status: 'critical', label: `+${deviationPct}%`, deviation: deviationPct };
  }
  if (outlier?.severity === 'warning') {
    return { status: 'warning', label: `+${deviationPct}%`, deviation: deviationPct };
  }
  if (vehicle.peerGroupMultiple > 1.3) {
    return { status: 'warning', label: `+${deviationPct}%`, deviation: deviationPct };
  }
  if (vehicle.peerGroupMultiple < 0.85) {
    // Below average - good performance
    return { status: 'ok', label: `${deviationPct}%`, deviation: deviationPct };
  }
  return { status: 'ok', label: 'Avg', deviation: deviationPct };
}

// Format currency compactly
function formatCompact(amount: number): string {
  if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(1)}k`;
  }
  return `€${amount.toFixed(0)}`;
}

// Vehicle type icon
function VehicleIcon({ type }: { type: VehicleTco['vehicleType'] }) {
  switch (type) {
    case 'truck':
      return <Truck className="h-4 w-4 text-muted-foreground" />;
    case 'motorcycle':
      return <Bike className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Car className="h-4 w-4 text-muted-foreground" />;
  }
}

// Status badge component
function StatusBadge({
  status,
  label,
  deviation,
}: {
  status: 'ok' | 'warning' | 'critical';
  label: string;
  deviation?: number;
}) {
  // Generate a descriptive tooltip
  const getTooltip = () => {
    if (deviation === undefined) return '';
    if (status === 'critical') return `${deviation}% above peer group average - needs attention`;
    if (status === 'warning') return `${deviation}% above peer group average`;
    if (deviation < 0) return `${Math.abs(deviation)}% below average - good performance`;
    return 'Within normal range';
  };

  return (
    <Badge
      variant="outline"
      title={getTooltip()}
      className={cn(
        'text-xs font-medium tabular-nums',
        status === 'critical' && 'border-red-200 bg-red-50 text-red-700',
        status === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700',
        status === 'ok' && 'border-emerald-200 bg-emerald-50 text-emerald-700'
      )}
    >
      {status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
      {status === 'warning' && <AlertCircle className="h-3 w-3 mr-1" />}
      {status === 'ok' && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}

// Sortable column header
function SortableHeader({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
  align = 'left',
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  align?: 'left' | 'right';
}) {
  const isActive = currentSort === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors',
        align === 'right' && 'ml-auto'
      )}
    >
      {label}
      {isActive ? (
        currentDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

export function VehicleCostTable({
  vehicles,
  outliers,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
}: VehicleCostTableProps) {
  const [sortField, setSortField] = useState<SortField>('tcoPerKm');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? vehicles.map((v) => v.vehicleId) : []);
    }
  };

  const handleSelectOne = (vehicleId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, vehicleId]);
      } else {
        onSelectionChange(selectedIds.filter((id) => id !== vehicleId));
      }
    }
  };

  const sortedVehicles = useMemo(() => {
    const sorted = [...vehicles].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'vehicleLabel':
          aVal = a.vehicleLabel;
          bVal = b.vehicleLabel;
          break;
        case 'tcoPerKm':
          aVal = a.tcoPerKm;
          bVal = b.tcoPerKm;
          break;
        case 'fuel':
          aVal = getCostBucket(a, 'fuel');
          bVal = getCostBucket(b, 'fuel');
          break;
        case 'maintenance':
          aVal = getCostBucket(a, 'maintenance');
          bVal = getCostBucket(b, 'maintenance');
          break;
        case 'insurance':
          aVal = getCostBucket(a, 'insurance');
          bVal = getCostBucket(b, 'insurance');
          break;
        case 'lease':
          aVal = getCostBucket(a, 'lease');
          bVal = getCostBucket(b, 'lease');
          break;
        case 'monthlyTco':
          aVal = a.monthlyTco;
          bVal = b.monthlyTco;
          break;
        case 'status':
          aVal = a.peerGroupMultiple;
          bVal = b.peerGroupMultiple;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return sorted;
  }, [vehicles, sortField, sortDirection]);

  const allSelected =
    selectedIds.length === vehicles.length && vehicles.length > 0;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < vehicles.length;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              {onSelectionChange && (
                <th className="w-10 px-3 py-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className={someSelected ? 'opacity-50' : ''}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left">
                <SortableHeader
                  label="Vehicle"
                  field="vehicleLabel"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3 text-right">
                <SortableHeader
                  label="TCO/km"
                  field="tcoPerKm"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-4 py-3 text-right">
                <SortableHeader
                  label="Fuel"
                  field="fuel"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-4 py-3 text-right">
                <SortableHeader
                  label="Maint."
                  field="maintenance"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-4 py-3 text-right">
                <SortableHeader
                  label="Insurance"
                  field="insurance"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-4 py-3 text-right">
                <SortableHeader
                  label="Lease"
                  field="lease"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-4 py-3 text-right">
                <SortableHeader
                  label="Total"
                  field="monthlyTco"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
              </th>
              <th className="px-4 py-3 text-center">
                <SortableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedVehicles.map((vehicle) => {
              const { status, label, deviation } = getVehicleStatus(vehicle, outliers);
              const isSelected = selectedIds.includes(vehicle.vehicleId);

              return (
                <tr
                  key={vehicle.vehicleId}
                  onClick={() => onRowClick(vehicle)}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-slate-50',
                    isSelected && 'bg-blue-50 hover:bg-blue-100',
                    status === 'critical' && 'bg-red-50/30',
                    status === 'warning' && 'bg-amber-50/30'
                  )}
                >
                  {onSelectionChange && (
                    <td className="w-10 px-3 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectOne(vehicle.vehicleId, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${vehicle.vehicleLabel}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <VehicleIcon type={vehicle.vehicleType} />
                      <div>
                        <p className="font-medium text-sm">
                          {vehicle.vehicleId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.vehicleLabel.split('·')[0]?.trim()}
                          {vehicle.driver && ` · ${vehicle.driver.name}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'font-semibold tabular-nums',
                        status === 'critical' && 'text-red-600',
                        status === 'warning' && 'text-amber-600'
                      )}
                    >
                      €{vehicle.tcoPerKm.toFixed(2)}
                    </span>
                    {vehicle.peerGroupMultiple > 1.2 && (
                      <p className="text-[10px] text-muted-foreground">
                        {vehicle.peerGroupMultiple.toFixed(1)}x avg
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {formatCompact(getCostBucket(vehicle, 'fuel'))}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {formatCompact(getCostBucket(vehicle, 'maintenance'))}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {formatCompact(getCostBucket(vehicle, 'insurance'))}
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {formatCompact(getCostBucket(vehicle, 'lease'))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold tabular-nums">
                      {formatCompact(vehicle.monthlyTco)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={status} label={label} deviation={deviation} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer with summary */}
      <div className="px-4 py-3 bg-slate-50 border-t flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {vehicles.length} vehicles
          {selectedIds.length > 0 && ` · ${selectedIds.length} selected`}
        </span>
        <span>
          Avg TCO/km: €
          {(
            vehicles.reduce((sum, v) => sum + v.tcoPerKm, 0) / vehicles.length
          ).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
