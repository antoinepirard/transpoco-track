'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TcoOverviewCard,
  LivemapPreview,
  FleetHealthCard,
} from '@/components/dashboard';
import {
  getTcoDashboardDemoData,
  refreshTcoDashboardDemoData,
} from '@/lib/demo/tcoMockData';
import { getCostDashboardDemoData } from '@/lib/demo/cost';
import type { TcoDashboardData, CostDashboardData } from '@/types/cost';

export default function ControlCentrePage() {
  const [tcoData, setTcoData] = useState<TcoDashboardData | null>(null);
  const [costData, setCostData] = useState<CostDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      const tco = getTcoDashboardDemoData();
      const cost = getCostDashboardDemoData();
      setTcoData(tco);
      setCostData(cost);
      setLastUpdate(new Date(tco.updatedAt));
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const tco = refreshTcoDashboardDemoData();
      const cost = getCostDashboardDemoData();
      setTcoData(tco);
      setCostData(cost);
      setLastUpdate(new Date(tco.updatedAt));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const tco = refreshTcoDashboardDemoData();
      const cost = getCostDashboardDemoData();
      setTcoData(tco);
      setCostData(cost);
      setLastUpdate(new Date(tco.updatedAt));
      setIsLoading(false);
    }, 300);
  }, []);

  // Calculate total issues for header badge
  const totalIssues = useMemo(() => {
    if (!tcoData || !costData) return 0;

    const utilizationIssues = tcoData.outlierSummary.outliers.filter((o) =>
      o.reasons.some((r) => r.reason === 'low-utilization')
    ).length;
    const trackingIssues = tcoData.vehicles.filter(
      (v) => v.dataCompleteness < 80
    ).length;
    const dataSourceIssues = tcoData.dataSources.sources.filter(
      (s) => s.status !== 'connected'
    ).length;
    const complianceIssues = costData.compliance.items.filter(
      (c) =>
        c.status === 'overdue' ||
        c.status === 'expired' ||
        c.status === 'due-soon'
    ).length;

    return (
      utilizationIssues + trackingIssues + dataSourceIssues + complianceIssues
    );
  }, [tcoData, costData]);

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50">
      <div className="container mx-auto p-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Control Centre
              </h1>
              {tcoData && (
                <Badge variant="outline" className="text-xs">
                  {tcoData.fleetSummary.totalVehicles} vehicles
                </Badge>
              )}
              {totalIssues > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalIssues} issues
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Fleet overview at a glance
            </p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
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

        {/* Main Grid - TCO Overview + Livemap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TCO Overview Card */}
          {tcoData && (
            <TcoOverviewCard
              summary={tcoData.fleetSummary}
              currency={tcoData.currency}
              isLoading={isLoading}
            />
          )}

          {/* Livemap Preview */}
          <LivemapPreview />
        </div>

        {/* Fleet Health Section */}
        {tcoData && costData && (
          <FleetHealthCard
            vehicles={tcoData.vehicles}
            outlierSummary={tcoData.outlierSummary}
            dataSources={tcoData.dataSources}
            compliance={costData.compliance}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
