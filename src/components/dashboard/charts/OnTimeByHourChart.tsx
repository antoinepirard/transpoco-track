'use client';

import { TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Scatter, ComposedChart, ZAxis, Cell } from 'recharts';
import type { OnTimeByWeekData } from '@/types/fieldService';

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
    }))
  );

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
                <Cell key={`pt-${idx}`} fill={pt.onTimePercent > SLA_TARGET ? '#ef4444' : 'var(--color-weeklyPercent)'} />
              ))}
            </Scatter>
          </ComposedChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendDirection ? 'Trending up' : 'Trending down'} by {Math.abs(parseFloat(trend))}% this month{' '}
              <TrendingUp className={`h-4 w-4 ${!trendDirection && 'rotate-180'}`} />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Last 4 weeks • Dots show individual vehicle performance
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
