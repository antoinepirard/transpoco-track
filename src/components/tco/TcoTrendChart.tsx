'use client';

import { memo, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TcoMonthlyTrend } from '@/types/cost';
import { formatTcoCurrency, formatTcoNumber } from '@/lib/demo/tcoMockData';

interface TcoTrendChartProps {
  trend: TcoMonthlyTrend[];
  currency?: string;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TcoMonthlyTrend;
  }>;
  currency: string;
}

function CustomTooltip({ active, payload, currency }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-lg min-w-[160px]">
      <div className="font-medium text-sm mb-2 pb-1 border-b">
        {data.month}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total TCO</span>
          <span className="text-sm font-semibold tabular-nums">
            {formatTcoCurrency(data.totalTco, currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Per Vehicle</span>
          <span className="text-sm tabular-nums">
            {formatTcoCurrency(data.tcoPerVehicle, currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Per km</span>
          <span className="text-sm tabular-nums">
            €{data.tcoPerKm.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Vehicles</span>
          <span className="text-sm tabular-nums">
            {formatTcoNumber(data.vehicleCount)}
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-32" />
      </CardHeader>
      <CardContent>
        <div className="h-52 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

export const TcoTrendChart = memo(function TcoTrendChart({
  trend,
  currency = 'EUR',
  isLoading,
}: TcoTrendChartProps) {
  // Format for abbreviated currency in Y axis
  const formatYAxis = useMemo(() => {
    return (value: number) => {
      if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `€${(value / 1000).toFixed(0)}K`;
      }
      return `€${value}`;
    };
  }, []);

  // Calculate domain for Y axis (with some padding)
  const yDomain = useMemo(() => {
    if (trend.length === 0) return [0, 100000];
    const values = trend.map((t) => t.totalTco);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [Math.floor((min - padding) / 10000) * 10000, Math.ceil((max + padding) / 10000) * 10000];
  }, [trend]);

  // Calculate month-over-month change
  const momChange = useMemo(() => {
    if (trend.length < 2) return null;
    const current = trend[trend.length - 1].totalTco;
    const previous = trend[trend.length - 2].totalTco;
    return ((current - previous) / previous) * 100;
  }, [trend]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (trend.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold">TCO Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-52">
          <p className="text-sm text-muted-foreground">
            Not enough data to show trend
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              6-Month TCO Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly fleet spend over time
            </p>
          </div>
          {momChange !== null && (
            <div
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                momChange <= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {momChange <= 0 ? '↓' : '↑'} {Math.abs(momChange).toFixed(1)}% MoM
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tcoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickMargin={8}
                tickFormatter={(value) => value.split(' ')[0]} // Just show month name
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={formatYAxis}
                domain={yDomain}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip currency={currency} />}
                cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="totalTco"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#tcoGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#3b82f6', strokeWidth: 2, stroke: '#fff', r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
});

TcoTrendChart.displayName = 'TcoTrendChart';

export default TcoTrendChart;

