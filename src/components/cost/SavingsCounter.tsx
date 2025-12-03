'use client';

import { CheckCircle, TrendingDown } from 'lucide-react';
import type { CostSavingsSummary } from '@/types/cost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SavingsCounterProps {
  currency: string;
  summary: CostSavingsSummary;
}

export function SavingsCounter({ currency, summary }: SavingsCounterProps) {
  const formatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  });

  const { verifiedMonthlySavings = 0, verifiedDescription = '' } = summary;

  return (
    <Card className="h-full overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-100 p-1.5">
            <TrendingDown className="h-4 w-4 text-emerald-700" />
          </div>
          <CardTitle className="text-base font-semibold text-emerald-900">
            Verified Cost Reductions
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-3xl font-bold tracking-tight text-emerald-900">
            {formatter.format(verifiedMonthlySavings)}
          </p>
          <p className="text-sm text-emerald-700/80">saved this month</p>
        </div>

        {verifiedDescription && (
          <div className="flex items-start gap-2 rounded-md bg-emerald-100/50 p-3">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-800 leading-relaxed">
              {verifiedDescription}
            </p>
          </div>
        )}

        <p className="text-[11px] text-emerald-600/70">
          Based on verified data from telematics and fuel card sources
        </p>
      </CardContent>
    </Card>
  );
}
