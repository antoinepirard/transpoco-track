'use client';

import React from 'react';
import {
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
  GearIcon,
  QuestionIcon,
} from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SecondaryTopBarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SecondaryTopBarProps {
  categoryId: string;
  activeItemId?: string;
  onItemClick?: (item: { id: string; label: string }) => void;
}

// Settings sub-items organized by category
const settingsSubItems: Record<string, SecondaryTopBarItem[]> = {
  'users-permissions': [
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'profiles', label: 'Profiles', icon: UserCircleIcon },
    {
      id: 'security-settings',
      label: 'Security Settings',
      icon: ShieldCheckIcon,
    },
  ],
  'company-details': [
    { id: 'audit-logs', label: 'Audit logs', icon: ClockClockwiseIcon },
    { id: 'shift-time', label: 'Shift Time', icon: ClockIcon },
  ],
  garage: [
    { id: 'vehicles', label: 'Vehicles', icon: TruckIcon },
    { id: 'vehicle-groups', label: 'Vehicle Groups', icon: ListIcon },
    { id: 'drivers', label: 'Drivers', icon: UsersIcon },
    { id: 'driver-groups', label: 'Driver Groups', icon: UsersIcon },
    {
      id: 'vehicle-driver-groups',
      label: 'Vehicle Driver Groups',
      icon: UsersIcon,
    },
  ],
  alerts: [
    { id: 'manage-alerts', label: 'Manage Alerts', icon: WarningIcon },
    { id: 'alerts-log', label: 'Alerts Log', icon: ListIcon },
  ],
  'orders-billing': [
    { id: 'add-new-vehicles', label: 'Add New Vehicles', icon: PlusIcon },
    { id: 'view-orders', label: 'View Orders', icon: ReceiptIcon },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
  ],
  'api-resources': [
    { id: 'api-documentation', label: 'API Documentation', icon: BookOpenIcon },
    { id: 'request-api-access', label: 'Request API Access', icon: KeyIcon },
  ],
  'import-wizard': [
    { id: 'import-services', label: 'Import Services', icon: DownloadIcon },
    { id: 'import-drivers', label: 'Import Drivers', icon: UserPlusIcon },
    {
      id: 'import-purchases',
      label: 'Import Purchases',
      icon: CloudArrowDownIcon,
    },
  ],
  // Fuel / Electric module secondary top bar
  'fuel-electric': [
    { id: 'fuel', label: 'Fuel', icon: ListIcon },
    { id: 'electric-vehicles', label: 'Electric Vehicles', icon: TruckIcon },
    { id: 'settings', label: 'Settings', icon: GearIcon },
    { id: 'getting-started', label: 'Getting started', icon: QuestionIcon },
  ],
};

// Category display names
const categoryDisplayNames: Record<string, string> = {
  'users-permissions': 'Users & Permissions',
  'company-details': 'Company Details',
  garage: 'Garage',
  alerts: 'Alerts',
  'orders-billing': 'Orders & Billing',
  'api-resources': 'API Resources',
  'import-wizard': 'Import Wizard',
  'fuel-electric': 'Fuel / Electric',
};

export function SecondaryTopBar({
  categoryId,
  activeItemId = '',
  onItemClick,
}: SecondaryTopBarProps) {
  const items = settingsSubItems[categoryId] || [];
  const categoryDisplayName = categoryDisplayNames[categoryId] || categoryId;

  if (categoryId === 'fuel-electric') {
    const isActive = (id: string) => activeItemId === id;
    const tabClass = (active: boolean) =>
      `flex items-center px-3 h-full text-sm font-medium rounded-t-md transition-immediate group focus-ring cursor-pointer relative ` +
      (active
        ? 'bg-blue-50 text-[#3D88C5]'
        : 'text-gray-600 hover:hover-only:bg-white hover:hover-only:text-gray-900');

    const fuelMenuItems = [
      { id: 'fuel-transactions', label: 'Fuel Transactions' },
      { id: 'fuel-consumption', label: 'Fuel Consumption' },
      { id: 'fuel-consumption-summary', label: 'Fuel Consumption Summary' },
      { id: 'fuel-purchase-summary', label: 'Fuel Purchase Summary' },
      {
        id: 'fuel-transactions-gps-verified',
        label: 'Fuel Transactions Gps Verified',
      },
      {
        id: 'carbon-footprint-calculations',
        label: 'Carbon Footprint Calculations',
      },
      { id: 'canbus-fuel-used', label: 'Canbus Fuel Used' },
      { id: 'canbus-plant-utilisation', label: 'Canbus Plant Utilisation' },
    ];

    const evMenuItems = [
      { id: 'ev-suitability', label: 'EV Suitability' },
      { id: 'ev-charging', label: 'EV Charging' },
    ];

    const settingsMenuItems = [
      { id: 'fuel-accounts', label: 'Fuel Accounts' },
      { id: 'fuel-cards', label: 'Fuel Cards' },
      { id: 'ev-suitability-settings', label: 'EV Suitability Settings' },
    ];

    const handleSelectTab = (tabId: string) => {
      onItemClick?.({ id: tabId, label: tabId });
    };

    return (
      <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 relative z-20">
        {/* Left: Tabs with dropdowns */}
        <div className="flex items-center space-x-1 h-full">
          {/* Fuel */}
          <DropdownMenu>
            <DropdownMenuTrigger className={tabClass(isActive('fuel'))}>
              <ListIcon
                className={`mr-2 h-4 w-4 ${isActive('fuel') ? 'text-[#3D88C5]' : 'text-gray-400 group-hover:hover-only:text-gray-500'}`}
              />
              <span>Fuel</span>
              {isActive('fuel') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3D88C5]" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 p-1">
              {fuelMenuItems.map((it) => (
                <DropdownMenuItem
                  key={it.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectTab('fuel')}
                >
                  {it.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* EVs */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={tabClass(isActive('electric-vehicles'))}
            >
              <TruckIcon
                className={`mr-2 h-4 w-4 ${isActive('electric-vehicles') ? 'text-[#3D88C5]' : 'text-gray-400 group-hover:hover-only:text-gray-500'}`}
              />
              <span>EVs</span>
              {isActive('electric-vehicles') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3D88C5]" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1">
              {evMenuItems.map((it) => (
                <DropdownMenuItem
                  key={it.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectTab('electric-vehicles')}
                >
                  {it.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Settings dropdown and Help */}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger className={tabClass(isActive('settings'))}>
              <GearIcon
                className={`mr-2 h-4 w-4 ${isActive('settings') ? 'text-[#3D88C5]' : 'text-gray-400 group-hover:hover-only:text-gray-500'}`}
              />
              <span>Settings</span>
              {isActive('settings') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3D88C5]" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              {settingsMenuItems.map((it) => (
                <DropdownMenuItem
                  key={it.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectTab('settings')}
                >
                  {it.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center p-2 rounded-md transition-immediate group focus-ring cursor-pointer text-gray-600 hover:hover-only:bg-white hover:hover-only:text-gray-900 outline-none">
              <QuestionIcon className="h-5 w-5 flex-shrink-0 transition-immediate text-gray-400 group-hover:hover-only:text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => console.log('[Demo] Get started clicked')}
              >
                Get started
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => console.log('[Demo] Manual clicked')}
              >
                Manual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  const handleItemClick = (item: SecondaryTopBarItem) => {
    onItemClick?.({ id: item.id, label: item.label });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4 relative z-20">
      {/* Category title and items */}
      <div className="flex items-center space-x-6">
        {/* Category title */}
        <div className="text-sm font-semibold text-gray-900">
          {categoryDisplayName}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-gray-300"></div>

        {/* Navigation items */}
        <div className="flex items-center space-x-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItemId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-immediate group focus-ring cursor-pointer ${
                  isActive
                    ? 'bg-[#0e0033] text-white'
                    : 'text-gray-600 hover:hover-only:bg-white hover:hover-only:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-2 h-4 w-4 flex-shrink-0 transition-immediate ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 group-hover:hover-only:text-gray-500'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
