'use client';

import { useEffect } from 'react';
import { useFieldServiceStore } from '@/stores/fieldServiceStore';
import { KpiHeader } from '@/components/dashboard/KpiHeader';
import { OnTimeByHourChart } from '@/components/dashboard/charts/OnTimeByHourChart';
import { OpsFunnelChart } from '@/components/dashboard/charts/OpsFunnelChart';
import { TechUtilizationChart } from '@/components/dashboard/charts/TechUtilizationChart';
import { RiskMapChart } from '@/components/dashboard/charts/RiskMapChart';
import { DurationDistributionChart } from '@/components/dashboard/charts/DurationDistributionChart';
import { ExceptionsTable } from '@/components/dashboard/ExceptionsTable';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const {
    jobs,
    technicians,
    stats,
    isLoading,
    lastUpdate,
    refreshData,
    getAtRiskJobs,
    getTechUtilization,
  } = useFieldServiceStore();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const atRiskJobs = getAtRiskJobs();
  const techUtilization = getTechUtilization();

  const handleManualRefresh = () => {
    refreshData();
  };

  const handleJobClick = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      console.log(`[Demo] View details for job ${jobId}:`, job);
    }
  };

  const handleTechClick = (techId: string, techName: string) => {
    console.log(`[Demo] Reassign technician ${techName} (${techId})`);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Field Service Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {lastUpdate && `Last updated: ${lastUpdate.toLocaleTimeString()}`}
            </p>
          </div>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* KPI Header Strip - Full Width */}
        <KpiHeader stats={stats} isLoading={isLoading} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* On-Time by Hour - 8 cols */}
          <div className="lg:col-span-8">
            <OnTimeByHourChart data={stats?.onTimeByWeek || []} isLoading={isLoading} />
          </div>

          {/* Ops Funnel - 4 cols */}
          <div className="lg:col-span-4">
            <OpsFunnelChart
              funnel={stats?.funnel || { planned: 0, dispatched: 0, arrived: 0, completed: 0 }}
              isLoading={isLoading}
            />
          </div>

          {/* Tech Utilization - 4 cols */}
          <div className="lg:col-span-4">
            <TechUtilizationChart
              data={techUtilization}
              isLoading={isLoading}
              onTechClick={handleTechClick}
            />
          </div>

          {/* Risk Map - 8 cols */}
          <div className="lg:col-span-8">
            <RiskMapChart
              jobs={jobs}
              isLoading={isLoading}
              onJobClick={handleJobClick}
            />
          </div>

          {/* Duration Distribution - Full Width */}
          <div className="lg:col-span-12">
            <DurationDistributionChart jobs={jobs} isLoading={isLoading} />
          </div>
        </div>

        {/* Exceptions Table - Full Width */}
        <ExceptionsTable jobs={jobs} risks={atRiskJobs} isLoading={isLoading} />
      </div>
    </div>
  );
}
