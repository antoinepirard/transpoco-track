'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { FieldServiceStats } from '@/types/fieldService';

interface KpiHeaderProps {
  stats: FieldServiceStats | null;
  isLoading?: boolean;
}

export function KpiHeader({ stats, isLoading }: KpiHeaderProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getOnTimeColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 80) return 'text-amber-600';
    return 'text-red-600';
  };

  const getOnTimeBgColor = (percent: number) => {
    if (percent >= 90) return 'bg-green-50 border-green-200';
    if (percent >= 80) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const trendIsPositive = stats.onTimeArrivalTrend > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* On-Time Arrival % */}
      <Card
        className={`${getOnTimeBgColor(stats.onTimeArrivalPercent)} border-1`}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            On-Time Arrival
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-3xl font-bold ${getOnTimeColor(stats.onTimeArrivalPercent)}`}
            >
              {stats.onTimeArrivalPercent.toFixed(1)}%
            </span>
            <div className="flex items-center text-sm">
              {trendIsPositive ? (
                <ArrowUp className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={trendIsPositive ? 'text-green-600' : 'text-red-600'}
              >
                {Math.abs(stats.onTimeArrivalTrend).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            vs 7-day avg • Target ≥90%
          </p>
        </CardContent>
      </Card>

      {/* Jobs Done / Planned */}
      <Card className="border-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Jobs Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-blue-600">
              {stats.jobsDone}
            </span>
            <span className="text-xl text-gray-400">/</span>
            <span className="text-xl text-gray-600">{stats.jobsPlanned}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Forecast EOD:{' '}
            <span className="font-semibold">{stats.jobsForecastEOD}</span>
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${(stats.jobsDone / stats.jobsPlanned) * 100}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Now */}
      <Card className="border-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            At-Risk Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-3">
            <span
              className={`text-3xl font-bold ${
                stats.atRiskCount === 0
                  ? 'text-green-600'
                  : stats.atRiskCount < 5
                    ? 'text-amber-600'
                    : 'text-red-600'
              }`}
            >
              {stats.atRiskCount}
            </span>
            {stats.atRiskCount > 0 && (
              <Badge
                variant={stats.atRiskCount >= 5 ? 'destructive' : 'outline'}
                className="text-xs"
              >
                {stats.atRiskCount >= 5 ? 'Critical' : 'Monitor'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            ETA beyond window in next 60 min
          </p>
        </CardContent>
      </Card>

      {/* First-Time Fix % */}
      <Card className="border-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            First-Time Fix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-3xl font-bold ${
                stats.firstTimeFixPercent >= 85
                  ? 'text-green-600'
                  : stats.firstTimeFixPercent >= 75
                    ? 'text-amber-600'
                    : 'text-red-600'
              }`}
            >
              {stats.firstTimeFixPercent.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Rolling today • Target ≥85%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
