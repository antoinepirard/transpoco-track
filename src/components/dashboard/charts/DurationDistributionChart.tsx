'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import type { Job } from '@/types/fieldService';

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

  // Create buckets
  const buckets = [
    { bucket: '0-30', min: 0, max: 30, count: 0 },
    { bucket: '30-60', min: 30, max: 60, count: 0 },
    { bucket: '60-90', min: 60, max: 90, count: 0 },
    { bucket: '90-120', min: 90, max: 120, count: 0 },
    { bucket: '120+', min: 120, max: Infinity, count: 0 },
  ];

  durations.forEach(({ duration }) => {
    const bucket = buckets.find((b) => duration >= b.min && duration < b.max);
    if (bucket) bucket.count++;
  });

  const data = buckets.map((b) => ({
    bucket: b.bucket,
    count: b.count,
  }));

  // Calculate average duration
  const avgDuration =
    durations.length > 0
      ? durations.reduce((sum, d) => sum + d.duration, 0) / durations.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Duration Distribution</CardTitle>
        <CardDescription>
          Completed jobs today • Avg: {avgDuration.toFixed(0)} min
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
              x={2}
              stroke="var(--color-target)"
              strokeDasharray="5 5"
              label={{
                value: 'Target',
                position: 'top',
                fill: 'var(--color-target)',
              }}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
