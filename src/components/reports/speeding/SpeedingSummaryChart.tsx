'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { SpeedingData } from '@/types/speeding';

interface SpeedingSummaryChartProps {
  data: SpeedingData[];
  fleetAverage: number;
  viewMode: 'overall' | 'severity';
  groupBy: 'vehicle' | 'driver';
}

const chartConfig = {
  speedingPercentage: { label: 'Speeding %', color: 'hsl(var(--chart-1))' },
  mild: { label: 'Mild (11-20%)', color: 'hsl(var(--chart-1))' },
  moderate: { label: 'Moderate (21-30%)', color: 'hsl(var(--chart-2))' },
  severe: { label: 'Severe (>30%)', color: 'hsl(var(--destructive))' },
} satisfies ChartConfig;

export function SpeedingSummaryChart({
  data,
  fleetAverage,
  viewMode,
  groupBy,
}: SpeedingSummaryChartProps) {
  const chartData = useMemo(() => {
    // Limit to top 10 for better visibility
    return data.slice(0, 10).map((item) => ({
      name: item.name,
      speedingPercentage: item.speedingPercentage,
      mild: item.severityBreakdown.mild,
      moderate: item.severityBreakdown.moderate,
      severe: item.severityBreakdown.severe,
      isWorst: item.id === data[0]?.id,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available
      </div>
    );
  }

  const worstName = chartData[0]?.name || '';

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Top 10 {groupBy === 'vehicle' ? 'vehicles' : 'drivers'} ranked by speeding % (worst to best)
      </div>
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 'dataMax']}
            tickFormatter={(value) => `${value}%`}
            className="text-xs"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            className="text-xs"
            tickFormatter={(value) => {
              // Truncate long names
              return value.length > 18 ? `${value.substring(0, 18)}...` : value;
            }}
          />
          <ChartTooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    speedingPercentage: 'Speeding %',
                    mild: 'Mild (11-20%)',
                    moderate: 'Moderate (21-30%)',
                    severe: 'Severe (>30%)',
                  };
                  return [`${Number(value).toFixed(2)}%`, labels[name as string] || name];
                }}
              />
            }
          />
          {/* Fleet average reference line */}
          <ReferenceLine
            x={fleetAverage}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 5"
            label={{
              value: `Fleet avg: ${fleetAverage.toFixed(2)}%`,
              position: 'top',
              fontSize: 11,
              fill: 'hsl(var(--muted-foreground))',
            }}
          />

          {viewMode === 'overall' ? (
            // Overall view - simple bars
            <Bar dataKey="speedingPercentage" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isWorst
                      ? 'hsl(var(--destructive))'
                      : 'hsl(var(--chart-1))'
                  }
                  opacity={entry.isWorst ? 1 : 0.8}
                />
              ))}
            </Bar>
          ) : (
            // Severity view - stacked bars
            <>
              <Bar
                dataKey="mild"
                stackId="severity"
                fill="hsl(var(--chart-1))"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="moderate"
                stackId="severity"
                fill="hsl(var(--chart-2))"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="severe"
                stackId="severity"
                fill="hsl(var(--destructive))"
                radius={[0, 4, 4, 0]}
              />
            </>
          )}
        </BarChart>
      </ChartContainer>
      {viewMode === 'overall' && worstName && (
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-destructive" />
            Worst performer
          </span>
        </div>
      )}
    </div>
  );
}
