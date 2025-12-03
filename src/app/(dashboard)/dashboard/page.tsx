'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Download, Database, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TcoKpiHeader,
  TcoCostBreakdown,
  TcoTrendChart,
  TcoVehicleRanking,
  TcoOutlierAlert,
} from '@/components/tco';
import { ActionItemsStrip } from '@/components/cost/ActionItemsStrip';
import { DataSourceStatus } from '@/components/cost/DataSourceStatus';
import {
  getTcoDashboardDemoData,
  refreshTcoDashboardDemoData,
} from '@/lib/demo/tcoMockData';
import type { TcoDashboardData } from '@/types/cost';

export default function TcoDashboardPage() {
  const [data, setData] = useState<TcoDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      const dashboardData = getTcoDashboardDemoData();
      setData(dashboardData);
      setLastUpdate(new Date(dashboardData.updatedAt));
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const dashboardData = refreshTcoDashboardDemoData();
      setData(dashboardData);
      setLastUpdate(new Date(dashboardData.updatedAt));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      const dashboardData = refreshTcoDashboardDemoData();
      setData(dashboardData);
      setLastUpdate(new Date(dashboardData.updatedAt));
      setIsLoading(false);
    }, 300);
  }, []);

  const handleVehicleClick = useCallback((vehicleId: string) => {
    console.log(`[Demo] View details for vehicle ${vehicleId}`);
    // In a real app, this would navigate to a vehicle detail page
  }, []);

  const handleExport = useCallback(() => {
    console.log('[Demo] Exporting TCO report...');
    // In a real app, this would trigger a report download
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Fleet TCO Dashboard
              </h1>
              {data && (
                <Badge variant="outline" className="text-xs">
                  {data.fleetSummary.totalVehicles} vehicles
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Total Cost of Ownership – what it really costs to run your fleet
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {lastUpdate && (
                <span>Updated {lastUpdate.toLocaleTimeString()}</span>
              )}
              {data && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    <span
                      className={
                        data.fleetSummary.dataCompleteness >= 90
                          ? 'text-emerald-600 font-medium'
                          : data.fleetSummary.dataCompleteness >= 70
                            ? 'text-amber-600 font-medium'
                            : 'text-rose-600 font-medium'
                      }
                    >
                      {data.fleetSummary.dataCompleteness}% data verified
                    </span>
                    <span className="text-muted-foreground/70">
                      from {data.fleetSummary.dataSourceCount} sources
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              BIK Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Action Items Strip */}
        {data && (
          <section aria-labelledby="action-items">
            <ActionItemsStrip summary={data.actionItems} />
          </section>
        )}

        {/* KPI Header Strip - Full Width */}
        {data && (
          <TcoKpiHeader
            summary={data.fleetSummary}
            currency={data.currency}
            isLoading={isLoading}
          />
        )}

        {/* Cost Breakdown + Trend Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data && (
            <>
              <TcoCostBreakdown
                breakdown={data.fleetSummary.costBreakdown}
                totalTco={data.fleetSummary.totalMonthlyTco}
                currency={data.currency}
                isLoading={isLoading}
              />
              <TcoTrendChart
                trend={data.fleetSummary.monthlyTrend}
                currency={data.currency}
                isLoading={isLoading}
              />
            </>
          )}
        </div>

        {/* Outliers & Levers Section */}
        {data && (
          <TcoOutlierAlert
            outlierSummary={data.outlierSummary}
            currency={data.currency}
            isLoading={isLoading}
            onVehicleClick={handleVehicleClick}
          />
        )}

        {/* Top 10 Expensive Vehicles */}
        {data && (
          <TcoVehicleRanking
            vehicles={data.vehicles}
            currency={data.currency}
            isLoading={isLoading}
            onVehicleClick={handleVehicleClick}
          />
        )}

        {/* Data Sources & Health */}
        {data && (
          <section aria-labelledby="data-health" className="space-y-3">
            <div>
              <h2
                id="data-health"
                className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Data Health & Sources
              </h2>
              <p className="text-xs text-muted-foreground">
                Connected data feeds powering your TCO calculations
              </p>
            </div>
            <DataSourceStatus summary={data.dataSources} />
          </section>
        )}
      </div>
    </div>
  );
}
