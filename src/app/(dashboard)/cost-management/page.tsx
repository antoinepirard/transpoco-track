'use client';

import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  X,
  ShieldCheck,
  Car,
  Receipt,
  Flag,
  Sparkles,
  Users,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getTcoDashboardDemoData,
  VEHICLE_GROUP_OPTIONS,
} from '@/lib/demo/tcoMockData';
import { getCostDashboardDemoData } from '@/lib/demo/cost';
import { VehicleCostTable } from '@/components/cost/VehicleCostTable';
import { VehicleDetailDrawer } from '@/components/cost/VehicleDetailDrawer';
import { InvoiceDropZone } from '@/components/cost/InvoiceDropZone';
import { ExpensesList, type Expense } from '@/components/cost/ExpensesList';
import { EditExpenseDialog } from '@/components/cost/EditExpenseDialog';
import { FlaggedVehiclesList } from '@/components/cost/FlaggedVehiclesList';
import { CustomExportAIDialog } from '@/components/cost/CustomExportAIDialog';
import type { VehicleGroup, VehicleTco } from '@/types/cost';

type StatusFilter = 'all' | 'critical' | 'warning' | 'ok';
type TimePreset =
  | 'last-7-days'
  | 'last-30-days'
  | 'last-90-days'
  | 'this-month'
  | 'last-month'
  | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

const TIME_PRESETS: { id: TimePreset; label: string }[] = [
  { id: 'last-7-days', label: 'Last 7 days' },
  { id: 'last-30-days', label: 'Last 30 days' },
  { id: 'last-90-days', label: 'Last 90 days' },
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'custom', label: 'Custom range' },
];

function getDateRangeForPreset(preset: TimePreset): DateRange {
  const now = new Date();
  const to = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  switch (preset) {
    case 'last-7-days': {
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case 'last-30-days': {
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case 'last-90-days': {
      const from = new Date(to);
      from.setDate(from.getDate() - 89);
      from.setHours(0, 0, 0, 0);
      return { from, to };
    }
    case 'this-month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      return { from, to };
    }
    case 'last-month': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const lastDayLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );
      return { from, to: lastDayLastMonth };
    }
    default:
      // For custom, return last 30 days as default
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      return { from, to };
  }
}

function formatDateRange(range: DateRange): string {
  return `${format(range.from, 'd MMM')} - ${format(range.to, 'd MMM')}`;
}

export interface FlaggedVehicle {
  vehicleId: string;
  flaggedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export default function CostManagementPage() {
  const data = useMemo(() => getTcoDashboardDemoData(), []);
  const costData = useMemo(() => getCostDashboardDemoData(), []);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | VehicleGroup>('all');
  const [timePreset, setTimePreset] = useState<TimePreset>('last-30-days');
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    getDateRangeForPreset('last-30-days')
  );
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  // Selection state
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  // Drawer state
  const [drawerVehicle, setDrawerVehicle] = useState<VehicleTco | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Custom Export AI dialog state
  const [isCustomExportOpen, setIsCustomExportOpen] = useState(false);

  // Expenses state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Flagged vehicles state
  const [flaggedVehicles, setFlaggedVehicles] = useState<FlaggedVehicle[]>([]);

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

    // Vehicle group filter
    if (groupFilter !== 'all') {
      result = result.filter((v) => v.group === groupFilter);
    }

    return result;
  }, [
    data.vehicles,
    data.outlierSummary.outliers,
    searchQuery,
    statusFilter,
    groupFilter,
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

  const handleFlagForReview = useCallback((vehicleId: string) => {
    setFlaggedVehicles((prev) => {
      // Don't add if already flagged and not resolved
      if (prev.some((f) => f.vehicleId === vehicleId && !f.resolved)) {
        return prev;
      }
      return [...prev, { vehicleId, flaggedAt: new Date(), resolved: false }];
    });
  }, []);

  const handleResolveFlag = useCallback((vehicleId: string) => {
    setFlaggedVehicles((prev) =>
      prev.map((f) =>
        f.vehicleId === vehicleId && !f.resolved
          ? { ...f, resolved: true, resolvedAt: new Date() }
          : f
      )
    );
  }, []);

  // Check if a vehicle is currently flagged (not resolved)
  const isVehicleFlagged = useCallback(
    (vehicleId: string) => {
      return flaggedVehicles.some(
        (f) => f.vehicleId === vehicleId && !f.resolved
      );
    },
    [flaggedVehicles]
  );

  // Count of unresolved flagged vehicles
  const unresolvedFlaggedCount = useMemo(
    () => flaggedVehicles.filter((f) => !f.resolved).length,
    [flaggedVehicles]
  );

  const handleAddExpenseFromDrawer = (vehicleId: string) => {
    console.log('[Demo] Add expense for vehicle:', vehicleId);
    // Could open a pre-filled expense form
  };

  const handleExpenseAdded = useCallback((expenseData: unknown) => {
    console.log('[Demo] Expense added:', expenseData);
    // Add expense to the list with a unique ID
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      ...(expenseData as Omit<Expense, 'id'>),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  }, []);

  const handleEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveExpense = useCallback((updatedExpense: Expense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
    setEditingExpense(null);
  }, []);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    // In a real app, you'd show a confirmation dialog first
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  }, []);

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
        v.vehicleLabel.split('�')[0]?.trim(),
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

  const handleExportPdf = () => {
    // Generate PDF board pack content
    const content = `TRANSPOCO FLEET COST REPORT
Generated: ${new Date().toLocaleDateString('en-IE')}

SUMMARY
-------
Total Monthly Cost: �${data.fleetSummary.totalMonthlyTco.toLocaleString()}
Cost per Vehicle: �${data.fleetSummary.tcoPerVehicle.toLocaleString()}
Cost per km: �${data.fleetSummary.tcoPerKm.toFixed(2)}
Vehicles Tracked: ${data.vehicles.length}
Data Completeness: ${data.fleetSummary.dataCompleteness}%

COST BREAKDOWN
--------------
${data.fleetSummary.costBreakdown.map((b) => `${b.label}: �${b.amount.toLocaleString()} (${b.sharePct}%)`).join('\n')}

TOP COST VEHICLES
-----------------
${filteredVehicles
  .slice(0, 10)
  .map(
    (v) =>
      `${v.vehicleId}: �${v.monthlyTco.toLocaleString()} (�${v.tcoPerKm.toFixed(2)}/km)`
  )
  .join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-cost-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCompliance = () => {
    const headers = ['Vehicle', 'Type', 'Due Date', 'Status', 'Days Until Due'];
    const rows = costData.compliance.items.map((item) => [
      item.vehicleLabel,
      item.type.toUpperCase(),
      item.dueDate,
      item.status,
      item.daysUntilDue.toString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTimePresetChange = (preset: TimePreset) => {
    setTimePreset(preset);
    if (preset === 'custom') {
      setIsCustomDateOpen(true);
    } else {
      setDateRange(getDateRangeForPreset(preset));
    }
  };

  const handleCalendarSelect = (
    range: { from?: Date; to?: Date } | undefined
  ) => {
    if (range?.from) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      const to = range.to ? new Date(range.to) : from;
      to.setHours(23, 59, 59, 999);
      setDateRange({ from, to });
      setTimePreset('custom');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setGroupFilter('all');
    setTimePreset('last-30-days');
    setDateRange(getDateRangeForPreset('last-30-days'));
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'all' ||
    groupFilter !== 'all' ||
    timePreset !== 'last-30-days';

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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setIsCustomExportOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
                Custom Export (AI)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPdf}>
                <FileText className="h-4 w-4 mr-2 text-red-500" />
                Monthly Board Pack
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCsv}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                Cost Breakdown (CSV)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportCompliance}>
                <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                Compliance Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="vehicles" className="flex-1 flex flex-col min-h-0">
        <TabsList>
          <TabsTrigger value="vehicles" className="gap-1.5">
            <Car className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="h-4 w-4" />
            Expenses
            {expenses.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {expenses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="flagged" className="gap-1.5">
            <Flag className="h-4 w-4" />
            Flagged
            {unresolvedFlaggedCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">
                {unresolvedFlaggedCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent
          value="vehicles"
          className="flex-1 flex flex-col min-h-0 space-y-4"
        >
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

            {/* Vehicle group filter */}
            <Select
              value={groupFilter}
              onValueChange={(v) => setGroupFilter(v as 'all' | VehicleGroup)}
            >
              <SelectTrigger className="w-[170px] h-9">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {VEHICLE_GROUP_OPTIONS.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time range filter */}
            <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
              <div className="flex items-center">
                <Select
                  value={timePreset}
                  onValueChange={(v) => handleTimePresetChange(v as TimePreset)}
                >
                  <SelectTrigger className="w-[160px] h-9 rounded-r-none border-r-0">
                    <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-l-none px-2 text-xs text-muted-foreground font-normal min-w-[120px]"
                  >
                    {formatDateRange(dateRange)}
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

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
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="flex-1 min-h-0">
          <ExpensesList
            expenses={expenses}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        </TabsContent>

        {/* Flagged Tab */}
        <TabsContent value="flagged" className="flex-1 min-h-0">
          <FlaggedVehiclesList
            flaggedVehicles={flaggedVehicles}
            vehicles={data.vehicles}
            outliers={data.outlierSummary.outliers}
            onViewDetails={handleRowClick}
            onResolve={handleResolveFlag}
          />
        </TabsContent>
      </Tabs>

      {/* Vehicle Detail Drawer */}
      <VehicleDetailDrawer
        vehicle={drawerVehicle}
        outlier={drawerOutlier}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onFlagForReview={handleFlagForReview}
        onAddExpense={handleAddExpenseFromDrawer}
        isFlagged={
          drawerVehicle ? isVehicleFlagged(drawerVehicle.vehicleId) : false
        }
      />

      {/* Edit Expense Dialog */}
      <EditExpenseDialog
        expense={editingExpense}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveExpense}
      />

      {/* Custom Export AI Dialog */}
      <CustomExportAIDialog
        open={isCustomExportOpen}
        onOpenChange={setIsCustomExportOpen}
        vehicles={data.vehicles}
        currency={data.currency}
      />
    </div>
  );
}
