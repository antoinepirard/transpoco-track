'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import type { Job } from '@/types/fieldService';

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

  // Filter active jobs and calculate risk
  const activeJobs = jobs.filter(
    (j) => !['completed', 'cancelled', 'planned'].includes(j.status)
  );

  type RiskPoint = {
    id: string;
    x: number;
    y: number;
    status: 'green' | 'amber' | 'red';
    label: string;
    priority: Job['priority'];
  };

  const data: RiskPoint[] = activeJobs.map((job) => {
    const now = new Date();
    const windowEnd = new Date(job.windowEnd);
    const estimatedArrival = job.estimatedArrival || now;

    // Calculate risk status
    let riskStatus: 'green' | 'amber' | 'red';
    if (estimatedArrival <= windowEnd) {
      riskStatus = 'green'; // On track
    } else {
      const minutesLate =
        (estimatedArrival.getTime() - windowEnd.getTime()) / (60 * 1000);
      riskStatus = minutesLate > 30 ? 'red' : 'amber';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Map</CardTitle>
        <CardDescription>
          Active jobs • Green: on track, Amber: tight, Red: late
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
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Tight</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Late</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
