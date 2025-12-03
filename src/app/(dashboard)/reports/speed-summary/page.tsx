'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpeedingSummaryChart } from '@/components/reports/speeding/SpeedingSummaryChart';
import { SpeedingTable } from '@/components/reports/speeding/SpeedingTable';
import { SpeedingInfoTooltip } from '@/components/reports/speeding/SpeedingInfoTooltip';
import type { SpeedingStatsResponse } from '@/types/speeding';

export default function SpeedSummaryPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const thirtyDaysAgo = useMemo(
    () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    []
  );

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [groupBy, setGroupBy] = useState<'vehicle' | 'driver'>('vehicle');
  const [viewMode, setViewMode] = useState<'overall' | 'severity'>('overall');
  const [data, setData] = useState<SpeedingStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        groupBy,
      });
      const response = await fetch(`/api/reports/speeding?${params}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch speeding data:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, groupBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const worstPerformer = data?.data[0];
  const fleetAverage = data?.fleetAverage || 0;

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 bg-gray-50">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Speed Summary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze speeding patterns per vehicle and driver
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col">
              <label className="mb-1.5 text-xs font-medium text-gray-600">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1.5 text-xs font-medium text-gray-600">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1.5 text-xs font-medium text-gray-600">
                Group By
              </label>
              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setGroupBy('vehicle')}
                  className={`px-4 h-9 text-sm font-medium transition-colors ${
                    groupBy === 'vehicle'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  Vehicle
                </button>
                <button
                  onClick={() => setGroupBy('driver')}
                  className={`px-4 h-9 text-sm font-medium transition-colors border-l ${
                    groupBy === 'driver'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted'
                  }`}
                >
                  Driver
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insight Banner */}
      {!loading && worstPerformer && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                <span className="font-semibold">{worstPerformer.name}</span> is your worst{' '}
                {groupBy} for speeding.
              </p>
              <p className="text-sm text-amber-800 mt-1">
                Over the last {Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days,{' '}
                <span className="font-semibold">{worstPerformer.speedingPercentage.toFixed(2)}%</span>{' '}
                of its tracker updates were above the speed limit{' '}
                (fleet average: {fleetAverage.toFixed(2)}%).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>
                Speeding % (of tracker updates)
              </CardTitle>
              <SpeedingInfoTooltip />
            </div>
            <div className="flex rounded-md border overflow-hidden">
              <button
                onClick={() => setViewMode('overall')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'overall'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                Overall
              </button>
              <button
                onClick={() => setViewMode('severity')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-l ${
                  viewMode === 'severity'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                Severity Breakdown
              </button>
            </div>
          </div>
          <CardDescription>
            {viewMode === 'overall'
              ? 'Simple scoreboard showing total speeding percentage'
              : 'Breakdown by severity levels: Mild, Moderate, and Severe'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : data ? (
            <SpeedingSummaryChart
              data={data.data}
              fleetAverage={data.fleetAverage}
              viewMode={viewMode}
              groupBy={groupBy}
            />
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Failed to load data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>
            Full list with severity percentages for each {groupBy}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : data ? (
            <SpeedingTable data={data.data} groupBy={groupBy} />
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground">
              Failed to load data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
