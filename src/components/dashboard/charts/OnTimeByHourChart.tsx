'use client';

import { useState } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Scatter, ComposedChart, ZAxis, Cell } from 'recharts';
import type { OnTimeByWeekData } from '@/types/fieldService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  
  const SLA_TARGET = 85; // move SLA down a bit from 90 to 85

  // Flatten vehicle data for scatter plot (use each vehicle's jittered weekIndex)
  const vehicleScatterData = data.flatMap((weekData) =>
    weekData.vehicles.map((v) => ({
      weekIndex: (v as any).weekIndex ?? (weekData as any).weekIndex,
      week: weekData.week,
      onTimePercent: v.onTimePercent,
      vehicleId: v.vehicleId,
      vehicleName: (v as any).vehicleName || v.vehicleId,
    }))
  );

  // Derive breach/near lists (near = within +2% above SLA)
  const breached = vehicleScatterData
    .filter((pt) => pt.onTimePercent < SLA_TARGET)
    .sort((a, b) => a.onTimePercent - b.onTimePercent);

  const near = vehicleScatterData
    .filter((pt) => pt.onTimePercent >= SLA_TARGET && pt.onTimePercent <= SLA_TARGET + 2)
    .sort((a, b) => a.onTimePercent - b.onTimePercent);

  const [activeFilter, setActiveFilter] = useState<'breached' | 'near'>('breached');
  const [listExpanded, setListExpanded] = useState(false);

  // Calculate trend
  const firstWeek = data[0]?.weeklyPercent || 0;
  const lastWeek = data[data.length - 1]?.weeklyPercent || 0;
  const trend = ((lastWeek - firstWeek) / firstWeek * 100).toFixed(1);
  const trendDirection = parseFloat(trend) >= 0;

  return (
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
            data={data}
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
              domain={[0, data.length - 1]}
              ticks={[0, 1, 2, 3]}
              tickFormatter={(i) => data[i as number]?.week}
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
              y={SLA_TARGET}
              stroke="orange"
              strokeWidth={1}
              label={{ value: `SLA ${SLA_TARGET}%`, position: 'left', fill: 'orange', fontSize: 11 }}
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
                <Cell key={`pt-${idx}`} fill={pt.onTimePercent < SLA_TARGET ? '#ef4444' : 'var(--color-weeklyPercent)'} />
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
  );
}
