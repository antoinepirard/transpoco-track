'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CaretUpDown, CaretUp, CaretDown } from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { GarageVehicle, GarageTabStatus } from '@/types/garage';
import { getDriverName, getGroupName } from '@/lib/demo/garageData';
import { cn } from '@/lib/utils';

interface VehiclesTableProps {
  vehicles: GarageVehicle[];
  tabStatus: GarageTabStatus;
  searchQuery: string;
  onRowClick?: (vehicle: GarageVehicle) => void;
}

const fuelTypeColors: Record<string, string> = {
  diesel: 'bg-amber-100 text-amber-800',
  petrol: 'bg-red-100 text-red-800',
  electric: 'bg-green-100 text-green-800',
  hybrid: 'bg-blue-100 text-blue-800',
  lpg: 'bg-purple-100 text-purple-800',
};

export function VehiclesTable({
  vehicles,
  tabStatus,
  searchQuery,
  onRowClick,
}: VehiclesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter((v) => v.status === tabStatus);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.description.toLowerCase().includes(query) ||
          v.registrationNumber.toLowerCase().includes(query) ||
          v.make?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query) ||
          v.fleetNumber?.toLowerCase().includes(query) ||
          v.division?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [vehicles, tabStatus, searchQuery]);

  const columns = useMemo<ColumnDef<GarageVehicle>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        size: 40,
      },
      {
        accessorKey: 'registrationNumber',
        header: 'Registration',
        size: 110,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 160,
      },
      {
        accessorKey: 'secondaryDescription',
        header: 'Secondary Desc.',
        cell: ({ row }) => row.original.secondaryDescription || '-',
        size: 130,
      },
      {
        accessorKey: 'make',
        header: 'Make',
        cell: ({ row }) => row.original.make || '-',
        size: 100,
      },
      {
        accessorKey: 'model',
        header: 'Model',
        cell: ({ row }) => row.original.model || '-',
        size: 120,
      },
      {
        accessorKey: 'fuelType',
        header: 'Fuel Type',
        cell: ({ row }) =>
          row.original.fuelType ? (
            <Badge
              variant="secondary"
              className={cn(
                'capitalize',
                fuelTypeColors[row.original.fuelType] || 'bg-gray-100'
              )}
            >
              {row.original.fuelType}
            </Badge>
          ) : (
            '-'
          ),
        size: 100,
      },
      {
        accessorKey: 'fleetNumber',
        header: 'Fleet #',
        cell: ({ row }) => row.original.fleetNumber || '-',
        size: 80,
      },
      {
        accessorKey: 'mileage',
        header: 'Mileage (km)',
        cell: ({ row }) =>
          row.original.mileage ? row.original.mileage.toLocaleString() : '-',
        size: 100,
      },
      {
        accessorKey: 'division',
        header: 'Division',
        cell: ({ row }) => row.original.division || '-',
        size: 120,
      },
      {
        id: 'driver',
        header: 'Assigned Driver',
        cell: ({ row }) => getDriverName(row.original.assignedDriverId),
        size: 140,
      },
      {
        id: 'group',
        header: 'Group',
        cell: ({ row }) => getGroupName(row.original.groupId),
        size: 120,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredVehicles,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm bg-white" style={{ minWidth: '1400px' }}>
        <thead className="bg-gray-50 text-left text-gray-600">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 font-medium"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={cn(
                        'flex items-center gap-1',
                        header.column.getCanSort() &&
                          'cursor-pointer select-none hover:text-gray-900'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400">
                          {{
                            asc: <CaretUp className="w-4 h-4" />,
                            desc: <CaretDown className="w-4 h-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <CaretUpDown className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-500"
              >
                No vehicles found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3"
                    style={{ width: cell.column.getSize() }}
                    onClick={(e) => {
                      // Prevent row click when clicking on checkbox
                      if (cell.column.id === 'select') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
