'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ColumnDef,
  ExpandedState,
  GroupingState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ReportRow } from '@/app/api/reports/route';
import { CaretDown, CaretRight } from '@phosphor-icons/react';

function fmtTime(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtHMM(sec?: number) {
  const s = sec ?? 0;
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${h}:${mm}`;
}

export default function ReportsTable({ rows, loading }: { rows: ReportRow[]; loading?: boolean }) {
  // Controlled state for table
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Safety check - ensure rows is always an array
  const safeRows = useMemo(() => rows || [], [rows]);

  const columns = useMemo<ColumnDef<ReportRow>[]>(() => [
    {
      id: 'driver',
      header: 'Driver',
      accessorKey: 'driver',
      size: 150,
    },
    {
      header: 'Start Time (HH:MM)',
      accessorKey: 'startTime',
      cell: info => fmtTime(info.getValue() as string),
      size: 120,
    },
    { 
      header: 'Start Location', 
      accessorKey: 'startLocation',
      size: 280,
    },
    {
      header: 'Stop Time (HH:MM)',
      accessorKey: 'stopTime',
      cell: info => {
        const val = info.getValue() as string | null;
        const st = info.row.original.status;
        return val ? fmtTime(val) : st === 'in-progress' ? 'In progress' : '';
      },
      size: 120,
    },
    { 
      header: 'Stop Location', 
      accessorKey: 'stopLocation',
      size: 280,
    },
    {
      header: 'Journey Time (HH:MM)',
      accessorKey: 'journeyTimeSec',
      cell: info => fmtHMM(info.getValue() as number),
      size: 120,
    },
    {
      header: 'Idling Time (HH:MM)',
      accessorKey: 'idleTimeSec',
      cell: info => fmtHMM(info.getValue() as number),
      size: 120,
    },
    {
      header: 'Distance (KM)',
      accessorKey: 'distanceKm',
      cell: info => (info.getValue<number>() ?? 0).toFixed(2),
      size: 100,
    },
    {
      header: 'Private Distance (KM)',
      accessorKey: 'privateDistanceKm',
      cell: info => (info.getValue<number>() ?? 0).toFixed(2),
      size: 120,
    },
    { 
      header: 'Route Playback', 
      accessorKey: 'journeyType',
      cell: () => '🗄',
      size: 100,
    },
  ], []);

  const grouping = useMemo<GroupingState>(() => ['driver'], []);
  const table = useReactTable({
    data: safeRows,
    columns,
    state: { 
      grouping,
      expanded,
      sorting,
    },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    getRowId: (r) => r.id,
  });

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 44,
    getScrollElement: () => parentRef.current,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  // Calculate totals
  const totals = useMemo(() => ({
    journeyTimeSec: safeRows.reduce((a, r) => a + (r.journeyTimeSec || 0), 0),
    idleTimeSec: safeRows.reduce((a, r) => a + (r.idleTimeSec || 0), 0),
    distanceKm: safeRows.reduce((a, r) => a + (r.distanceKm || 0), 0),
    privateDistanceKm: safeRows.reduce((a, r) => a + (r.privateDistanceKm || 0), 0),
  }), [safeRows]);

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col gap-2">
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-gray-200 bg-white p-2 text-xs">
        <span className="font-semibold">Totals</span>
        <span>Journey: {fmtHMM(totals.journeyTimeSec)}</span>
        <span>Idle: {fmtHMM(totals.idleTimeSec)}</span>
        <span>Distance: {totals.distanceKm.toFixed(2)} km</span>
        <span>Private: {totals.privateDistanceKm.toFixed(2)} km</span>
        {loading ? <span className="ml-auto animate-pulse text-gray-500">Loading…</span> : null}
      </div>

      <div ref={parentRef} className="relative w-full flex-1 overflow-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm bg-white" style={{ minWidth: '1610px', tableLayout: 'fixed' }}>
          <thead className="sticky top-0 z-10 bg-gray-50 text-left text-gray-600">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-gray-200">
                {hg.headers.map(h => (
                  <th 
                    key={h.id} 
                    className="px-3 py-2 font-medium"
                    style={{ 
                      width: `${h.getSize()}px`, 
                      maxWidth: `${h.getSize()}px`,
                      minWidth: `${h.getSize()}px`
                    }}
                  >
                    <div className="truncate">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody style={{ height: `${totalSize}px`, position: 'relative' }}>
            {virtualRows.map(vRow => {
              const row = table.getRowModel().rows[vRow.index]!;
              const isSubRow = row.depth > 0;

              return (
                <tr
                  key={row.id}
                  className="absolute left-0 right-0 border-b border-gray-100 bg-white"
                  style={{ 
                    transform: `translateY(${vRow.start}px)`,
                    height: '44px'
                  }}
                >
                  {row.getVisibleCells().map(cell => {
                    const isFirst = cell.column.id === 'driver';
                    const cellValue = cell.getValue() as string;
                    
                    return (
                      <td 
                        key={cell.id} 
                        className="px-3 py-2 align-middle bg-white"
                        style={{ 
                          width: `${cell.column.getSize()}px`, 
                          maxWidth: `${cell.column.getSize()}px`,
                          minWidth: `${cell.column.getSize()}px`
                        }}
                      >
                        <div 
                          className="flex items-center" 
                          style={{ paddingLeft: isFirst && isSubRow ? 24 : 0 }}
                        >
                          {isFirst && row.getCanExpand() ? (
                            <button
                              onClick={row.getToggleExpandedHandler()}
                              className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100"
                              aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
                            >
                              {row.getIsExpanded() ? <CaretDown size={14} /> : <CaretRight size={14} />}
                            </button>
                          ) : null}
                          <div 
                            className="truncate min-w-0 flex-1 whitespace-nowrap"
                            title={cellValue && typeof cellValue === 'string' && cellValue.length > 20 ? cellValue : undefined}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}