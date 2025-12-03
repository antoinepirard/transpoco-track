'use client';

import { memo } from 'react';
import { TrendingUp, TrendingDown, Car, Route, Clock, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TcoFleetSummary } from '@/types/cost';
import { formatTcoCurrency, formatTcoNumber } from '@/lib/demo/tcoMockData';

interface TcoKpiHeaderProps {
  summary: TcoFleetSummary;
  currency?: string;
  isLoading?: boolean;
}

interface KpiCardProps {
  label: string;
  value: string;
  subtext: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  highlight?: boolean;
  dataQuality?: number;
}

function KpiCard({
  label,
  value,
  subtext,
  trend,
  trendLabel,
  icon,
  highlight,
  dataQuality,
}: KpiCardProps) {
  const hasTrend = trend !== undefined;
  const trendPositive = trend !== undefined && trend <= 0; // Lower cost = positive
  const TrendIcon = trendPositive ? TrendingDown : TrendingUp;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        highlight && 'ring-2 ring-primary/20 bg-primary/[0.02]'
      )}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span className="text-xs font-medium uppercase tracking-wide">
              {label}
            </span>
          </div>
          {dataQuality !== undefined && (
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span
                className={cn(
                  'text-[10px] font-medium',
                  dataQuality >= 90 ? 'text-emerald-600' :
                  dataQuality >= 70 ? 'text-amber-600' : 'text-rose-600'
                )}
              >
                {dataQuality}%
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight tabular-nums">
              {value}
            </span>
            {hasTrend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
                  trendPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {subtext}
            {trendLabel && (
              <span className="ml-1 text-muted-foreground/70">
                · {trendLabel}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingKpiCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-5 pb-4">
        <div className="h-4 bg-muted rounded w-24 mb-3" />
        <div className="h-8 bg-muted rounded w-32 mb-2" />
        <div className="h-3 bg-muted rounded w-20" />
      </CardContent>
    </Card>
  );
}

export const TcoKpiHeader = memo(function TcoKpiHeader({
  summary,
  currency = 'EUR',
  isLoading,
}: TcoKpiHeaderProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <LoadingKpiCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Fleet TCO */}
      <KpiCard
        label="Total Fleet TCO"
        value={formatTcoCurrency(summary.totalMonthlyTco, currency)}
        subtext="this month"
        trend={summary.monthOverMonthChange}
        trendLabel="vs last month"
        icon={<Car className="h-4 w-4" />}
        highlight
        dataQuality={summary.dataCompleteness}
      />

      {/* TCO per km */}
      <KpiCard
        label="TCO per km"
        value={`€${summary.tcoPerKm.toFixed(2)}`}
        subtext="all-in cost per kilometre"
        icon={<Route className="h-4 w-4" />}
      />

      {/* TCO per Vehicle */}
      <KpiCard
        label="TCO per Vehicle"
        value={formatTcoCurrency(summary.tcoPerVehicle, currency)}
        subtext={`${formatTcoNumber(summary.activeVehicles)} of ${formatTcoNumber(summary.totalVehicles)} active`}
        icon={<Car className="h-4 w-4" />}
      />

      {/* TCO per Hour */}
      <KpiCard
        label="TCO per Hour"
        value={`€${summary.tcoPerHour.toFixed(2)}`}
        subtext="operational hour cost"
        trend={summary.yearOverYearChange}
        trendLabel="vs last year"
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
});

TcoKpiHeader.displayName = 'TcoKpiHeader';

export default TcoKpiHeader;

