'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Scatter, ComposedChart, ZAxis, Cell } from 'recharts';
import type { OnTimeByWeekData } from '@/types/fieldService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { WidgetHoverChrome } from '@/components/dashboard/WidgetHoverChrome';

interface OnTimeByWeekChartProps {
  data: OnTimeByWeekData[];
  isLoading?: boolean;
}

const chartConfig = {
  weeklyPercent: {
    label: 'Weekly On-Time %',
    color: 'var(--chart-1)',
    icon: Activity,
  },
  sevenDayAvg: {
    label: '7-Day Avg',
    color: 'var(--chart-2)',
  },
  target: {
    label: 'SLA Target',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export function OnTimeByHourChart({ data, isLoading }: OnTimeByWeekChartProps) {
  const [activeFilter, setActiveFilter] = useState<'breached' | 'near'>('breached');
  const [listExpanded, setListExpanded] = useState(false);

  type DateRange = 'today' | '7d' | '28d';
  const { settings, update, reset } = useWidgetSettings<{ slaTarget: number; dateRange: DateRange }>(
    'onTimeByHour',
    { slaTarget: 90, dateRange: '7d' }
  );
  
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [] as OnTimeByWeekData[];
    let sliced: OnTimeByWeekData[];
    if (settings.dateRange === 'today') sliced = data.slice(-1);
    else if (settings.dateRange === '7d') sliced = data.slice(-2);
    else if (settings.dateRange === '28d') sliced = data.slice(-4);
    else sliced = data;
    
    // Re-index the filtered data so weekIndex starts at 0
    const reindexed = sliced.map((week, idx) => ({
      ...week,
      weekIndex: idx,
      vehicles: week.vehicles.map(v => ({
        ...v,
        weekIndex: idx + (Math.random() - 0.5) * 0.3, // jitter for scatter
      })),
    }));
    
    // Add boundary points for step area to extend to edges
    if (reindexed.length > 0) {
      const first = reindexed[0];
      const last = reindexed[reindexed.length - 1];
      return [
        { ...first, weekIndex: -0.5, week: '', vehicles: [] },
        ...reindexed,
        { ...last, weekIndex: reindexed.length - 0.5, week: '', vehicles: [] },
      ];
    }
    return reindexed;
  }, [data, settings.dateRange]);

  // Flatten vehicle data for scatter plot
  const vehicleScatterData = filteredData.flatMap((weekData) =>
    weekData.vehicles.map((v) => ({
      weekIndex: v.weekIndex,
      week: weekData.week,
      onTimePercent: v.onTimePercent,
      vehicleId: v.vehicleId,
      vehicleName: v.vehicleName || v.vehicleId,
    }))
  );

  // Derive breach/near lists (near = within +2% above SLA)
  const breached = vehicleScatterData
    .filter((pt) => pt.onTimePercent < settings.slaTarget)
    .sort((a, b) => a.onTimePercent - b.onTimePercent);

  const near = vehicleScatterData
    .filter((pt) => pt.onTimePercent >= settings.slaTarget && pt.onTimePercent <= settings.slaTarget + 2)
    .sort((a, b) => a.onTimePercent - b.onTimePercent);

  

  // Calculate trend
  const firstWeek = filteredData[0]?.weeklyPercent || 0;
  const lastWeek = filteredData[filteredData.length - 1]?.weeklyPercent || 0;
  const trend = ((lastWeek - firstWeek) / firstWeek * 100).toFixed(1);
  const trendDirection = parseFloat(trend) >= 0;

  if (isLoading || !data || data.length === 0) {
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

  return (
    <WidgetHoverChrome
      popover={(
        <div className="grid gap-3">
          <div>
            <div className="text-sm font-medium">On-Time by Week</div>
            <p className="text-xs text-muted-foreground">SLA threshold and date range.</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="otbh-slaTarget">SLA target (%)</label>
            <input
              id="otbh-slaTarget"
              type="number"
              min={50}
              max={100}
              step={1}
              value={settings.slaTarget}
              onChange={(e) => update({ slaTarget: Number(e.target.value) })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="otbh-dateRange">Date range</label>
            <select
              id="otbh-dateRange"
              value={settings.dateRange}
              onChange={(e) => update({ dateRange: e.target.value as DateRange })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="28d">Last 28 days</option>
            </select>
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
        <CardTitle>On-Time Arrival - Weekly</CardTitle>
        <CardDescription>
          Showing weekly on-time performance with vehicle breakdowns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ComposedChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <ZAxis type="number" range={[24, 24]} />
            <XAxis
              type="number"
              dataKey="weekIndex"
              domain={[-0.5, Math.max(0, filteredData.length - 2.5)]}
              ticks={Array.from({ length: filteredData.length - 2 }, (_, i) => i)}
              tickFormatter={(i) => {
                const item = filteredData.find(d => d.weekIndex === i);
                return item?.week || '';
              }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-xs"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name) => {
                  if (name === 'weeklyPercent') return [`${Number(value).toFixed(1)}%`, 'Weekly On-Time'];
                  if (name === 'sevenDayAvg') return [`${Number(value).toFixed(1)}%`, '7-Day Avg'];
                  return [value, name];
                }}
              />}
            />
            
            {/* SLA Target Reference Line (solid, orange) */}
            <ReferenceLine
              y={settings.slaTarget}
              stroke="orange"
              strokeWidth={1}
              label={{ value: `SLA ${settings.slaTarget}%`, position: 'left', fill: 'orange', fontSize: 11 }}
            />
            
            {/* Step Area for Weekly Aggregate */}
            <Area
              dataKey="weeklyPercent"
              type="step"
              fill="var(--color-weeklyPercent)"
              fillOpacity={0.4}
              stroke="var(--color-weeklyPercent)"
              strokeWidth={2}
            />
            
            {/* Scatter dots for individual vehicles */}
            <Scatter
              data={vehicleScatterData}
              dataKey="onTimePercent"
              fill="var(--color-weeklyPercent)"
              fillOpacity={0.7}
            >
              {vehicleScatterData.map((pt, idx) => (
                <Cell key={`pt-${idx}`} fill={pt.onTimePercent < settings.slaTarget ? '#ef4444' : 'var(--color-weeklyPercent)'} />
              ))}
            </Scatter>
          </ComposedChart>
        </ChartContainer>
        {/* Single list with filter for Breached vs Near SLA */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex rounded-md border bg-card shadow-sm">
              <button
                type="button"
                className={cn(
                  'px-3 py-1.5 text-sm rounded-l-md transition-colors',
                  activeFilter === 'breached' ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                )}
                onClick={() => { setActiveFilter('breached'); setListExpanded(false); }}
              >
                Breached ({breached.length})
              </button>
              <button
                type="button"
                className={cn(
                  'px-3 py-1.5 text-sm rounded-r-md transition-colors border-l',
                  activeFilter === 'near' ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                )}
                onClick={() => { setActiveFilter('near'); setListExpanded(false); }}
              >
                Near SLA ({near.length})
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {activeFilter === 'breached' ? breached.length : near.length} items
            </span>
          </div>

          {(() => {
            const list = activeFilter === 'breached' ? breached : near;
            const colorClass = activeFilter === 'breached' ? 'text-red-600' : 'text-amber-600';
            const visible = listExpanded ? list : list.slice(0, 5);

            if (list.length === 0) {
              return (
                <div className="mt-2 text-xs text-muted-foreground">No vehicles in this category for the selected period.</div>
              );
            }

            return (
              <div className="mt-2">
                <div className="max-h-56 overflow-auto rounded-md border divide-y bg-card/50">
                  {visible.map((v, i) => (
                    <div key={`v-${activeFilter}-${v.vehicleId}-${v.weekIndex}-${i}`} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span className="truncate">{v.vehicleName} — {v.week}</span>
                      <span className={`${colorClass} font-mono`}>{v.onTimePercent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
                {list.length > 5 && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="h-7 px-3 text-xs" onClick={() => setListExpanded(!listExpanded)}>
                      {listExpanded ? 'Show top 5' : `Load ${list.length - 5} more`}
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </CardContent>
      {/* Footer removed per request */}
    </Card>
    </WidgetHoverChrome>
  );
}
