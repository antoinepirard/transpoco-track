'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { TechUtilizationData } from '@/types/fieldService';

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

  // Take top 10 techs for display
  const topTechs = data.slice(0, 10);

  const handleBarClick = (data: any) => {
    if (onTechClick && data?.techId) {
      console.log(`[Demo] Reassign ${data.techName}`);
      onTechClick(data.techId, data.techName);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technician Utilization</CardTitle>
        <CardDescription>
          Today • Click to reassign • Top 10 by utilization
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
            <Bar
              dataKey="idleMinutes"
              stackId="a"
              fill="var(--color-idleMinutes)"
              radius={[0, 4, 4, 0]}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
