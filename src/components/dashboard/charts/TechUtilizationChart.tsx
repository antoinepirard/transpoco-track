'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import type { TechUtilizationData } from '@/types/fieldService';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { WidgetHoverChrome } from '@/components/dashboard/WidgetHoverChrome';

interface TechUtilizationChartProps {
  data: TechUtilizationData[];
  isLoading?: boolean;
  onTechClick?: (techId: string, techName: string) => void;
}

const chartConfig = {
  wrenchMinutes: {
    label: 'On-Site',
    color: 'var(--chart-1)',
  },
  driveMinutes: {
    label: 'Driving',
    color: 'var(--chart-2)',
  },
  idleMinutes: {
    label: 'Idle',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export function TechUtilizationChart({
  data,
  isLoading,
  onTechClick,
}: TechUtilizationChartProps) {
  type SortBy = 'utilization' | 'wrenchTime' | 'idleTime';
  const { settings, update, reset } = useWidgetSettings<{
    topN: 5 | 10 | 15 | 20;
    sortBy: SortBy;
    hideIdle: boolean;
    minUtilization: number;
  }>('techUtilization', {
    topN: 10,
    sortBy: 'utilization',
    hideIdle: false,
    minUtilization: 0,
  });

  const processedData = useMemo(() => {
    // Calculate total utilization for each tech
    const withUtilization = data.map(tech => ({
      ...tech,
      totalMinutes: tech.wrenchMinutes + tech.driveMinutes + tech.idleMinutes,
      utilization: tech.wrenchMinutes + tech.driveMinutes,
    }));

    // Filter by minimum utilization threshold
    const filtered = withUtilization.filter(tech => {
      const utilizationPercent = tech.totalMinutes > 0 
        ? (tech.utilization / tech.totalMinutes) * 100 
        : 0;
      return utilizationPercent >= settings.minUtilization;
    });

    // Sort based on selected metric
    const sorted = [...filtered].sort((a, b) => {
      if (settings.sortBy === 'wrenchTime') return b.wrenchMinutes - a.wrenchMinutes;
      if (settings.sortBy === 'idleTime') return b.idleMinutes - a.idleMinutes;
      return b.utilization - a.utilization; // default: total utilization
    });

    // Take top N
    return sorted.slice(0, settings.topN);
  }, [data, settings.topN, settings.sortBy, settings.minUtilization]);

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

  const topTechs = processedData;

  const handleBarClick = (entry: unknown, _index: number) => {
    const d = entry as Partial<TechUtilizationData>;
    if (onTechClick && typeof d?.techId === 'string' && typeof d?.techName === 'string') {
      console.log(`[Demo] Reassign ${d.techName}`);
      onTechClick(d.techId, d.techName);
    }
  };

  return (
    <WidgetHoverChrome
      popover={(
        <div className="grid gap-3">
          <div>
            <div className="text-sm font-medium">Technician Utilization</div>
            <p className="text-xs text-muted-foreground">Configure display and filtering.</p>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="tu-topN">Show top N</label>
            <select
              id="tu-topN"
              value={settings.topN}
              onChange={(e) => update({ topN: Number(e.target.value) as 5 | 10 | 15 | 20 })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="tu-sortBy">Sort by</label>
            <select
              id="tu-sortBy"
              value={settings.sortBy}
              onChange={(e) => update({ sortBy: e.target.value as SortBy })}
              className="h-8 w-full rounded-md border bg-background px-2 text-sm"
            >
              <option value="utilization">Total utilization</option>
              <option value="wrenchTime">Wrench time</option>
              <option value="idleTime">Idle time</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tu-hideIdle"
              checked={settings.hideIdle}
              onChange={(e) => update({ hideIdle: e.target.checked })}
              className="h-4 w-4 rounded border"
            />
            <label htmlFor="tu-hideIdle" className="text-xs font-medium">Hide idle time</label>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium" htmlFor="tu-minUtil">Min utilization (%)</label>
            <input
              id="tu-minUtil"
              type="number"
              min={0}
              max={100}
              step={5}
              value={settings.minUtilization}
              onChange={(e) => update({ minUtilization: Number(e.target.value) })}
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
        <CardTitle>Technician Utilization</CardTitle>
        <CardDescription>
          Today • Click to reassign • Top {settings.topN} by {settings.sortBy === 'wrenchTime' ? 'wrench time' : settings.sortBy === 'idleTime' ? 'idle time' : 'utilization'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart
            data={topTechs}
            layout="vertical"
            accessibilityLayer
            margin={{ top: 10, right: 10, left: 80, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              type="number"
              className="text-xs"
              tickFormatter={(value) => `${value}m`}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
            />
            <YAxis
              dataKey="techName"
              type="category"
              className="text-xs"
              width={75}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const label =
                      name === 'wrenchMinutes'
                        ? 'On-Site'
                        : name === 'driveMinutes'
                        ? 'Driving'
                        : 'Idle';
                    return [`${value} min`, label];
                  }}
                />
              }
            />
            <Bar
              dataKey="wrenchMinutes"
              stackId="a"
              fill="var(--color-wrenchMinutes)"
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Bar
              dataKey="driveMinutes"
              stackId="a"
              fill="var(--color-driveMinutes)"
              radius={[0, 0, 0, 0]}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
            {!settings.hideIdle && (
              <Bar
                dataKey="idleMinutes"
                stackId="a"
                fill="var(--color-idleMinutes)"
                radius={[0, 4, 4, 0]}
                onClick={handleBarClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </WidgetHoverChrome>
  );
}
