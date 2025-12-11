'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, Car, Route } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TcoFleetSummary, TcoCostBucketAmount } from '@/types/cost';
import { formatTcoCurrency } from '@/lib/demo/tcoMockData';

interface TcoOverviewCardProps {
  summary: TcoFleetSummary;
  currency?: string;
  isLoading?: boolean;
}

function MiniDonutChart({
  breakdown,
  totalTco,
  currency,
}: {
  breakdown: TcoCostBucketAmount[];
  totalTco: number;
  currency: string;
}) {
  // Show top 4 + other
  const displayData = useMemo(() => {
    const sorted = [...breakdown].sort((a, b) => b.amount - a.amount);
    if (sorted.length <= 4) return sorted;

    const top4 = sorted.slice(0, 4);
    const others = sorted.slice(4);
    const otherTotal = others.reduce((sum, b) => sum + b.amount, 0);

    return [
      ...top4,
      {
        bucket: 'other' as const,
        label: 'Other',
        amount: otherTotal,
        sharePct: Math.round((otherTotal / totalTco) * 100),
        color: '#94a3b8',
      },
    ];
  }, [breakdown, totalTco]);

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={48}
            paddingAngle={2}
            dataKey="amount"
            stroke="none"
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground font-medium">
            Total
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse h-full">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-32" />
        <div className="h-4 bg-muted rounded w-48 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="h-28 w-28 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-10 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-24" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export const TcoOverviewCard = memo(function TcoOverviewCard({
  summary,
  currency = 'EUR',
  isLoading,
}: TcoOverviewCardProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const trendPositive = summary.monthOverMonthChange <= 0;
  const TrendIcon = trendPositive ? TrendingDown : TrendingUp;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">TCO Overview</CardTitle>
        <CardDescription>Total Cost of Ownership this month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Main headline with mini donut */}
        <div className="flex items-center gap-4 mb-4">
          <MiniDonutChart
            breakdown={summary.costBreakdown}
            totalTco={summary.totalMonthlyTco}
            currency={currency}
          />
          <div className="flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold tracking-tight tabular-nums">
                {formatTcoCurrency(summary.totalMonthlyTco, currency)}
              </span>
              <div
                className={cn(
                  'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium',
                  trendPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(summary.monthOverMonthChange).toFixed(1)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs last month · {summary.totalVehicles} vehicles
            </p>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Route className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-wide font-medium">
                Per km
              </span>
            </div>
            <span className="text-lg font-semibold tabular-nums">
              €{summary.tcoPerKm.toFixed(2)}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Car className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-wide font-medium">
                Per vehicle
              </span>
            </div>
            <span className="text-lg font-semibold tabular-nums">
              {formatTcoCurrency(summary.tcoPerVehicle, currency)}
            </span>
          </div>
        </div>

        {/* Top cost buckets legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs">
          {summary.costBreakdown.slice(0, 3).map((item) => (
            <div key={item.bucket} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.sharePct}%</span>
            </div>
          ))}
        </div>

        {/* Action link */}
        <div className="mt-auto pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            asChild
          >
            <Link href="/cost-management">
              View Cost Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TcoOverviewCard.displayName = 'TcoOverviewCard';

export default TcoOverviewCard;
