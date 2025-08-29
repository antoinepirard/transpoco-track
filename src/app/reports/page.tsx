'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { NavigationSidebar } from '@/components/navigation/NavigationSidebar';
import ReportsTable from '@/components/reports/ReportsTable';
import type { ReportRow } from '@/app/api/reports/route';

type JourneyType = 'all' | 'journey' | 'idle' | 'stop';

export default function ReportsPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const mountedRef = useRef(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drivers, setDrivers] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize filters with default values
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    driver: 'all',
    journeyType: 'all' as JourneyType,
  });
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    try {
      const qs = new URLSearchParams(
        filters as Record<string, string>
      ).toString();
      const r = await fetch(`/api/reports?${qs}`, { cache: 'no-store' });
      const data = (await r.json()) as ReportRow[];
      
      if (mountedRef.current) {
        setRows(data);
        if (!drivers.length) {
          setDrivers(Array.from(new Set(data.map((d) => d.driver))).sort());
        }
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      if (mountedRef.current) {
        setRows([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, drivers.length]);

  // Component mounting and initialization
  useEffect(() => {
    mountedRef.current = true;
    
    // Handle URL parameters safely
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStartDate = urlParams.get('startDate');
      const urlEndDate = urlParams.get('endDate');
      const urlDriver = urlParams.get('driver');
      const urlJourneyType = urlParams.get('journeyType') as JourneyType;

      if (urlStartDate || urlEndDate || urlDriver || urlJourneyType) {
        setFilters(prev => ({
          ...prev,
          ...(urlStartDate && { startDate: urlStartDate }),
          ...(urlEndDate && { endDate: urlEndDate }),
          ...(urlDriver && { driver: urlDriver }),
          ...(urlJourneyType && { journeyType: urlJourneyType }),
        }));
      }
    }

    setInitialized(true);

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Fetch data after initialization
  useEffect(() => {
    if (initialized && mountedRef.current) {
      setTimeout(() => fetchData(), 0);
    }
  }, [initialized, fetchData]);

  return (
    <div className="w-full h-screen flex">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 p-4 bg-gray-50">
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchData();
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-gray-600">
                Begin
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, startDate: e.target.value }))
                }
                className="h-9 rounded-md border border-gray-300 px-2 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-gray-600">
                End
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, endDate: e.target.value }))
                }
                className="h-9 rounded-md border border-gray-300 px-2 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-gray-600">
                Driver
              </label>
              <select
                value={filters.driver}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, driver: e.target.value }))
                }
                className="h-9 rounded-md border border-gray-300 px-2 text-sm"
              >
                <option value="all">All Drivers</option>
                {drivers.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-xs font-medium text-gray-600">
                Journey Type
              </label>
              <select
                value={filters.journeyType}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    journeyType: e.target.value as JourneyType,
                  }))
                }
                className="h-9 rounded-md border border-gray-300 px-2 text-sm"
              >
                <option value="all">All</option>
                <option value="journey">Journey</option>
                <option value="idle">Idle</option>
                <option value="stop">Stop</option>
              </select>
            </div>
            <button
              type="submit"
              className="h-9 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-black/90"
            >
              View Report
            </button>
          </form>
        </div>

        {initialized ? (
          <ReportsTable rows={rows} loading={loading} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse text-gray-500">Loading reports...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
