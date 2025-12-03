import { memo, useMemo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

import type { CostDashboardData, CostDashboardRole } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface TcoKpisProps {
  data: CostDashboardData;
  role: CostDashboardRole;
}

const numberFormatter = new Intl.NumberFormat('en-IE', {
  maximumFractionDigits: 0,
});

export const TcoKpis = memo(function TcoKpis({ data, role }: TcoKpisProps) {
  const { tco, trend } = data;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: data.currency ?? 'EUR',
        maximumFractionDigits: 0,
      }),
    [data.currency]
  );

  const perKmFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: data.currency ?? 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [data.currency]
  );

  const changePositive = (tco?.monthChangePct ?? 0) <= 0;

  const secondaryMetrics = [
    {
      label: 'Cost / km',
      value: perKmFormatter.format(tco.costPerKm),
      helper: 'Blended fuel + maintenance load',
    },
    {
      label: 'Vehicles tracked',
      value: numberFormatter.format(tco.vehiclesTracked),
      helper: 'Active in last 30 days',
    },
    {
      label: 'Km captured',
      value: numberFormatter.format(tco.totalKm),
      helper: 'Monthly odometer feed',
    },
  ];

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-col gap-2 pb-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">Cost per vehicle</CardTitle>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              changePositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
            aria-live="polite"
          >
            {changePositive ? '▼' : '▲'}
            {Math.abs(tco.monthChangePct).toFixed(1)}% vs last month
          </span>
        </div>
        <p className="text-3xl font-semibold tracking-tight" aria-label="Cost per vehicle per month">
          {currencyFormatter.format(tco.costPerVehicle)}
          <span className="text-base font-normal text-muted-foreground"> / vehicle / month</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Total monthly cost {currencyFormatter.format(tco.totalMonthlyCost)}{' '}
          {role === 'cfo' ? 'including depreciation + insurance' : 'across live fleet'}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          {trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">No historical data yet.</p>
          ) : (
            <ChartContainer
              id="tco-trend"
              config={{
                tco: {
                  label: 'Cost per vehicle',
                  color: 'hsl(160, 84%, 39%)',
                },
              }}
              className="h-48 w-full"
            >
              <LineChart data={trend}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} />
                <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-tco)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          )}
        </div>
        <div className="flex flex-col gap-3" aria-label="Supporting metrics">
          {secondaryMetrics.map(metric => (
            <div key={metric.label} className="rounded-lg border bg-background px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{metric.label}</p>
              <p className="text-xl font-semibold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.helper}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

TcoKpis.displayName = 'TcoKpis';

