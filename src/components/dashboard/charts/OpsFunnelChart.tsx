'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { WidgetHoverChrome } from '@/components/dashboard/WidgetHoverChrome';

interface OpsFunnelChartProps {
  funnel: {
    planned: number;
    dispatched: number;
    arrived: number;
    completed: number;
  };
  isLoading?: boolean;
}

const chartConfig = {
  planned: { label: 'Planned', color: 'var(--chart-3)' },
  dispatched: { label: 'Dispatched', color: 'var(--chart-2)' },
  arrived: { label: 'Arrived', color: 'var(--chart-2)' },
  completed: { label: 'Completed', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const STAGE_COLORS = {
  planned: 'var(--color-planned)',
  dispatched: 'var(--color-dispatched)',
  arrived: 'var(--color-arrived)',
  completed: 'var(--color-completed)',
};

export function OpsFunnelChart({ funnel, isLoading }: OpsFunnelChartProps) {
  type DateRange = 'today' | '7d' | '28d';
  const { settings, update, reset } = useWidgetSettings<{
    dateRange: DateRange;
    showPercentages: boolean;
    targetCompletionRate: number;
  }>('opsFunnel', {
    dateRange: 'today',
    showPercentages: false,
    targetCompletionRate: 85,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { stage: 'Planned', count: funnel.planned, color: STAGE_COLORS.planned },
    { stage: 'Dispatched', count: funnel.dispatched, color: STAGE_COLORS.dispatched },
    { stage: 'Arrived', count: funnel.arrived, color: STAGE_COLORS.arrived },
    { stage: 'Completed', count: funnel.completed, color: STAGE_COLORS.completed },
  ];

  const conversionRate = funnel.planned > 0 ? ((funnel.completed / funnel.planned) * 100).toFixed(1) : '0';
  const targetMet = parseFloat(conversionRate) >= settings.targetCompletionRate;

  return (
    <WidgetHoverChrome
      popover={(
        <div className="grid gap-3">
          <div>
            <div className="text-sm font-medium">Operations Funnel</div>
            <p className="text-xs text-muted-foreground">Configure display and targets.</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="of-dateRange">Date range</label>
            <select
              id="of-dateRange"
              value={settings.dateRange}
              onChange={(e) => update({ dateRange: e.target.value as DateRange })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="28d">Last 28 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="of-showPercentages"
              checked={settings.showPercentages}
              onChange={(e) => update({ showPercentages: e.target.checked })}
              className="h-4 w-4 rounded border"
            />
            <label htmlFor="of-showPercentages" className="text-xs font-medium">Show percentages on bars</label>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="of-target">Target completion rate (%)</label>
            <input
              id="of-target"
              type="number"
              min={0}
              max={100}
              step={5}
              value={settings.targetCompletionRate}
              onChange={(e) => update({ targetCompletionRate: Number(e.target.value) })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Button variant="outline" size="sm" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </div>
      )}
    >
      <Card>
      <CardHeader>
        <CardTitle>Operations Funnel</CardTitle>
        <CardDescription>
          Job progression • {conversionRate}% completion rate
          {targetMet ? ' ✓' : ` (target: ${settings.targetCompletionRate}%)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={data} accessibilityLayer margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="stage"
              className="text-xs"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              className="text-xs"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    const stage = props.payload.stage;
                    const percent =
                      funnel.planned > 0
                        ? ((Number(value) / funnel.planned) * 100).toFixed(1)
                        : '0';
                    return [`${value} jobs (${percent}%)`, stage];
                  }}
                />
              }
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </WidgetHoverChrome>
  );
}
