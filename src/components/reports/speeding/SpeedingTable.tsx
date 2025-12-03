'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SpeedingData } from '@/types/speeding';

interface SpeedingTableProps {
  data: SpeedingData[];
  groupBy: 'vehicle' | 'driver';
}

type SortKey = 'name' | 'speedingPercentage' | 'mild' | 'moderate' | 'severe';
type SortDirection = 'asc' | 'desc' | null;

export function SpeedingTable({ data, groupBy }: SpeedingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('speedingPercentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortKey === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortKey === 'speedingPercentage') {
        aValue = a.speedingPercentage;
        bValue = b.speedingPercentage;
      } else {
        aValue = a.severityBreakdown[sortKey];
        bValue = b.severityBreakdown[sortKey];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Cycle through: desc -> asc -> no sort -> desc
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection(null);
        setSortKey('speedingPercentage');
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-3 w-3" />;
    }
    return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  };

  const exportToCSV = () => {
    const headers = [
      groupBy === 'vehicle' ? 'Vehicle' : 'Driver',
      'Speeding %',
      'Mild (11-20%)',
      'Moderate (21-30%)',
      'Severe (>30%)',
      'Total Updates',
    ];

    const rows = sortedData.map((item) => [
      item.name,
      item.speedingPercentage.toFixed(2),
      item.severityBreakdown.mild.toFixed(2),
      item.severityBreakdown.moderate.toFixed(2),
      item.severityBreakdown.severe.toFixed(2),
      item.totalUpdates,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speeding-summary-${groupBy}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 0.5) return 'text-destructive';
    if (percentage >= 0.2) return 'text-chart-2';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Detailed breakdown • {sortedData.length} {groupBy === 'vehicle' ? 'vehicles' : 'drivers'}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left p-3 font-medium">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  >
                    {groupBy === 'vehicle' ? 'Vehicle' : 'Driver'}
                    {getSortIcon('name')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('speedingPercentage')}
                    className="flex items-center justify-end gap-1.5 hover:text-foreground transition-colors ml-auto"
                  >
                    Speeding %
                    {getSortIcon('speedingPercentage')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('mild')}
                    className="flex items-center justify-end gap-1.5 hover:text-foreground transition-colors ml-auto"
                  >
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-chart-1" />
                      Mild (11-20%)
                    </span>
                    {getSortIcon('mild')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('moderate')}
                    className="flex items-center justify-end gap-1.5 hover:text-foreground transition-colors ml-auto"
                  >
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-chart-2" />
                      Moderate (21-30%)
                    </span>
                    {getSortIcon('moderate')}
                  </button>
                </th>
                <th className="text-right p-3 font-medium">
                  <button
                    onClick={() => handleSort('severe')}
                    className="flex items-center justify-end gap-1.5 hover:text-foreground transition-colors ml-auto"
                  >
                    <span className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                      Severe (&gt;30%)
                    </span>
                    {getSortIcon('severe')}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                    index === 0 ? 'bg-destructive/5' : ''
                  }`}
                >
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      )}
                      <span className="truncate max-w-[200px]" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {item.speedingPercentage.toFixed(2)}%
                  </td>
                  <td className={`p-3 text-right ${getSeverityColor(item.severityBreakdown.mild)}`}>
                    {item.severityBreakdown.mild.toFixed(2)}%
                  </td>
                  <td className={`p-3 text-right ${getSeverityColor(item.severityBreakdown.moderate)}`}>
                    {item.severityBreakdown.moderate.toFixed(2)}%
                  </td>
                  <td className={`p-3 text-right ${getSeverityColor(item.severityBreakdown.severe)}`}>
                    {item.severityBreakdown.severe.toFixed(2)}%
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
