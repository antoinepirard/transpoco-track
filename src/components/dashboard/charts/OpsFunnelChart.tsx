'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';

interface OpsFunnelChartProps {
  funnel: {
    planned: number;
    dispatched: number;
    arrived: number;
    completed: number;
  };
  isLoading?: boolean;
}

const chartConfig = {
  planned: { label: 'Planned', color: 'var(--chart-3)' },
  dispatched: { label: 'Dispatched', color: 'var(--chart-2)' },
  arrived: { label: 'Arrived', color: 'var(--chart-2)' },
  completed: { label: 'Completed', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const STAGE_COLORS = {
  planned: 'var(--color-planned)',
  dispatched: 'var(--color-dispatched)',
  arrived: 'var(--color-arrived)',
  completed: 'var(--color-completed)',
};

export function OpsFunnelChart({ funnel, isLoading }: OpsFunnelChartProps) {
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

  const data = [
    { stage: 'Planned', count: funnel.planned, color: STAGE_COLORS.planned },
    { stage: 'Dispatched', count: funnel.dispatched, color: STAGE_COLORS.dispatched },
    { stage: 'Arrived', count: funnel.arrived, color: STAGE_COLORS.arrived },
    { stage: 'Completed', count: funnel.completed, color: STAGE_COLORS.completed },
  ];

  const conversionRate = funnel.planned > 0 ? ((funnel.completed / funnel.planned) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operations Funnel</CardTitle>
        <CardDescription>
          Job progression • {conversionRate}% completion rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={data} accessibilityLayer margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="stage"
              className="text-xs"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              className="text-xs"
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    const stage = props.payload.stage;
                    const percent =
                      funnel.planned > 0
                        ? ((Number(value) / funnel.planned) * 100).toFixed(1)
                        : '0';
                    return [`${value} jobs (${percent}%)`, stage];
                  }}
                />
              }
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
