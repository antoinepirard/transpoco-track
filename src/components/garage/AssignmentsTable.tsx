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
import {
  CaretUpDown,
  CaretUp,
  CaretDown,
  StarIcon,
} from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { VehicleDriverAssignment, GarageTabStatus } from '@/types/garage';
import { getGroupName } from '@/lib/demo/garageData';
import { cn } from '@/lib/utils';

interface AssignmentsTableProps {
  assignments: VehicleDriverAssignment[];
  tabStatus: GarageTabStatus;
  searchQuery: string;
  onRowClick?: (assignment: VehicleDriverAssignment) => void;
}

export function AssignmentsTable({
  assignments,
  tabStatus,
  searchQuery,
  onRowClick,
}: AssignmentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const filteredAssignments = useMemo(() => {
    let filtered = assignments.filter((a) => a.status === tabStatus);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.vehicle?.description.toLowerCase().includes(query) ||
          a.vehicle?.registrationNumber.toLowerCase().includes(query) ||
          a.driver?.firstName.toLowerCase().includes(query) ||
          a.driver?.lastName.toLowerCase().includes(query) ||
          a.notes?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [assignments, tabStatus, searchQuery]);

  const columns = useMemo<ColumnDef<VehicleDriverAssignment>[]>(
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
        id: 'vehicle',
        header: 'Vehicle',
        accessorFn: (row) => row.vehicle?.description || '-',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.original.vehicle?.description || '-'}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.vehicle?.registrationNumber || ''}
            </div>
          </div>
        ),
        size: 200,
      },
      {
        id: 'driver',
        header: 'Driver',
        accessorFn: (row) =>
          row.driver ? `${row.driver.firstName} ${row.driver.lastName}` : '-',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.original.driver
                ? `${row.original.driver.firstName} ${row.original.driver.lastName}`
                : '-'}
            </div>
            <div className="text-xs text-gray-500">
              {row.original.driver?.email || ''}
            </div>
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: 'isPrimary',
        header: 'Type',
        cell: ({ row }) => (
          <Badge
            variant={row.original.isPrimary ? 'default' : 'secondary'}
            className={cn(
              row.original.isPrimary
                ? 'bg-[#3D88C5] hover:bg-[#3D88C5]'
                : 'bg-gray-100 text-gray-700'
            )}
          >
            {row.original.isPrimary ? (
              <span className="flex items-center gap-1">
                <StarIcon className="w-3 h-3" weight="fill" />
                Primary
              </span>
            ) : (
              'Backup'
            )}
          </Badge>
        ),
        size: 100,
      },
      {
        id: 'group',
        header: 'Group',
        cell: ({ row }) => getGroupName(row.original.groupId),
        size: 150,
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) =>
          row.original.startDate
            ? new Date(row.original.startDate).toLocaleDateString()
            : '-',
        size: 120,
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) =>
          row.original.endDate
            ? new Date(row.original.endDate).toLocaleDateString()
            : '-',
        size: 120,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => (
          <span className="text-gray-600 truncate max-w-[200px] block">
            {row.original.notes || '-'}
          </span>
        ),
        size: 200,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredAssignments,
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
      <table className="w-full text-sm bg-white" style={{ minWidth: '1150px' }}>
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
                No assignments found
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
