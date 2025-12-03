'use client';

import { AlertTriangle, Bell, Database, Wrench, ChevronRight } from 'lucide-react';
import type { ActionItemsSummary, ActionItem, ActionItemType } from '@/types/cost';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ActionItemsStripProps {
  summary: ActionItemsSummary;
}

const TYPE_CONFIG: Record<
  ActionItemType,
  { icon: typeof AlertTriangle; label: string; color: string }
> = {
  compliance: {
    icon: AlertTriangle,
    label: 'Compliance',
    color: 'text-amber-600',
  },
  anomaly: {
    icon: Bell,
    label: 'Anomaly',
    color: 'text-rose-600',
  },
  'data-source': {
    icon: Database,
    label: 'Data',
    color: 'text-blue-600',
  },
  maintenance: {
    icon: Wrench,
    label: 'Maintenance',
    color: 'text-slate-600',
  },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'border-l-rose-500 bg-rose-50/50',
  medium: 'border-l-amber-500 bg-amber-50/30',
  low: 'border-l-slate-300 bg-slate-50/30',
};

function ActionItemCard({ item }: { item: ActionItem }) {
  const config = TYPE_CONFIG[item.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex min-w-[280px] max-w-[320px] shrink-0 flex-col gap-2 rounded-lg border border-l-4 bg-white p-3 shadow-sm transition-shadow hover:shadow-md',
        PRIORITY_STYLES[item.priority]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', config.color)} />
          <span className="text-xs font-medium text-muted-foreground">
            {config.label}
          </span>
        </div>
        {item.priority === 'high' && (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Urgent
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-tight">{item.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </div>
      {item.actionLabel && (
        <button
          type="button"
          className="mt-auto flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {item.actionLabel}
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function ActionItemsStrip({ summary }: ActionItemsStripProps) {
  const { items, highPriorityCount, totalCount } = summary;

  // Sort by priority: high first, then medium, then low
  const sortedItems = [...items].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (totalCount === 0) {
    return (
      <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">All clear</span>
        </div>
        <p className="mt-1 text-xs text-emerald-600">
          No action items requiring attention right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Action Items
          </h2>
          <Badge
            variant={highPriorityCount > 0 ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {totalCount} item{totalCount !== 1 ? 's' : ''}
            {highPriorityCount > 0 && ` · ${highPriorityCount} urgent`}
          </Badge>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {sortedItems.map((item) => (
          <ActionItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

