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
} from '@phosphor-icons/react';

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
    { id: 'security-settings', label: 'Security Settings', icon: ShieldCheckIcon },
  ],
  'company-details': [
    { id: 'audit-logs', label: 'Audit logs', icon: ClockClockwiseIcon },
    { id: 'shift-time', label: 'Shift Time', icon: ClockIcon },
  ],
  'garage': [
    { id: 'vehicles', label: 'Vehicles', icon: TruckIcon },
    { id: 'vehicle-groups', label: 'Vehicle Groups', icon: ListIcon },
    { id: 'drivers', label: 'Drivers', icon: UsersIcon },
    { id: 'driver-groups', label: 'Driver Groups', icon: UsersIcon },
    { id: 'vehicle-driver-groups', label: 'Vehicle Driver Groups', icon: UsersIcon },
  ],
  'alerts': [
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
    { id: 'import-purchases', label: 'Import Purchases', icon: CloudArrowDownIcon },
  ],
};

// Category display names
const categoryDisplayNames: Record<string, string> = {
  'users-permissions': 'Users & Permissions',
  'company-details': 'Company Details',
  'garage': 'Garage',
  'alerts': 'Alerts',
  'orders-billing': 'Orders & Billing',
  'api-resources': 'API Resources',
  'import-wizard': 'Import Wizard',
};

export function SecondaryTopBar({ 
  categoryId, 
  activeItemId = '', 
  onItemClick
}: SecondaryTopBarProps) {
  const items = settingsSubItems[categoryId] || [];
  const categoryDisplayName = categoryDisplayNames[categoryId] || categoryId;

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
        <div className="text-sm font-medium text-gray-600">
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
                <Icon className={`mr-2 h-4 w-4 flex-shrink-0 transition-immediate ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:hover-only:text-gray-500'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}