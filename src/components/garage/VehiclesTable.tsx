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
}

const fuelTypeColors: Record<string, string> = {
  diesel: 'bg-amber-100 text-amber-800',
  petrol: 'bg-red-100 text-red-800',
  electric: 'bg-green-100 text-green-800',
  hybrid: 'bg-blue-100 text-blue-800',
  lpg: 'bg-purple-100 text-purple-800',
};

const vehicleTypeColors: Record<string, string> = {
  truck: 'bg-gray-100 text-gray-800',
  van: 'bg-blue-100 text-blue-800',
  car: 'bg-indigo-100 text-indigo-800',
  motorcycle: 'bg-orange-100 text-orange-800',
  trailer: 'bg-slate-100 text-slate-800',
};

export function VehiclesTable({
  vehicles,
  tabStatus,
  searchQuery,
}: VehiclesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter((v) => v.status === tabStatus);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.registrationNumber.toLowerCase().includes(query) ||
          v.make?.toLowerCase().includes(query) ||
          v.model?.toLowerCase().includes(query)
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
        accessorKey: 'name',
        header: 'Vehicle Name',
        size: 180,
      },
      {
        accessorKey: 'registrationNumber',
        header: 'Registration',
        size: 120,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={cn(
              'capitalize',
              vehicleTypeColors[row.original.type] || 'bg-gray-100'
            )}
          >
            {row.original.type}
          </Badge>
        ),
        size: 100,
      },
      {
        id: 'makeModel',
        header: 'Make / Model',
        cell: ({ row }) => {
          const make = row.original.make || '';
          const model = row.original.model || '';
          return make || model ? `${make} ${model}`.trim() : '-';
        },
        size: 180,
      },
      {
        accessorKey: 'year',
        header: 'Year',
        cell: ({ row }) => row.original.year || '-',
        size: 80,
      },
      {
        accessorKey: 'fuelType',
        header: 'Fuel',
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
        id: 'driver',
        header: 'Assigned Driver',
        cell: ({ row }) => getDriverName(row.original.assignedDriverId),
        size: 150,
      },
      {
        id: 'group',
        header: 'Group',
        cell: ({ row }) => getGroupName(row.original.groupId),
        size: 130,
      },
      {
        accessorKey: 'odometer',
        header: 'Odometer',
        cell: ({ row }) =>
          row.original.odometer
            ? `${row.original.odometer.toLocaleString()} km`
            : '-',
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
      <table className="w-full text-sm bg-white" style={{ minWidth: '1200px' }}>
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
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3"
                    style={{ width: cell.column.getSize() }}
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
