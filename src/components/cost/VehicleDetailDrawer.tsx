'use client';

import { useMemo } from 'react';
import {
  X,
  Car,
  Truck,
  Bike,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Flag,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Route,
  Clock,
  Gauge,
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
}: VehicleDetailDrawerProps) {
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

  const isOutlier = outlier?.isOutlier;
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
        <div className="flex items-start justify-between p-4 border-b bg-slate-50">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                isOutlier ? 'bg-amber-100' : 'bg-slate-200'
              )}
            >
              <VehicleIcon
                type={vehicle.vehicleType}
                className={cn(
                  'h-6 w-6',
                  isOutlier ? 'text-amber-700' : 'text-slate-600'
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
          {/* Driver & Status */}
          <div className="flex items-center justify-between">
            {vehicle.driver ? (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{vehicle.driver.name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                No driver assigned
              </span>
            )}
            {isOutlier && (
              <Badge
                variant="outline"
                className={cn(
                  outlier?.severity === 'critical'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                )}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                {outlier?.severity === 'critical' ? 'Critical' : 'High TCO'}
              </Badge>
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

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Route className="h-3 w-3" />
                TCO/km
              </div>
              <p
                className={cn(
                  'text-lg font-bold tabular-nums',
                  isOutlier && 'text-amber-600'
                )}
              >
                €{vehicle.tcoPerKm.toFixed(2)}
              </p>
              {vehicle.peerGroupMultiple > 1 && (
                <p className="text-[10px] text-muted-foreground">
                  {vehicle.peerGroupMultiple.toFixed(1)}x peer avg
                </p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Gauge className="h-3 w-3" />
                Utilization
              </div>
              <p className="text-lg font-bold tabular-nums">
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

          {/* Outlier Insights */}
          {outlier && outlier.reasons.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
              <h3 className="text-sm font-medium text-amber-800 mb-2">
                Why TCO is high
              </h3>
              <ul className="space-y-1.5">
                {outlier.reasons.map((reason) => (
                  <li
                    key={reason.reason}
                    className="text-xs text-amber-700 flex items-start gap-2"
                  >
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{reason.insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
            <div className="flex items-end gap-1 h-20">
              {trendData.map((point, i) => (
                <div
                  key={point.month}
                  className="flex-1 flex flex-col items-center"
                >
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
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {point.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-sm font-medium mb-3">Cost Breakdown</h3>
            <div className="space-y-2">
              {vehicle.costBreakdown
                .filter((b) => b.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 6)
                .map((bucket) => (
                  <div key={bucket.bucket} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-muted-foreground">
                      {bucket.label}
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${bucket.sharePct}%`,
                          backgroundColor: bucket.color,
                        }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs font-medium tabular-nums">
                      €{bucket.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Monthly Total
              </span>
              <span className="font-bold">
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
        <div className="p-4 border-t bg-slate-50 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onFlagForReview?.(vehicle.vehicleId)}
          >
            <Flag className="h-4 w-4 mr-1.5" />
            Flag for Review
          </Button>
          <Button
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
