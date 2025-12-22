'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
  Car,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

// Types
export interface Expense {
  id: string;
  vehicle: string;
  category: string;
  amount: string;
  date: string;
  supplier: string;
  confidence?: number;
}

// Cost categories (reused from InvoiceDropZone)
const COST_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'lease', label: 'Lease/Finance' },
  { value: 'tax', label: 'Road Tax' },
  { value: 'tolls', label: 'Tolls' },
  { value: 'fines', label: 'Fines' },
  { value: 'parking', label: 'Parking' },
  { value: 'other', label: 'Other' },
];

type SortField = 'date' | 'vehicle' | 'category' | 'amount' | 'supplier';
type SortDirection = 'asc' | 'desc';

interface ExpensesListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

// Format category for display
function getCategoryLabel(value: string): string {
  return COST_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// Category badge colors
function getCategoryColor(category: string): string {
  switch (category) {
    case 'fuel':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'maintenance':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'insurance':
      return 'border-purple-200 bg-purple-50 text-purple-700';
    case 'lease':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    case 'tax':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'tolls':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700';
    case 'fines':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'parking':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    default:
      return 'border-gray-200 bg-gray-50 text-gray-700';
  }
}

// Sortable column header
function SortableHeader({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
  align = 'left',
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  align?: 'left' | 'right';
}) {
  const isActive = currentSort === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors',
        align === 'right' && 'ml-auto'
      )}
    >
      {label}
      {isActive ? (
        currentDirection === 'asc' ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      )}
    </button>
  );
}

export function ExpensesList({
  expenses,
  onEdit,
  onDelete,
}: ExpensesListProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sort state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.vehicle.toLowerCase().includes(query) ||
          e.supplier.toLowerCase().includes(query) ||
          getCategoryLabel(e.category).toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'vehicle':
          aVal = a.vehicle;
          bVal = b.vehicle;
          break;
        case 'category':
          aVal = a.category;
          bVal = b.category;
          break;
        case 'amount':
          aVal = parseFloat(a.amount);
          bVal = parseFloat(b.amount);
          break;
        case 'supplier':
          aVal = a.supplier;
          bVal = b.supplier;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return result;
  }, [expenses, searchQuery, categoryFilter, sortField, sortDirection]);

  // Calculate totals
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  }, [filteredExpenses]);

  const hasActiveFilters = searchQuery || categoryFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
  };

  // Empty state
  if (expenses.length === 0) {
    return (
      <div className="border rounded-lg bg-white p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Receipt className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No expenses yet</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Drop an invoice or upload a CSV to add your first expense. All
          expenses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-lg border">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {COST_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
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
            Clear
          </Button>
        )}

        {/* Results count */}
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredExpenses.length} of {expenses.length} expenses
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Date"
                    field="date"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Vehicle"
                    field="vehicle"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Category"
                    field="category"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Supplier"
                    field="supplier"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className="px-4 py-3 text-right">
                  <SortableHeader
                    label="Amount"
                    field="amount"
                    currentSort={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    align="right"
                  />
                </th>
                <th className="px-4 py-3 text-center">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm">
                    {new Date(expense.date).toLocaleDateString('en-IE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {expense.vehicle}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        getCategoryColor(expense.category)
                      )}
                    >
                      {getCategoryLabel(expense.category)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {expense.supplier}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold tabular-nums">
                      €{parseFloat(expense.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(expense)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with totals */}
        <div className="px-4 py-3 bg-slate-50 border-t flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {filteredExpenses.length} expense
            {filteredExpenses.length !== 1 ? 's' : ''}
          </span>
          <span className="font-semibold">
            Total: €{totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}



