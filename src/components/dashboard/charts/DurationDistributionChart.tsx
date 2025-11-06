'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types/fieldService';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { WidgetHoverChrome } from '@/components/dashboard/WidgetHoverChrome';

interface DurationDistributionChartProps {
  jobs: Job[];
  isLoading?: boolean;
}

const chartConfig = {
  count: {
    label: 'Jobs',
    color: 'var(--chart-1)',
  },
  target: {
    label: 'Target',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export function DurationDistributionChart({
  jobs,
  isLoading,
}: DurationDistributionChartProps) {
  type DateRange = 'today' | '7d' | '28d';
  const { settings, update, reset } = useWidgetSettings<{
    bucketSize: 15 | 30 | 60;
    targetDuration: number;
    dateRange: DateRange;
    showAvgLine: boolean;
  }>('durationDistribution', {
    bucketSize: 30,
    targetDuration: 60,
    dateRange: 'today',
    showAvgLine: false,
  });

  const { data, avgDuration, targetBucketIndex } = useMemo(() => {
    // Calculate durations for completed jobs
    const completedJobs = jobs.filter(
      (j) => j.status === 'completed' && j.arrivedAt && j.completedAt
    );

    const durations = completedJobs.map((job) => {
      const duration =
        (new Date(job.completedAt!).getTime() - new Date(job.arrivedAt!).getTime()) /
        (60 * 1000);
      return {
        duration,
        planned: job.plannedDuration,
      };
    });

    // Dynamically create buckets based on bucket size
    const maxDuration = Math.max(...durations.map(d => d.duration), settings.targetDuration + settings.bucketSize);
    const numBuckets = Math.ceil(maxDuration / settings.bucketSize);
    const buckets = Array.from({ length: numBuckets }, (_, i) => {
      const min = i * settings.bucketSize;
      const max = (i + 1) * settings.bucketSize;
      const label = i === numBuckets - 1 ? `${min}+` : `${min}-${max}`;
      return { bucket: label, min, max, count: 0 };
    });

    durations.forEach(({ duration }) => {
      const bucketIndex = Math.min(Math.floor(duration / settings.bucketSize), buckets.length - 1);
      if (buckets[bucketIndex]) buckets[bucketIndex].count++;
    });

    const chartData = buckets.map((b) => ({
      bucket: b.bucket,
      count: b.count,
    }));

    // Calculate average duration
    const avg =
      durations.length > 0
        ? durations.reduce((sum, d) => sum + d.duration, 0) / durations.length
        : 0;

    // Find which bucket the target duration falls into
    const targetIdx = Math.floor(settings.targetDuration / settings.bucketSize);

    return { data: chartData, avgDuration: avg, targetBucketIndex: targetIdx };
  }, [jobs, settings.bucketSize, settings.targetDuration]);

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

  const avgBucketIndex = Math.floor(avgDuration / settings.bucketSize);

  return (
    <WidgetHoverChrome
      popover={(
        <div className="grid gap-3">
          <div>
            <div className="text-sm font-medium">Duration Distribution</div>
            <p className="text-xs text-muted-foreground">Configure buckets and targets.</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="dd-bucketSize">Bucket size (min)</label>
            <select
              id="dd-bucketSize"
              value={settings.bucketSize}
              onChange={(e) => update({ bucketSize: Number(e.target.value) as 15 | 30 | 60 })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="dd-target">Target duration (min)</label>
            <input
              id="dd-target"
              type="number"
              min={0}
              max={300}
              step={15}
              value={settings.targetDuration}
              onChange={(e) => update({ targetDuration: Number(e.target.value) })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="dd-dateRange">Date range</label>
            <select
              id="dd-dateRange"
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
              id="dd-showAvg"
              checked={settings.showAvgLine}
              onChange={(e) => update({ showAvgLine: e.target.checked })}
              className="h-4 w-4 rounded border"
            />
            <label htmlFor="dd-showAvg" className="text-xs font-medium">Show average line</label>
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
        <CardTitle>Job Duration Distribution</CardTitle>
        <CardDescription>
          Completed jobs today • Avg: {avgDuration.toFixed(0)} min • Target: {settings.targetDuration} min
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={data} accessibilityLayer margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="bucket"
              label={{ value: 'Duration (minutes)', position: 'insideBottom', offset: -5 }}
              className="text-xs"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              label={{ value: 'Number of Jobs', angle: -90, position: 'insideLeft' }}
              className="text-xs"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    const bucket = props.payload.bucket;
                    return [`${value} jobs`, `${bucket} minutes`];
                  }}
                />
              }
            />
            <ReferenceLine
              x={targetBucketIndex}
              stroke="var(--color-target)"
              strokeDasharray="5 5"
              label={{
                value: `Target ${settings.targetDuration}m`,
                position: 'top',
                fill: 'var(--color-target)',
                fontSize: 11,
              }}
            />
            {settings.showAvgLine && avgDuration > 0 && (
              <ReferenceLine
                x={avgBucketIndex}
                stroke="hsl(var(--primary))"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{
                  value: `Avg ${avgDuration.toFixed(0)}m`,
                  position: 'top',
                  fill: 'hsl(var(--primary))',
                  fontSize: 11,
                }}
              />
            )}
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </WidgetHoverChrome>
  );
}
