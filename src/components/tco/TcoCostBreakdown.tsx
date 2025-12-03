'use client';

import { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TcoCostBucketAmount } from '@/types/cost';
import { formatTcoCurrency } from '@/lib/demo/tcoMockData';
import { cn } from '@/lib/utils';

interface TcoCostBreakdownProps {
  breakdown: TcoCostBucketAmount[];
  totalTco: number;
  currency?: string;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TcoCostBucketAmount;
  }>;
  currency: string;
}

function CustomTooltip({ active, payload, currency }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      <div className="text-lg font-bold tabular-nums">
        {formatTcoCurrency(data.amount, currency)}
      </div>
      <div className="text-xs text-muted-foreground">
        {data.sharePct}% of total TCO
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="h-48 w-48 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const TcoCostBreakdown = memo(function TcoCostBreakdown({
  breakdown,
  totalTco,
  currency = 'EUR',
  isLoading,
}: TcoCostBreakdownProps) {
  // Sort breakdown by amount descending
  const sortedBreakdown = useMemo(
    () => [...breakdown].sort((a, b) => b.amount - a.amount),
    [breakdown]
  );

  // Top 5 buckets + "Other" if more
  const displayData = useMemo(() => {
    if (sortedBreakdown.length <= 6) {
      return sortedBreakdown;
    }

    const top5 = sortedBreakdown.slice(0, 5);
    const others = sortedBreakdown.slice(5);
    const otherTotal = others.reduce((sum, b) => sum + b.amount, 0);
    const otherPct = others.reduce((sum, b) => sum + b.sharePct, 0);

    return [
      ...top5,
      {
        bucket: 'other' as const,
        label: 'Other',
        amount: otherTotal,
        sharePct: otherPct,
        color: '#94a3b8',
      },
    ];
  }, [sortedBreakdown]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Cost Breakdown by Category
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Where your fleet spend goes
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Donut Chart */}
          <div className="relative w-full lg:w-52 h-52 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="amount"
                  stroke="none"
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip currency={currency} />}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums">
                  {formatTcoCurrency(totalTco, currency)}
                </div>
                <div className="text-xs text-muted-foreground">Total TCO</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {displayData.map((item) => (
              <div
                key={item.bucket}
                className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatTcoCurrency(item.amount, currency)}
                  </span>
                  <span
                    className={cn(
                      'text-xs tabular-nums w-12 text-right',
                      item.sharePct >= 30
                        ? 'text-rose-600 font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {item.sharePct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TcoCostBreakdown.displayName = 'TcoCostBreakdown';

export default TcoCostBreakdown;

