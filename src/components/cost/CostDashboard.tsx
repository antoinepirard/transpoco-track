'use client';

import { useMemo } from 'react';
import { Download, FileSpreadsheet, RefreshCw } from 'lucide-react';

import type { CostDashboardData } from '@/types/cost';
import { Badge } from '@/components/ui/badge';

import { ActionItemsStrip } from './ActionItemsStrip';
import { ReportsCentre } from './ReportsCentre';
import { SpendOverview } from './SpendOverview';
import { ComplianceTracker } from './ComplianceTracker';
import { DataSourceStatus } from './DataSourceStatus';
import { SavingsCounter } from './SavingsCounter';

const dateFormatter = new Intl.DateTimeFormat('en-IE', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

interface CostDashboardProps {
  data: CostDashboardData;
}

export function CostDashboard({ data }: CostDashboardProps) {
  const lastUpdatedLabel = useMemo(() => {
    try {
      return dateFormatter.format(new Date(data.updatedAt));
    } catch {
      return data.updatedAt;
    }
  }, [data.updatedAt]);

  const dataHealthPct = data.dataSources.overallCompleteness;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Fleet Control Centre
            </h1>
            <Badge variant="outline" className="text-xs">
              {data.tco.vehiclesTracked} vehicles
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Financial reporting and compliance status at a glance
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Updated {lastUpdatedLabel}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span
                className={
                  dataHealthPct >= 90
                    ? 'text-emerald-600'
                    : dataHealthPct >= 70
                      ? 'text-amber-600'
                      : 'text-rose-600'
                }
              >
                {dataHealthPct}% data verified
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export Monthly Report
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Compliance Summary
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border bg-white p-2 text-sm shadow-sm transition-colors hover:bg-slate-50"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Section 1: Action Items Strip */}
      <section aria-labelledby="action-items">
        <ActionItemsStrip summary={data.actionItems} />
      </section>

      {/* Section 2: Reports Centre */}
      <section aria-labelledby="reports-section" className="space-y-3">
        <div>
          <h2
            id="reports-section"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Automated Reports
          </h2>
          <p className="text-xs text-muted-foreground">
            Ready to download or schedule for email delivery
          </p>
        </div>
        <ReportsCentre summary={data.reports} />
      </section>

      {/* Section 3: Spend Overview + Savings */}
      <section aria-labelledby="spend-section" className="space-y-3">
        <div>
          <h2
            id="spend-section"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Financial Overview
          </h2>
          <p className="text-xs text-muted-foreground">
            Verified spend from connected data sources
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SpendOverview data={data} />
          <SavingsCounter currency={data.currency} summary={data.savings} />
        </div>
      </section>

      {/* Section 4: Compliance + Data Sources */}
      <section aria-labelledby="compliance-section" className="space-y-3">
        <div>
          <h2
            id="compliance-section"
            className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Compliance & Data Health
          </h2>
          <p className="text-xs text-muted-foreground">
            Vehicle compliance status and connected data feeds
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ComplianceTracker summary={data.compliance} />
          <DataSourceStatus summary={data.dataSources} />
        </div>
      </section>
    </div>
  );
}

export default CostDashboard;
