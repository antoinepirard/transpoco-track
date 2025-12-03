import type { BudgetVsActualSummary } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BudgetVsActualProps {
  summary: BudgetVsActualSummary;
  currency: string;
  emphasis?: 'finance' | 'ops';
}

export function BudgetVsActual({ summary, currency, emphasis }: BudgetVsActualProps) {
  const formatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  });

  const variancePositive = summary.variancePct <= 0;

  return (
    <Card
      className={cn(
        'h-full overflow-hidden',
        emphasis === 'finance' && 'ring-1 ring-primary/25 shadow-sm shadow-primary/10'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Budget vs actual</CardTitle>
        <div className="text-xs text-muted-foreground">
          <p>Total budget {formatter.format(summary.totalBudget)}</p>
          <p>
            Variance{' '}
            <span
              className={cn(
                'font-medium',
                variancePositive ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {variancePositive ? '▼' : '▲'} {Math.abs(summary.variancePct).toFixed(1)}%
            </span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-3 text-xs">
          <div>
            <p className="text-muted-foreground">Payback period</p>
            <p className="text-lg font-semibold">{summary.paybackPeriodMonths} months</p>
          </div>
          <div>
            <p className="text-muted-foreground">ROI to date</p>
            <p className="text-lg font-semibold">{summary.roiPct}%</p>
          </div>
        </div>

        {summary.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add cost centres to see budget adherence.</p>
        ) : (
          <div className="space-y-3">
            {summary.items.map(item => {
              const utilisationPercent = Math.min(125, (item.actual / item.budget) * 100);
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between gap-2 text-sm font-medium">
                    <span className="truncate">{item.costCenter}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatter.format(item.actual)} / {formatter.format(item.budget)}
                    </span>
                  </div>
                  <Progress value={utilisationPercent} className="mt-1 h-2" />
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.status === 'over' ? 'Over budget' : item.status === 'under' ? 'Under' : 'On track'}</span>
                    <span
                      className={cn(
                        'font-medium',
                        item.variancePct <= 0 ? 'text-emerald-600' : 'text-rose-600'
                      )}
                    >
                      {item.variancePct > 0 ? '+' : ''}
                      {item.variancePct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

