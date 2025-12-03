'use client';

import {
  FileText,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  Mail,
  Calendar,
} from 'lucide-react';
import type { ReportsSummary, FleetReport, ReportStatus } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReportsCentreProps {
  summary: ReportsSummary;
}

const STATUS_CONFIG: Record<
  ReportStatus,
  { icon: typeof CheckCircle; label: string; className: string }
> = {
  ready: {
    icon: CheckCircle,
    label: 'Ready',
    className: 'bg-emerald-50 text-emerald-700',
  },
  generating: {
    icon: Clock,
    label: 'Generating',
    className: 'bg-blue-50 text-blue-700',
  },
  scheduled: {
    icon: Calendar,
    label: 'Scheduled',
    className: 'bg-slate-50 text-slate-700',
  },
  attention: {
    icon: AlertCircle,
    label: 'Needs Attention',
    className: 'bg-amber-50 text-amber-700',
  },
};

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function ReportRow({ report }: { report: FleetReport }) {
  const statusConfig = STATUS_CONFIG[report.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-white p-3 transition-colors hover:bg-slate-50/50">
      <div className="flex items-start gap-3 min-w-0">
        <div className="rounded-md bg-slate-100 p-2">
          <FileText className="h-4 w-4 text-slate-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{report.title}</p>
            {report.attentionCount && report.attentionCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {report.attentionCount} issue{report.attentionCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {report.description}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {report.generatedAt && `Generated ${formatDate(report.generatedAt)}`}
            {report.scheduledFor && `Scheduled for ${formatDate(report.scheduledFor)}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={cn('text-xs gap-1', statusConfig.className)}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </Badge>
        {report.status === 'ready' && (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        )}
        {report.status === 'attention' && (
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 shadow-sm transition-colors hover:bg-amber-100"
          >
            Review
          </button>
        )}
      </div>
    </div>
  );
}

export function ReportsCentre({ summary }: ReportsCentreProps) {
  const { reports } = summary;
  const readyCount = reports.filter((r) => r.status === 'ready').length;
  const attentionCount = reports.filter((r) => r.status === 'attention').length;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Reports</CardTitle>
            <p className="text-sm text-muted-foreground">
              Automated monthly reports ready to export
            </p>
          </div>
          <div className="flex items-center gap-2">
            {readyCount > 0 && (
              <Badge className="bg-emerald-50 text-emerald-700 text-xs">
                {readyCount} ready
              </Badge>
            )}
            {attentionCount > 0 && (
              <Badge className="bg-amber-50 text-amber-700 text-xs">
                {attentionCount} need attention
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No reports configured yet.
            </p>
          </div>
        ) : (
          reports.map((report) => <ReportRow key={report.id} report={report} />)
        )}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            Schedule email delivery
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            Create custom report
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

