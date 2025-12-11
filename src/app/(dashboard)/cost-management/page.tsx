'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getTcoDashboardDemoData } from '@/lib/demo/tcoMockData';
import { VehicleCostTable } from '@/components/cost/VehicleCostTable';
import { VehicleDetailDrawer } from '@/components/cost/VehicleDetailDrawer';
import { InvoiceDropZone } from '@/components/cost/InvoiceDropZone';
import type { VehicleTco } from '@/types/cost';

type StatusFilter = 'all' | 'critical' | 'warning' | 'ok';
type VehicleTypeFilter = 'all' | 'van' | 'truck' | 'car';

export default function CostManagementPage() {
  const data = useMemo(() => getTcoDashboardDemoData(), []);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] =
    useState<VehicleTypeFilter>('all');

  // Selection state
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  // Drawer state
  const [drawerVehicle, setDrawerVehicle] = useState<VehicleTco | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get outlier for selected vehicle
  const drawerOutlier = useMemo(() => {
    if (!drawerVehicle) return undefined;
    return data.outlierSummary.outliers.find(
      (o) => o.vehicle.vehicleId === drawerVehicle.vehicleId
    );
  }, [drawerVehicle, data.outlierSummary.outliers]);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    let result = data.vehicles;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.vehicleId.toLowerCase().includes(query) ||
          v.vehicleLabel.toLowerCase().includes(query) ||
          v.driver?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((v) => {
        const outlier = data.outlierSummary.outliers.find(
          (o) => o.vehicle.vehicleId === v.vehicleId
        );
        if (statusFilter === 'critical') {
          return outlier?.severity === 'critical';
        }
        if (statusFilter === 'warning') {
          return outlier?.severity === 'warning' || v.peerGroupMultiple > 1.3;
        }
        if (statusFilter === 'ok') {
          return !outlier && v.peerGroupMultiple <= 1.3;
        }
        return true;
      });
    }

    // Vehicle type filter
    if (vehicleTypeFilter !== 'all') {
      result = result.filter((v) => v.vehicleType === vehicleTypeFilter);
    }

    return result;
  }, [
    data.vehicles,
    data.outlierSummary.outliers,
    searchQuery,
    statusFilter,
    vehicleTypeFilter,
  ]);

  // Stats for filter badges
  const stats = useMemo(() => {
    const critical = data.outlierSummary.outliers.filter(
      (o) => o.severity === 'critical'
    ).length;
    const warning = data.outlierSummary.outliers.filter(
      (o) => o.severity === 'warning'
    ).length;
    return { critical, warning };
  }, [data.outlierSummary.outliers]);

  const handleRowClick = (vehicle: VehicleTco) => {
    setDrawerVehicle(vehicle);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleFlagForReview = (vehicleId: string) => {
    console.log('[Demo] Vehicle flagged for review:', vehicleId);
    // In real app, would update vehicle status
  };

  const handleAddExpenseFromDrawer = (vehicleId: string) => {
    console.log('[Demo] Add expense for vehicle:', vehicleId);
    // Could open a pre-filled expense form
  };

  const handleExpenseAdded = (expenseData: unknown) => {
    console.log('[Demo] Expense added:', expenseData);
    // In real app, would refresh data
  };

  const handleExportCsv = () => {
    const headers = [
      'Vehicle ID',
      'Vehicle',
      'Driver',
      'TCO/km',
      'Fuel',
      'Maintenance',
      'Insurance',
      'Lease',
      'Monthly Total',
      'Status',
    ];

    const rows = filteredVehicles.map((v) => {
      const outlier = data.outlierSummary.outliers.find(
        (o) => o.vehicle.vehicleId === v.vehicleId
      );
      const status =
        outlier?.severity === 'critical'
          ? 'Critical'
          : outlier?.severity === 'warning'
            ? 'High'
            : 'OK';
      const fuel =
        v.costBreakdown.find((b) => b.bucket === 'fuel')?.amount ?? 0;
      const maint =
        v.costBreakdown.find((b) => b.bucket === 'maintenance')?.amount ?? 0;
      const ins =
        v.costBreakdown.find((b) => b.bucket === 'insurance')?.amount ?? 0;
      const lease =
        v.costBreakdown.find((b) => b.bucket === 'lease')?.amount ?? 0;

      return [
        v.vehicleId,
        v.vehicleLabel.split('·')[0]?.trim(),
        v.driver?.name ?? '',
        v.tcoPerKm.toFixed(2),
        fuel.toFixed(0),
        maint.toFixed(0),
        ins.toFixed(0),
        lease.toFixed(0),
        v.monthlyTco.toFixed(0),
        status,
      ];
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle-costs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setVehicleTypeFilter('all');
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || vehicleTypeFilter !== 'all';

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Cost Management
          </h1>
          <p className="text-muted-foreground">
            Find cost patterns across your {data.vehicles.length} vehicles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <InvoiceDropZone compact onExpenseAdded={handleExpenseAdded} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCsv}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-lg border">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[160px] h-9">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="critical">
              <span className="flex items-center gap-2">
                Critical
                {stats.critical > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {stats.critical}
                  </Badge>
                )}
              </span>
            </SelectItem>
            <SelectItem value="warning">
              <span className="flex items-center gap-2">
                High TCO
                {stats.warning > 0 && (
                  <Badge className="bg-amber-500 text-[10px] px-1.5 py-0">
                    {stats.warning}
                  </Badge>
                )}
              </span>
            </SelectItem>
            <SelectItem value="ok">Normal</SelectItem>
          </SelectContent>
        </Select>

        {/* Vehicle type filter */}
        <Select
          value={vehicleTypeFilter}
          onValueChange={(v) => setVehicleTypeFilter(v as VehicleTypeFilter)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Vehicle Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="van">Vans</SelectItem>
            <SelectItem value="truck">Trucks</SelectItem>
            <SelectItem value="car">Cars</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        {/* Results count */}
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredVehicles.length} of {data.vehicles.length} vehicles
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        <VehicleCostTable
          vehicles={filteredVehicles}
          outliers={data.outlierSummary.outliers}
          onRowClick={handleRowClick}
          selectedIds={selectedVehicleIds}
          onSelectionChange={setSelectedVehicleIds}
        />
      </div>

      {/* Vehicle Detail Drawer */}
      <VehicleDetailDrawer
        vehicle={drawerVehicle}
        outlier={drawerOutlier}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onFlagForReview={handleFlagForReview}
        onAddExpense={handleAddExpenseFromDrawer}
      />
    </div>
  );
}
