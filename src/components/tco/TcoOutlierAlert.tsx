'use client';

import { memo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Fuel,
  Wrench,
  Clock,
  Gauge,
  Calendar,
  Route,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TcoOutlier, TcoOutlierReason, TcoOutlierSummary } from '@/types/cost';
import { formatTcoCurrency } from '@/lib/demo/tcoMockData';
import { cn } from '@/lib/utils';

interface TcoOutlierAlertProps {
  outlierSummary: TcoOutlierSummary;
  currency?: string;
  isLoading?: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

const REASON_ICONS: Record<TcoOutlierReason, typeof Fuel> = {
  'high-fuel': Fuel,
  'high-maintenance': Wrench,
  'low-utilization': Clock,
  'excessive-idling': Gauge,
  'high-repairs': Wrench,
  'age-related': Calendar,
  'route-inefficiency': Route,
};

const SEVERITY_CONFIG = {
  critical: {
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    badgeVariant: 'destructive' as const,
    label: 'Critical',
  },
  warning: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeVariant: 'outline' as const,
    label: 'Warning',
  },
  monitor: {
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-600',
    badgeVariant: 'secondary' as const,
    label: 'Monitor',
  },
};

function OutlierCard({
  outlier,
  currency,
  onVehicleClick,
}: {
  outlier: TcoOutlier;
  currency: string;
  onVehicleClick?: (vehicleId: string) => void;
}) {
  const [expanded, setExpanded] = useState(outlier.severity === 'critical');
  const config = SEVERITY_CONFIG[outlier.severity];

  return (
    <div
      className={cn(
        'rounded-lg border-2 overflow-hidden transition-all',
        config.borderColor,
        config.bgColor
      )}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-black/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <AlertTriangle className={cn('h-5 w-5 flex-shrink-0', config.textColor)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">
              {outlier.vehicle.vehicleLabel}
            </span>
            <Badge variant={config.badgeVariant} className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            TCO {outlier.excessPct}% above fleet average
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className={cn('text-lg font-bold tabular-nums', config.textColor)}>
            +{formatTcoCurrency(outlier.excessCost, currency)}
          </div>
          <div className="text-xs text-muted-foreground">excess/month</div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-black/5">
          <div className="mt-4 space-y-3">
            {/* Why breakdown */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Why is this vehicle flagged?
              </h4>
              <div className="space-y-2">
                {outlier.reasons.map((reason, idx) => {
                  const ReasonIcon = REASON_ICONS[reason.reason] || AlertTriangle;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-md bg-white/70 border border-black/5"
                    >
                      <ReasonIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{reason.label}</span>
                          <span className="text-sm font-semibold tabular-nums text-rose-600">
                            +{formatTcoCurrency(reason.contribution, currency)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {reason.insight}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {reason.contributionPct}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-2 rounded-md bg-white/50">
                <div className="text-xs text-muted-foreground">Monthly TCO</div>
                <div className="font-semibold tabular-nums">
                  {formatTcoCurrency(outlier.vehicle.monthlyTco, currency)}
                </div>
              </div>
              <div className="text-center p-2 rounded-md bg-white/50">
                <div className="text-xs text-muted-foreground">TCO/km</div>
                <div className="font-semibold tabular-nums">
                  €{outlier.vehicle.tcoPerKm.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-2 rounded-md bg-white/50">
                <div className="text-xs text-muted-foreground">Utilization</div>
                <div className="font-semibold tabular-nums">
                  {outlier.vehicle.utilization}%
                </div>
              </div>
            </div>

            {/* Action */}
            {outlier.suggestedAction && (
              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                <span className="text-sm text-muted-foreground">
                  {outlier.suggestedAction}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVehicleClick?.(outlier.vehicle.vehicleId);
                  }}
                >
                  View Details
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const TcoOutlierAlert = memo(function TcoOutlierAlert({
  outlierSummary,
  currency = 'EUR',
  isLoading,
  onVehicleClick,
}: TcoOutlierAlertProps) {
  const { outliers, totalOutlierCount, criticalCount, warningCount, totalExcessCost } =
    outlierSummary;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (totalOutlierCount === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-3">
              <AlertTriangle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-emerald-900">No Cost Outliers</h3>
            <p className="text-sm text-emerald-700 mt-1">
              All vehicles are within expected TCO ranges
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show max 5 outliers by default
  const displayedOutliers = outliers.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Outliers & Cost Levers
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalOutlierCount} vehicle{totalOutlierCount !== 1 ? 's' : ''} with
              significantly higher TCO than peers
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums text-rose-600">
              {formatTcoCurrency(totalExcessCost, currency)}
            </div>
            <div className="text-xs text-muted-foreground">
              total excess cost/month
            </div>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 mt-3">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {criticalCount} Critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
              {warningCount} Warning
            </Badge>
          )}
          {totalOutlierCount - criticalCount - warningCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalOutlierCount - criticalCount - warningCount} Monitor
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {displayedOutliers.map((outlier) => (
          <OutlierCard
            key={outlier.vehicle.vehicleId}
            outlier={outlier}
            currency={currency}
            onVehicleClick={onVehicleClick}
          />
        ))}

        {outliers.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all {outliers.length} outliers
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TcoOutlierAlert.displayName = 'TcoOutlierAlert';

export default TcoOutlierAlert;

