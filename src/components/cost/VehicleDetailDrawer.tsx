'use client';

import { useMemo, useState } from 'react';
import {
  X,
  Car,
  Truck,
  Bike,
  User,
  TrendingUp,
  TrendingDown,
  Flag,
  Plus,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Route,
  Clock,
  Gauge,
  ChevronDown,
  History,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VehicleTco, TcoOutlier } from '@/types/cost';

interface VehicleDetailDrawerProps {
  vehicle: VehicleTco | null;
  outlier?: TcoOutlier;
  isOpen: boolean;
  onClose: () => void;
  onFlagForReview?: (vehicleId: string) => void;
  onAddExpense?: (vehicleId: string) => void;
  isFlagged?: boolean;
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

// Mock driver history for shared vehicles
const MOCK_DRIVER_HISTORY = [
  {
    id: 'drv-2',
    name: 'Sarah Murphy',
    from: '2024-06-15',
    to: '2024-10-31',
  },
  {
    id: 'drv-3',
    name: 'Michael Byrne',
    from: '2024-01-10',
    to: '2024-06-14',
  },
  {
    id: 'drv-4',
    name: "Ciara O'Neill",
    from: '2023-08-01',
    to: '2024-01-09',
  },
];

// Mock recent expenses for demo
const MOCK_RECENT_EXPENSES = [
  {
    id: 'exp-1',
    date: '2024-12-05',
    category: 'Fuel',
    amount: 87.5,
    supplier: 'Circle K Navan Road',
  },
  {
    id: 'exp-2',
    date: '2024-12-02',
    category: 'Maintenance',
    amount: 234.0,
    supplier: 'QuickFit Tyres Dublin',
  },
  {
    id: 'exp-3',
    date: '2024-11-28',
    category: 'Fuel',
    amount: 92.3,
    supplier: 'Applegreen M50',
  },
  {
    id: 'exp-4',
    date: '2024-11-20',
    category: 'Tolls',
    amount: 45.0,
    supplier: 'eFlow Monthly',
  },
];

// Mock 6-month trend data
function generateTrendData(
  currentTco: number
): { month: string; value: number }[] {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, i) => ({
    month,
    value: currentTco * (0.85 + Math.random() * 0.3 + i * 0.02),
  }));
}

export function VehicleDetailDrawer({
  vehicle,
  outlier,
  isOpen,
  onClose,
  onFlagForReview,
  onAddExpense,
  isFlagged = false,
}: VehicleDetailDrawerProps) {
  const [showDriverHistory, setShowDriverHistory] = useState(false);

  const { trendData, maxTrendValue } = useMemo(() => {
    if (!vehicle) {
      return { trendData: [], maxTrendValue: 0 };
    }
    const data = generateTrendData(vehicle.monthlyTco);
    return {
      trendData: data,
      maxTrendValue: Math.max(...data.map((d) => d.value)),
    };
  }, [vehicle]);

  if (!vehicle) return null;

  // Determine outlier status using same logic as the table:
  // 1. If in outliers array with severity
  // 2. OR if peerGroupMultiple > 1.3 (high deviation from peer average)
  const hasOutlierData = outlier?.isOutlier;
  const isHighDeviation = vehicle.peerGroupMultiple > 1.3;
  const isOutlier = hasOutlierData || isHighDeviation;

  // Determine effective severity
  const effectiveSeverity: 'critical' | 'warning' | undefined = hasOutlierData
    ? outlier?.severity
    : isHighDeviation
      ? vehicle.peerGroupMultiple > 1.8
        ? 'critical'
        : 'warning'
      : undefined;

  // Calculate excess cost if not provided by outlier data
  const peerAvgTco = vehicle.monthlyTco / vehicle.peerGroupMultiple;
  const calculatedExcessCost = Math.round(vehicle.monthlyTco - peerAvgTco);
  const calculatedExcessPct = Math.round((vehicle.peerGroupMultiple - 1) * 100);

  const trendPositive = vehicle.tcoTrend <= 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-start justify-between p-4 border-b',
            isOutlier
              ? effectiveSeverity === 'critical'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
              : 'bg-slate-50'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                isOutlier
                  ? effectiveSeverity === 'critical'
                    ? 'bg-red-100'
                    : 'bg-amber-100'
                  : 'bg-slate-200'
              )}
            >
              <VehicleIcon
                type={vehicle.vehicleType}
                className={cn(
                  'h-6 w-6',
                  isOutlier
                    ? effectiveSeverity === 'critical'
                      ? 'text-red-700'
                      : 'text-amber-700'
                    : 'text-slate-600'
                )}
              />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{vehicle.vehicleId}</h2>
              <p className="text-sm text-muted-foreground">
                {vehicle.vehicleLabel.split('·')[0]?.trim()}
              </p>
              <p className="text-xs text-muted-foreground">
                {vehicle.registrationNumber}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* OUTLIER ALERT BANNER - Only shown for flagged vehicles */}
          {isOutlier && (
            <div
              className={cn(
                'p-4 rounded-xl border-2',
                effectiveSeverity === 'critical'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-amber-50 border-amber-300'
              )}
            >
              {/* Alert Header */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={cn(
                    'p-2 rounded-full',
                    effectiveSeverity === 'critical'
                      ? 'bg-red-100'
                      : 'bg-amber-100'
                  )}
                >
                  {effectiveSeverity === 'critical' ? (
                    <AlertOctagon className="h-5 w-5 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={cn(
                      'font-semibold',
                      effectiveSeverity === 'critical'
                        ? 'text-red-800'
                        : 'text-amber-800'
                    )}
                  >
                    {effectiveSeverity === 'critical'
                      ? 'Critical: Immediate Action Required'
                      : 'Above Average TCO'}
                  </h3>
                  <p
                    className={cn(
                      'text-sm mt-0.5',
                      effectiveSeverity === 'critical'
                        ? 'text-red-700'
                        : 'text-amber-700'
                    )}
                  >
                    This vehicle costs{' '}
                    <span className="font-bold">
                      €
                      {(
                        outlier?.excessCost ?? calculatedExcessCost
                      ).toLocaleString()}
                    </span>{' '}
                    more per month than similar vehicles (
                    {(outlier?.excessPct ?? calculatedExcessPct).toFixed(0)}%
                    above average)
                  </p>
                </div>
              </div>

              {/* Cost Contributors - only if we have outlier data with reasons */}
              {outlier && outlier.reasons.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p
                    className={cn(
                      'text-xs font-medium uppercase tracking-wide',
                      effectiveSeverity === 'critical'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    )}
                  >
                    Where the excess cost comes from
                  </p>
                  <div className="space-y-2">
                    {outlier.reasons
                      .sort((a, b) => b.contribution - a.contribution)
                      .map((reason) => (
                        <div
                          key={reason.reason}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-lg',
                            effectiveSeverity === 'critical'
                              ? 'bg-red-100/50'
                              : 'bg-amber-100/50'
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  effectiveSeverity === 'critical'
                                    ? 'text-red-800'
                                    : 'text-amber-800'
                                )}
                              >
                                {reason.label}
                              </span>
                              <span
                                className={cn(
                                  'text-sm font-bold tabular-nums',
                                  effectiveSeverity === 'critical'
                                    ? 'text-red-700'
                                    : 'text-amber-700'
                                )}
                              >
                                +€{reason.contribution.toLocaleString()}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-xs mt-0.5',
                                effectiveSeverity === 'critical'
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                              )}
                            >
                              {reason.insight}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* High deviation without detailed outlier data */}
              {!outlier && isHighDeviation && (
                <div
                  className={cn(
                    'p-3 rounded-lg mb-4',
                    effectiveSeverity === 'critical'
                      ? 'bg-red-100/50'
                      : 'bg-amber-100/50'
                  )}
                >
                  <p
                    className={cn(
                      'text-sm',
                      effectiveSeverity === 'critical'
                        ? 'text-red-700'
                        : 'text-amber-700'
                    )}
                  >
                    This vehicle&apos;s TCO per km is{' '}
                    <span className="font-bold">
                      {vehicle.peerGroupMultiple.toFixed(1)}x
                    </span>{' '}
                    the peer group average. Review cost breakdown below to
                    identify high-cost areas.
                  </p>
                </div>
              )}

              {/* Suggested Action */}
              {outlier?.suggestedAction && (
                <div
                  className={cn(
                    'flex items-start gap-2 p-3 rounded-lg',
                    effectiveSeverity === 'critical'
                      ? 'bg-red-100 border border-red-200'
                      : 'bg-amber-100 border border-amber-200'
                  )}
                >
                  <Lightbulb
                    className={cn(
                      'h-4 w-4 mt-0.5 flex-shrink-0',
                      effectiveSeverity === 'critical'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    )}
                  />
                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-xs font-medium',
                        effectiveSeverity === 'critical'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      )}
                    >
                      Recommended Action
                    </p>
                    <p
                      className={cn(
                        'text-sm',
                        effectiveSeverity === 'critical'
                          ? 'text-red-800'
                          : 'text-amber-800'
                      )}
                    >
                      {outlier.suggestedAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Driver & Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {vehicle.driver ? (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">{vehicle.driver.name}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">
                      (current)
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No driver assigned
                </span>
              )}
              {!isOutlier && (
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Normal
                </Badge>
              )}
            </div>

            {/* Driver History Toggle */}
            {MOCK_DRIVER_HISTORY.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowDriverHistory(!showDriverHistory)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <History className="h-3 w-3" />
                  <span>
                    {showDriverHistory ? 'Hide' : 'Show'} driver history
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform',
                      showDriverHistory && 'rotate-180'
                    )}
                  />
                </button>

                {/* Driver History List */}
                {showDriverHistory && (
                  <div className="mt-2 pl-5 space-y-1.5 border-l-2 border-slate-100">
                    {MOCK_DRIVER_HISTORY.map((driver) => (
                      <div
                        key={driver.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {driver.name}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {new Date(driver.from).toLocaleDateString('en-IE', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })}{' '}
                          –{' '}
                          {new Date(driver.to).toLocaleDateString('en-IE', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className={cn(
                'p-3 rounded-lg',
                isOutlier &&
                  vehicle.peerGroupMultiple > 1.3 &&
                  (effectiveSeverity === 'critical'
                    ? 'bg-red-50 ring-1 ring-red-200'
                    : 'bg-amber-50 ring-1 ring-amber-200'),
                !isOutlier && 'bg-slate-50',
                isOutlier && vehicle.peerGroupMultiple <= 1.3 && 'bg-slate-50'
              )}
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Route className="h-3 w-3" />
                TCO/km
              </div>
              <p
                className={cn(
                  'text-lg font-bold tabular-nums',
                  isOutlier &&
                    vehicle.peerGroupMultiple > 1.3 &&
                    (effectiveSeverity === 'critical'
                      ? 'text-red-600'
                      : 'text-amber-600')
                )}
              >
                €{vehicle.tcoPerKm.toFixed(2)}
              </p>
              {vehicle.peerGroupMultiple > 1 && (
                <p
                  className={cn(
                    'text-[10px]',
                    isOutlier && vehicle.peerGroupMultiple > 1.3
                      ? effectiveSeverity === 'critical'
                        ? 'text-red-600 font-medium'
                        : 'text-amber-600 font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {vehicle.peerGroupMultiple.toFixed(1)}x peer avg
                </p>
              )}
            </div>
            <div
              className={cn(
                'p-3 rounded-lg',
                isOutlier &&
                  vehicle.utilization < 50 &&
                  (effectiveSeverity === 'critical'
                    ? 'bg-red-50 ring-1 ring-red-200'
                    : 'bg-amber-50 ring-1 ring-amber-200'),
                (!isOutlier || vehicle.utilization >= 50) && 'bg-slate-50'
              )}
            >
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Gauge className="h-3 w-3" />
                Utilization
              </div>
              <p
                className={cn(
                  'text-lg font-bold tabular-nums',
                  isOutlier &&
                    vehicle.utilization < 50 &&
                    (effectiveSeverity === 'critical'
                      ? 'text-red-600'
                      : 'text-amber-600')
                )}
              >
                {vehicle.utilization}%
              </p>
              <p className="text-[10px] text-muted-foreground">
                {vehicle.totalKm.toLocaleString()} km
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                Age
              </div>
              <p className="text-lg font-bold tabular-nums">
                {Math.floor(vehicle.vehicleAge / 12)}y {vehicle.vehicleAge % 12}
                m
              </p>
              {vehicle.contractEndDate && (
                <p className="text-[10px] text-muted-foreground">
                  Contract ends {vehicle.contractEndDate}
                </p>
              )}
            </div>
          </div>

          {/* 6-Month Trend */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Monthly TCO Trend</h3>
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  trendPositive ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {trendPositive ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {Math.abs(vehicle.tcoTrend).toFixed(1)}%
              </div>
            </div>
            <div className="flex items-end gap-1">
              {trendData.map((point, i) => (
                <div
                  key={point.month}
                  className="flex-1 flex flex-col items-center"
                >
                  <div className="relative w-full h-16 flex items-end">
                    <div
                      className={cn(
                        'w-full rounded-t transition-all',
                        i === trendData.length - 1
                          ? 'bg-blue-500'
                          : 'bg-slate-200'
                      )}
                      style={{
                        height: `${(point.value / maxTrendValue) * 100}%`,
                        minHeight: '4px',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {point.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-sm font-medium mb-2">Cost Breakdown</h3>
            <div className="space-y-1">
              {vehicle.costBreakdown
                .filter((b) => b.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 6)
                .map((bucket) => {
                  // Check if this bucket is flagged as a problem area
                  const isFlagged =
                    isOutlier &&
                    outlier?.reasons.some(
                      (r) =>
                        r.reason.toLowerCase().includes(bucket.bucket) ||
                        (bucket.bucket === 'fuel' &&
                          r.reason === 'high-fuel') ||
                        (bucket.bucket === 'maintenance' &&
                          (r.reason === 'high-maintenance' ||
                            r.reason === 'high-repairs'))
                    );

                  return (
                    <div
                      key={bucket.bucket}
                      className={cn(
                        'flex items-center gap-3 py-1 px-2 -mx-2 rounded-lg transition-colors',
                        isFlagged &&
                          (effectiveSeverity === 'critical'
                            ? 'bg-red-50'
                            : 'bg-amber-50')
                      )}
                    >
                      <div
                        className={cn(
                          'w-20 text-xs',
                          isFlagged
                            ? effectiveSeverity === 'critical'
                              ? 'text-red-700 font-medium'
                              : 'text-amber-700 font-medium'
                            : 'text-muted-foreground'
                        )}
                      >
                        {bucket.label}
                        {isFlagged && (
                          <AlertTriangle
                            className={cn(
                              'inline-block h-3 w-3 ml-1',
                              effectiveSeverity === 'critical'
                                ? 'text-red-500'
                                : 'text-amber-500'
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${bucket.sharePct}%`,
                            backgroundColor: isFlagged
                              ? effectiveSeverity === 'critical'
                                ? '#dc2626'
                                : '#f59e0b'
                              : bucket.color,
                          }}
                        />
                      </div>
                      <div
                        className={cn(
                          'w-16 text-right text-xs font-medium tabular-nums',
                          isFlagged &&
                            (effectiveSeverity === 'critical'
                              ? 'text-red-700'
                              : 'text-amber-700')
                        )}
                      >
                        €{bucket.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Monthly Total
              </span>
              <span
                className={cn(
                  'font-bold',
                  isOutlier &&
                    (effectiveSeverity === 'critical'
                      ? 'text-red-700'
                      : 'text-amber-700')
                )}
              >
                €{vehicle.monthlyTco.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recent Expenses */}
          <div>
            <h3 className="text-sm font-medium mb-3">Recent Expenses</h3>
            <div className="space-y-2">
              {MOCK_RECENT_EXPENSES.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-sm"
                >
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.supplier} · {expense.date}
                    </p>
                  </div>
                  <span className="font-medium tabular-nums">
                    €{expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={cn(
            'p-4 border-t flex gap-2',
            isOutlier
              ? effectiveSeverity === 'critical'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
              : 'bg-slate-50'
          )}
        >
          {isFlagged ? (
            <Button
              variant="outline"
              className="flex-1 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              disabled
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Flagged for Review
            </Button>
          ) : (
            <Button
              variant={isOutlier ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                isOutlier &&
                  (effectiveSeverity === 'critical'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700')
              )}
              onClick={() => onFlagForReview?.(vehicle.vehicleId)}
            >
              <Flag className="h-4 w-4 mr-1.5" />
              {isOutlier ? 'Take Action' : 'Flag for Review'}
            </Button>
          )}
          <Button
            variant={isOutlier && !isFlagged ? 'outline' : 'default'}
            className="flex-1"
            onClick={() => onAddExpense?.(vehicle.vehicleId)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Expense
          </Button>
        </div>
      </div>
    </>
  );
}
