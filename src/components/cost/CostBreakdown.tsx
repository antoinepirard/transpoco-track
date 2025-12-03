'use client';

import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import type { CostBreakdownItem, CostTrendPoint } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const COLORS = ['#0EA5E9', '#22C55E', '#6366F1', '#F97316', '#E11D48', '#94A3B8'];

interface CostBreakdownProps {
  breakdown: CostBreakdownItem[];
  trend: CostTrendPoint[];
  currency: string;
  emphasis?: 'finance' | 'ops';
}

export function CostBreakdown({ breakdown, trend, currency, emphasis }: CostBreakdownProps) {
  // Defer chart render until after hydration to avoid Recharts ID mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const currencyFormatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  });

  const trendCopy = trend.at(-1);

  return (
    <Card
      className={cn(
        'h-full overflow-hidden',
        emphasis === 'finance' && 'ring-1 ring-primary/20 shadow-sm shadow-primary/10'
      )}
    >
      <CardHeader className="flex flex-col gap-1 pb-4">
        <CardTitle className="text-base font-semibold">Cost breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `€${(total / 1000).toFixed(1)}k total captured` : 'No cost data yet'}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 xl:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center">
          {breakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">Connect a fuel card to unlock this view.</p>
          ) : !mounted ? (
            <div className="h-[220px] w-[220px] flex items-center justify-center">
              <div className="h-[180px] w-[180px] rounded-full border-[30px] border-muted animate-pulse" />
            </div>
          ) : (
            <PieChart width={220} height={220}>
              <Pie
                data={breakdown}
                dataKey="amount"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {breakdown.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
          {trendCopy && (
            <span
              className={cn(
                'text-xs font-medium',
                (trendCopy.deltaPct ?? 0) <= 0 ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {(trendCopy.deltaPct ?? 0) <= 0 ? '▼' : '▲'} {Math.abs(trendCopy.deltaPct ?? 0).toFixed(1)}% vs last month
            </span>
          )}
        </div>
        <div className="flex-1 space-y-3">
          {breakdown.length === 0 ? (
            <div className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Fuel, SMR, leasing, insurance, and accident feeds roll up here. Connect a source to populate it.
            </div>
          ) : (
            breakdown.map((item, idx) => (
              <div key={item.category} className="flex items-start gap-2">
                <div
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium capitalize">{item.label}</p>
                    <span
                      className={cn(
                        'shrink-0 text-xs font-medium',
                        item.deltaPct <= 0 ? 'text-emerald-600' : 'text-rose-600'
                      )}
                    >
                      {item.deltaPct <= 0 ? '▼' : '▲'} {Math.abs(item.deltaPct).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currencyFormatter.format(item.amount)} · {item.sharePct.toFixed(1)}% of spend
                  </p>
                  {item.insight && <p className="text-xs text-foreground">{item.insight}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

