'use client';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GearIcon,
  UsersIcon,
  ClockClockwiseIcon,
  TruckIcon,
  WarningIcon,
  CreditCardIcon,
  BookOpenIcon,
  DownloadIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';

interface SettingsCategoriesMenuProps {
  onCategoryClick?: (categoryId: string) => void;
  selectedCategory?: string;
}

// Simplified settings categories data
const settingsCategories = [
  {
    id: 'users-permissions',
    title: 'Users & Permissions',
    icon: UsersIcon,
  },
  {
    id: 'company-details',
    title: 'Company Details',
    icon: ClockClockwiseIcon,
  },
  {
    id: 'garage',
    title: 'Garage',
    icon: TruckIcon,
  },
  {
    id: 'alerts',
    title: 'Alerts',
    icon: WarningIcon,
  },
  {
    id: 'orders-billing',
    title: 'Orders & Billing',
    icon: CreditCardIcon,
  },
  {
    id: 'api-resources',
    title: 'API Resources',
    icon: BookOpenIcon,
  },
  {
    id: 'import-wizard',
    title: 'Import Wizard',
    icon: DownloadIcon,
  },
];

export function SettingsCategoriesMenu({ 
  onCategoryClick,
  selectedCategory = '',
}: SettingsCategoriesMenuProps) {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick?.(categoryId);
    console.log(`[Demo] Settings category clicked: "${categoryId}"`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-immediate group focus-ring cursor-pointer text-gray-700 hover:hover-only:bg-gray-100 hover:hover-only:text-gray-900 data-[state=open]:bg-gray-900 data-[state=open]:text-white outline-none">
        <GearIcon className="mr-2 h-5 w-5 flex-shrink-0 transition-immediate text-gray-400 group-hover:hover-only:text-gray-500 group-data-[state=open]:text-white" />
        <span>Settings</span>
        <CaretDownIcon className="ml-1 h-4 w-4 flex-shrink-0 transition-immediate text-gray-400 group-hover:hover-only:text-gray-500 group-data-[state=open]:text-white group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        className="w-64 p-2"
        collisionPadding={10}
        avoidCollisions={true}
      >
        <div className="space-y-1">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <DropdownMenuItem
                key={category.id}
                className={`flex items-center gap-3 cursor-pointer transition-immediate ${
                  isSelected 
                    ? 'bg-gray-900 text-white' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${
                  isSelected ? 'text-white' : 'text-gray-400'
                }`} />
                <span className="text-sm font-medium">{category.title}</span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}