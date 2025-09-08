'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  GearIcon,
  UsersIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockClockwiseIcon,
  ClockIcon,
  PlusIcon,
  ReceiptIcon,
  CreditCardIcon,
  BookOpenIcon,
  KeyIcon,
  DownloadIcon,
  CloudArrowDownIcon,
  UserPlusIcon,
  TruckIcon,
  WarningIcon,
  ListIcon,
} from '@phosphor-icons/react';

interface SettingsNavigationMenuProps {
  onItemClick?: (item: { id: string; label: string }) => void;
}

// Settings menu data structured for horizontal layout
const settingsMenuData = [
  {
    id: 'users-permissions',
    title: 'Users & Permissions',
    items: [
      { id: 'users', label: 'Users', icon: UsersIcon },
      { id: 'profiles', label: 'Profiles', icon: UserCircleIcon },
      { id: 'security-settings', label: 'Security Settings', icon: ShieldCheckIcon },
    ],
  },
  {
    id: 'company-details',
    title: 'Company Details',
    items: [
      { id: 'audit-logs', label: 'Audit logs', icon: ClockClockwiseIcon },
      { id: 'shift-time', label: 'Shift Time', icon: ClockIcon },
    ],
  },
  {
    id: 'orders-billing',
    title: 'Orders & Billing',
    items: [
      { id: 'add-new-vehicles', label: 'Add New Vehicles', icon: PlusIcon },
      { id: 'view-orders', label: 'View Orders', icon: ReceiptIcon },
      { id: 'subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts',
    items: [
      { id: 'manage-alerts', label: 'Manage Alerts', icon: WarningIcon },
      { id: 'alerts-log', label: 'Alerts Log', icon: ListIcon },
    ],
  },
  {
    id: 'api-resources',
    title: 'API Resources',
    items: [
      { id: 'api-documentation', label: 'API Docs', icon: BookOpenIcon },
      { id: 'request-api-access', label: 'API Access', icon: KeyIcon },
    ],
  },
  {
    id: 'import-wizard',
    title: 'Import Wizard',
    items: [
      { id: 'import-services', label: 'Import Services', icon: DownloadIcon },
      { id: 'import-drivers', label: 'Import Drivers', icon: UserPlusIcon },
      { id: 'import-purchases', label: 'Import Purchases', icon: CloudArrowDownIcon },
    ],
  },
  {
    id: 'garage',
    title: 'Garage',
    items: [
      { id: 'vehicles', label: 'Vehicles', icon: TruckIcon },
      { id: 'vehicle-groups', label: 'Vehicle Groups', icon: ListIcon },
      { id: 'drivers', label: 'Drivers', icon: UsersIcon },
      { id: 'driver-groups', label: 'Driver Groups', icon: UsersIcon },
      { id: 'vehicle-driver-groups', label: 'Vehicle Driver Groups', icon: UsersIcon },
    ],
  },
];

export function SettingsNavigationMenu({ onItemClick }: SettingsNavigationMenuProps) {
  const handleItemClick = (item: { id: string; label: string }) => {
    onItemClick?.(item);
    console.log(`[Demo] Settings menu item clicked: "${item.label}"`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-immediate group focus-ring cursor-pointer text-gray-700 hover:hover-only:bg-gray-100 hover:hover-only:text-gray-900 data-[state=open]:bg-gray-900 data-[state=open]:text-white outline-none">
        <GearIcon className="mr-2 h-5 w-5 flex-shrink-0 transition-immediate text-gray-400 group-hover:hover-only:text-gray-500 group-data-[state=open]:text-white" />
        <span>Settings</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        className="w-[600px] max-h-[80vh] overflow-y-auto p-0"
        collisionPadding={10}
        avoidCollisions={true}
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 p-4">
          {settingsMenuData.map((section) => (
            <div key={section.id} className="space-y-3">
              <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider border-b pb-2">
                {section.title}
              </DropdownMenuLabel>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleItemClick({ id: item.id, label: item.label })}
                    >
                      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}