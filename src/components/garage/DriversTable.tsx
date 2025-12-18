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
  WarningIcon,
} from '@phosphor-icons/react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { GarageDriver, GarageTabStatus } from '@/types/garage';
import { getVehicleName, getGroupName } from '@/lib/demo/garageData';
import { cn } from '@/lib/utils';

interface DriversTableProps {
  drivers: GarageDriver[];
  tabStatus: GarageTabStatus;
  searchQuery: string;
}

function isLicenseExpiringSoon(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry <= thirtyDaysFromNow && expiry >= now;
}

function isLicenseExpired(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  return expiry < new Date();
}

export function DriversTable({
  drivers,
  tabStatus,
  searchQuery,
}: DriversTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const filteredDrivers = useMemo(() => {
    let filtered = drivers.filter((d) => d.status === tabStatus);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.firstName.toLowerCase().includes(query) ||
          d.lastName.toLowerCase().includes(query) ||
          d.email?.toLowerCase().includes(query) ||
          d.phone?.toLowerCase().includes(query) ||
          d.licenseNumber?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [drivers, tabStatus, searchQuery]);

  const columns = useMemo<ColumnDef<GarageDriver>[]>(
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
        id: 'name',
        header: 'Name',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        size: 180,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => row.original.email || '-',
        size: 220,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => row.original.phone || '-',
        size: 150,
      },
      {
        accessorKey: 'licenseNumber',
        header: 'License Number',
        cell: ({ row }) => row.original.licenseNumber || '-',
        size: 140,
      },
      {
        accessorKey: 'licenseExpiry',
        header: 'License Expiry',
        cell: ({ row }) => {
          const expiry = row.original.licenseExpiry;
          if (!expiry) return '-';

          const expired = isLicenseExpired(expiry);
          const expiringSoon = isLicenseExpiringSoon(expiry);

          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  expired && 'text-red-600',
                  expiringSoon && 'text-amber-600'
                )}
              >
                {new Date(expiry).toLocaleDateString()}
              </span>
              {expired && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
              {expiringSoon && !expired && (
                <Badge
                  variant="outline"
                  className="text-xs text-amber-600 border-amber-300"
                >
                  <WarningIcon className="w-3 h-3 mr-1" />
                  Expiring
                </Badge>
              )}
            </div>
          );
        },
        size: 160,
      },
      {
        id: 'vehicle',
        header: 'Assigned Vehicle',
        cell: ({ row }) => getVehicleName(row.original.assignedVehicleId),
        size: 150,
      },
      {
        id: 'group',
        header: 'Group',
        cell: ({ row }) => getGroupName(row.original.groupId),
        size: 130,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredDrivers,
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
      <table className="w-full text-sm bg-white" style={{ minWidth: '1100px' }}>
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
                No drivers found
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
