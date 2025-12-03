'use client';

import {
  Shield,
  FileCheck,
  Car,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import type { ComplianceSummary, ComplianceItem, ComplianceType, ComplianceStatus } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComplianceTrackerProps {
  summary: ComplianceSummary;
}

const TYPE_CONFIG: Record<ComplianceType, { icon: typeof Shield; label: string }> = {
  nct: { icon: FileCheck, label: 'NCT' },
  insurance: { icon: Shield, label: 'Insurance' },
  'road-tax': { icon: Car, label: 'Road Tax' },
  service: { icon: Wrench, label: 'Service' },
  cvrt: { icon: FileCheck, label: 'CVRT' },
};

const STATUS_CONFIG: Record<
  ComplianceStatus,
  { icon: typeof CheckCircle; label: string; className: string; badgeClass: string }
> = {
  ok: {
    icon: CheckCircle,
    label: 'OK',
    className: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  'due-soon': {
    icon: Clock,
    label: 'Due Soon',
    className: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  overdue: {
    icon: AlertTriangle,
    label: 'Overdue',
    className: 'text-rose-600',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  expired: {
    icon: XCircle,
    label: 'Expired',
    className: 'text-rose-700',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
};

function formatDueDate(dueDate: string, daysUntilDue: number): string {
  if (daysUntilDue < 0) {
    return `${Math.abs(daysUntilDue)} days overdue`;
  }
  if (daysUntilDue === 0) {
    return 'Due today';
  }
  if (daysUntilDue <= 14) {
    return `Due in ${daysUntilDue} days`;
  }
  try {
    return new Date(dueDate).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dueDate;
  }
}

function ComplianceRow({ item }: { item: ComplianceItem }) {
  const typeConfig = TYPE_CONFIG[item.type];
  const statusConfig = STATUS_CONFIG[item.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;

  const isUrgent = item.status === 'overdue' || item.status === 'expired';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors',
        isUrgent ? 'border-rose-200 bg-rose-50/30' : 'bg-white hover:bg-slate-50/50'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'rounded-md p-2',
            isUrgent ? 'bg-rose-100' : 'bg-slate-100'
          )}
        >
          <TypeIcon
            className={cn('h-4 w-4', isUrgent ? 'text-rose-600' : 'text-slate-600')}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{item.vehicleLabel}</p>
          <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p
            className={cn(
              'text-xs font-medium',
              isUrgent ? 'text-rose-700' : 'text-muted-foreground'
            )}
          >
            {formatDueDate(item.dueDate, item.daysUntilDue)}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn('text-[10px] gap-1 px-1.5', statusConfig.badgeClass)}
        >
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
}

export function ComplianceTracker({ summary }: ComplianceTrackerProps) {
  const { items, overdueCount, dueSoonCount } = summary;

  // Sort: overdue/expired first, then due-soon, then ok
  const sortedItems = [...items].sort((a, b) => {
    const statusOrder: Record<ComplianceStatus, number> = {
      expired: 0,
      overdue: 1,
      'due-soon': 2,
      ok: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Show only items needing attention + a few OK items
  const urgentItems = sortedItems.filter(
    (i) => i.status !== 'ok'
  );
  const okItems = sortedItems.filter((i) => i.status === 'ok').slice(0, 2);
  const displayItems = [...urgentItems, ...okItems];

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Compliance Tracker
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              NCT, insurance, road tax, CVRT status
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueCount} overdue
              </Badge>
            )}
            {dueSoonCount > 0 && (
              <Badge className="bg-amber-50 text-amber-700 text-xs">
                {dueSoonCount} due soon
              </Badge>
            )}
            {overdueCount === 0 && dueSoonCount === 0 && (
              <Badge className="bg-emerald-50 text-emerald-700 text-xs">
                All clear
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayItems.length === 0 ? (
          <div className="rounded-md border border-dashed border-emerald-200 bg-emerald-50/50 p-4 text-center">
            <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm text-emerald-700">
              All vehicles compliant
            </p>
          </div>
        ) : (
          displayItems.map((item) => (
            <ComplianceRow key={item.id} item={item} />
          ))
        )}
        {items.length > displayItems.length && (
          <button
            type="button"
            className="w-full rounded-md border border-dashed py-2 text-xs font-medium text-muted-foreground hover:bg-slate-50 hover:text-foreground transition-colors"
          >
            View all {items.length} vehicles
          </button>
        )}
      </CardContent>
    </Card>
  );
}

