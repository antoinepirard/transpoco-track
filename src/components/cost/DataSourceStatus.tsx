'use client';

import { Database, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import type { CostDataSourceSummary, DataSourceStatusType } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DataSourceStatusProps {
  summary: CostDataSourceSummary;
}

const STATUS_CONFIG: Record<
  DataSourceStatusType,
  { icon: typeof CheckCircle; label: string; className: string }
> = {
  connected: {
    icon: CheckCircle,
    label: 'Connected',
    className: 'bg-emerald-50 text-emerald-700',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700',
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    className: 'bg-rose-50 text-rose-700',
  },
};

function formatSyncTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function DataSourceStatus({ summary }: DataSourceStatusProps) {
  const { sources, overallCompleteness } = summary;

  const connectedCount = sources.filter((s) => s.status === 'connected').length;
  const errorCount = sources.filter((s) => s.status === 'error').length;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Data Sources</CardTitle>
            <p className="text-sm text-muted-foreground">
              Connected feeds powering your reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {overallCompleteness}%
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Data Complete
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {connectedCount > 0 && (
            <Badge className="bg-emerald-50 text-emerald-700 text-xs">
              {connectedCount} connected
            </Badge>
          )}
          {errorCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {errorCount} need attention
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sources.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center">
            <Database className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">
              No data sources configured yet.
            </p>
          </div>
        ) : (
          sources.map((source) => {
            const statusConfig = STATUS_CONFIG[source.status];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={source.id}
                className={cn(
                  'rounded-lg border p-3 transition-colors',
                  source.status === 'error'
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'bg-white hover:bg-slate-50/50'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{source.label}</p>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] gap-1', statusConfig.className)}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {source.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {source.lastSync && (
                        <span className="text-[11px] text-muted-foreground">
                          Synced {formatSyncTime(source.lastSync)}
                        </span>
                      )}
                      {source.dataCompleteness !== undefined && (
                        <span className="text-[11px] text-muted-foreground">
                          {source.dataCompleteness}% complete
                        </span>
                      )}
                    </div>
                  </div>
                  {source.actionLabel && (
                    <button
                      type="button"
                      className={cn(
                        'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors shrink-0',
                        source.status === 'error'
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      )}
                    >
                      {source.actionLabel}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
