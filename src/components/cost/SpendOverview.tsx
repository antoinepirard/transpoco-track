'use client';

import { memo, useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis } from 'recharts';
import { TrendingDown, TrendingUp, CheckCircle, Database } from 'lucide-react';
import type { CostDashboardData } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SpendOverviewProps {
  data: CostDashboardData;
}

const numberFormatter = new Intl.NumberFormat('en-IE', {
  maximumFractionDigits: 0,
});

export const SpendOverview = memo(function SpendOverview({
  data,
}: SpendOverviewProps) {
  const { tco, trend, currency } = data;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: currency ?? 'EUR',
        maximumFractionDigits: 0,
      }),
    [currency]
  );

  const changePositive = (tco?.monthChangePct ?? 0) <= 0;
  const TrendIcon = changePositive ? TrendingDown : TrendingUp;

  const metrics = [
    {
      label: 'Cost / Vehicle',
      value: currencyFormatter.format(tco.costPerVehicle),
      subtext: 'per month',
    },
    {
      label: 'Vehicles Tracked',
      value: numberFormatter.format(tco.vehiclesTracked),
      subtext: 'active this month',
    },
    {
      label: 'Data Completeness',
      value: `${tco.dataCompleteness}%`,
      subtext: 'verified from sources',
      isData: true,
    },
  ];

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">
              Verified Monthly Spend
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Total fleet costs from connected data sources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                changePositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {Math.abs(tco.monthChangePct).toFixed(1)}% vs last month
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">
            {currencyFormatter.format(tco.totalMonthlyCost)}
          </span>
          <span className="text-sm text-muted-foreground">this month</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            {tco.dataCompleteness}% of spend verified from connected sources
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sparkline */}
        <div className="rounded-lg border bg-slate-50/50 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            6-Month Trend
          </p>
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">No historical data yet.</p>
          ) : (
            <ChartContainer
              id="spend-trend"
              config={{
                spend: {
                  label: 'Monthly Spend',
                  color: 'hsl(215, 20%, 65%)',
                },
              }}
              className="h-20 w-full"
            >
              <LineChart data={trend}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickMargin={4}
                />
                <ChartTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={<ChartTooltipContent />}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-spend)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(
                'rounded-lg border p-3',
                metric.isData && 'bg-blue-50/50 border-blue-100'
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {metric.isData && (
                  <Database className="h-3.5 w-3.5 text-blue-600" />
                )}
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  {metric.label}
                </p>
              </div>
              <p className="text-xl font-semibold">{metric.value}</p>
              <p className="text-[11px] text-muted-foreground">{metric.subtext}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

SpendOverview.displayName = 'SpendOverview';

