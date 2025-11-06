'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
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

    const points: RiskPoint[] = activeJobs.map((job) => {
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

      return {
        id: job.id,
        x: job.customer.longitude,
        y: job.customer.latitude,
        status: riskStatus,
        label: `${job.customer.name.substring(0, 20)}...`,
        priority: job.priority,
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
            Priority: <span className="font-semibold">{point.priority}</span>
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
          Active jobs • Green: on track (&lt;{settings.amberThreshold}m), Amber: {settings.amberThreshold}-{settings.redThreshold}m late, Red: &gt;{settings.redThreshold}m late
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              type="number"
              dataKey="x"
              name="Longitude"
              className="text-xs"
              hide
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Latitude"
              className="text-xs"
              hide
            />
            <ZAxis range={[100, 100]} />
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
