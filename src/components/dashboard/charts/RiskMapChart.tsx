'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types/fieldService';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { WidgetHoverChrome } from '@/components/dashboard/WidgetHoverChrome';

interface RiskMapChartProps {
  jobs: Job[];
  isLoading?: boolean;
  onJobClick?: (jobId: string) => void;
}

const chartConfig = {
  risk: {
    label: 'Risk Status',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

export function RiskMapChart({ jobs, isLoading, onJobClick }: RiskMapChartProps) {
  type Priority = 'all' | 'high' | 'medium' | 'low';
  const { settings, update, reset } = useWidgetSettings<{
    amberThreshold: 15 | 30 | 45;
    redThreshold: 30 | 60 | 90;
    filterPriority: Priority;
    hideOnTrack: boolean;
  }>('riskMap', {
    amberThreshold: 30,
    redThreshold: 60,
    filterPriority: 'all',
    hideOnTrack: false,
  });

  type RiskPoint = {
    id: string;
    x: number;
    y: number;
    status: 'green' | 'amber' | 'red';
    label: string;
    priority: Job['priority'];
    minutesFromDeadline: number;
  };

  const data = useMemo(() => {
    // Filter active jobs
    let activeJobs = jobs.filter(
      (j) => !['completed', 'cancelled', 'planned'].includes(j.status)
    );

    // Filter by priority if not 'all'
    if (settings.filterPriority !== 'all') {
      activeJobs = activeJobs.filter(j => j.priority === settings.filterPriority);
    }

    const points: RiskPoint[] = activeJobs.map((job, jobIdx) => {
      const now = new Date();
      const windowEnd = new Date(job.windowEnd);
      const estimatedArrival = job.estimatedArrival || now;

      // Calculate risk status using configurable thresholds
      let riskStatus: 'green' | 'amber' | 'red';
      if (estimatedArrival <= windowEnd) {
        riskStatus = 'green'; // On track
      } else {
        const minutesLate =
          (estimatedArrival.getTime() - windowEnd.getTime()) / (60 * 1000);
        riskStatus = minutesLate > settings.redThreshold ? 'red' : minutesLate > settings.amberThreshold ? 'amber' : 'green';
      }

      // X-axis: Priority level (1=low, 2=medium, 3=high, 4=critical)
      const priorityValue = {
        'low': 1,
        'medium': 2,
        'high': 3,
        'critical': 4,
      }[job.priority];

      // Add deterministic jitter to prevent exact overlaps
      const seed = job.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + jobIdx;
      const random = (Math.sin(seed) * 10000) % 1;
      const xJitter = (random - 0.5) * 0.3; // Small horizontal jitter

      // Y-axis: Minutes from deadline (negative = time remaining, positive = late)
      const minutesFromDeadline = (estimatedArrival.getTime() - windowEnd.getTime()) / (60 * 1000);

      // Add vertical jitter for readability using power law for natural spread
      const seedY = job.id.split('').reverse().reduce((acc, char) => acc + char.charCodeAt(0), 0) + jobIdx;
      const randomY = (Math.sin(seedY) * 10000) % 1;
      const signY = randomY < 0.5 ? -1 : 1;
      const magnitudeY = Math.pow(Math.abs(randomY - 0.5) * 2, 2.0);
      const yJitter = signY * magnitudeY * 2; // Small vertical jitter (±2 minutes)

      return {
        id: job.id,
        x: priorityValue + xJitter,
        y: minutesFromDeadline + yJitter,
        status: riskStatus,
        label: `${job.customer.name.substring(0, 20)}...`,
        priority: job.priority,
        minutesFromDeadline: Math.round(minutesFromDeadline),
      };
    });

    // Filter out on-track jobs if hideOnTrack is enabled
    if (settings.hideOnTrack) {
      return points.filter(p => p.status !== 'green');
    }

    return points;
  }, [jobs, settings.amberThreshold, settings.redThreshold, settings.filterPriority, settings.hideOnTrack]);

  const statusCounts = useMemo(() => {
    const counts = { green: 0, amber: 0, red: 0 };
    data.forEach(pt => counts[pt.status]++);
    return counts;
  }, [data]);

  const getColor = (status: 'green' | 'amber' | 'red') => {
    // Semantic colors independent of chart palette
    if (status === 'green') return '#22c55e'; // green-500/600
    if (status === 'amber') return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{ payload: RiskPoint }>;
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      const absMinutes = Math.abs(point.minutesFromDeadline);
      const timeText = point.minutesFromDeadline <= 0
        ? `${absMinutes} min remaining`
        : `${absMinutes} min LATE`;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{point.label}</p>
          <p className="text-xs text-gray-600">
            Status:{' '}
            <span
              className={`font-semibold ${
                point.status === 'green'
                  ? 'text-green-600'
                  : point.status === 'amber'
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {point.status === 'green'
                ? 'On Track'
                : point.status === 'amber'
                ? 'Tight'
                : 'Late'}
            </span>
          </p>
          <p className="text-xs text-gray-600">
            Time:{' '}
            <span className={`font-semibold ${point.minutesFromDeadline > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {timeText}
            </span>
          </p>
          <p className="text-xs text-gray-600">
            Priority: <span className="font-semibold capitalize">{point.priority}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Click to view details</p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (entry: unknown) => {
    const point = entry as Partial<RiskPoint>;
    if (point && typeof point.id === 'string' && onJobClick) {
      console.log(`[Demo] View job ${point.id} details`);
      onJobClick(point.id);
    }
  };

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

  return (
    <WidgetHoverChrome
      popover={(
        <div className="grid gap-3">
          <div>
            <div className="text-sm font-medium">Risk Map</div>
            <p className="text-xs text-muted-foreground">Configure thresholds and filters.</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="rm-amber">Amber threshold (min late)</label>
            <select
              id="rm-amber"
              value={settings.amberThreshold}
              onChange={(e) => update({ amberThreshold: Number(e.target.value) as 15 | 30 | 45 })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="rm-red">Red threshold (min late)</label>
            <select
              id="rm-red"
              value={settings.redThreshold}
              onChange={(e) => update({ redThreshold: Number(e.target.value) as 30 | 60 | 90 })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="rm-priority">Show priority</label>
            <select
              id="rm-priority"
              value={settings.filterPriority}
              onChange={(e) => update({ filterPriority: e.target.value as Priority })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value="all">All priorities</option>
              <option value="high">High only</option>
              <option value="medium">Medium only</option>
              <option value="low">Low only</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rm-hideOnTrack"
              checked={settings.hideOnTrack}
              onChange={(e) => update({ hideOnTrack: e.target.checked })}
              className="h-4 w-4 rounded border"
            />
            <label htmlFor="rm-hideOnTrack" className="text-xs font-medium">Hide on-track jobs</label>
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
        <CardTitle>Risk Map</CardTitle>
        <CardDescription>
          Priority vs Time Matrix • Higher priority + more late = needs urgent attention • Reference lines show deadline (solid) and thresholds (dashed)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ScatterChart margin={{ top: 10, right: 10, left: 50, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              type="number"
              dataKey="x"
              name="Priority"
              domain={[0.5, 4.5]}
              ticks={[1, 2, 3, 4]}
              tickFormatter={(value) => {
                const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
                return labels[value as 1 | 2 | 3 | 4] || '';
              }}
              className="text-xs"
              label={{ value: 'Priority Level', position: 'bottom', offset: 0 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Minutes from Deadline"
              className="text-xs"
              label={{ value: 'Minutes from Deadline', angle: -90, position: 'insideLeft' }}
            />
            <ZAxis range={[100, 100]} />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" strokeWidth={2} />
            <ReferenceLine y={settings.amberThreshold} stroke="#f59e0b" strokeDasharray="2 2" strokeWidth={1} opacity={0.5} />
            <ReferenceLine y={settings.redThreshold} stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1} opacity={0.5} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={data}
              onClick={handleClick}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          {!settings.hideOnTrack && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span>On Track ({statusCounts.green})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Tight ({statusCounts.amber})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Late ({statusCounts.red})</span>
          </div>
        </div>
      </CardContent>
    </Card>
    </WidgetHoverChrome>
  );
}
