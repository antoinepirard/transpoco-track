'use client';

import React, { useCallback, useEffect } from 'react';
import {
  GearIcon,
  XIcon,
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
import { NavigationItemGroupDemo } from './NavigationItemGroupDemo';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
  children?: NavigationItem[];
}

interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
}

interface SettingsOverlayTopBarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItemId?: string;
  onItemClick?: (item: { id: string; label: string }) => void;
}

const settingsNavigationData: NavigationSection[] = [
  {
    id: 'users-permissions',
    title: 'Users & Permissions',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: UsersIcon,
      },
      {
        id: 'profiles',
        label: 'Profiles',
        icon: UserCircleIcon,
      },
      {
        id: 'security-settings',
        label: 'Security Settings',
        icon: ShieldCheckIcon,
      },
    ],
  },
  {
    id: 'company-details',
    title: 'Company Details',
    items: [
      {
        id: 'audit-logs',
        label: 'Audit logs',
        icon: ClockClockwiseIcon,
      },
      {
        id: 'shift-time',
        label: 'Shift Time',
        icon: ClockIcon,
      },
    ],
  },
  {
    id: 'garage',
    title: 'Garage',
    items: [
      {
        id: 'vehicles',
        label: 'Vehicles',
        icon: TruckIcon,
      },
      {
        id: 'vehicle-groups',
        label: 'Vehicle Groups',
        icon: ListIcon,
      },
      {
        id: 'drivers',
        label: 'Drivers',
        icon: UsersIcon,
      },
      {
        id: 'driver-groups',
        label: 'Driver Groups',
        icon: UsersIcon,
      },
      {
        id: 'vehicle-driver-groups',
        label: 'Vehicle Driver Groups',
        icon: UsersIcon,
      },
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts',
    items: [
      {
        id: 'manage-alerts',
        label: 'Manage Alerts',
        icon: WarningIcon,
      },
      {
        id: 'alerts-log',
        label: 'Alerts Log',
        icon: ListIcon,
      },
    ],
  },
  {
    id: 'orders-billing',
    title: 'Orders & Billing',
    items: [
      {
        id: 'add-new-vehicles',
        label: 'Add New Vehicles',
        icon: PlusIcon,
      },
      {
        id: 'view-orders',
        label: 'View Orders',
        icon: ReceiptIcon,
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: CreditCardIcon,
      },
    ],
  },
  {
    id: 'api-resources',
    title: 'API Resources',
    items: [
      {
        id: 'api-documentation',
        label: 'API Documentation',
        icon: BookOpenIcon,
      },
      {
        id: 'request-api-access',
        label: 'Request API Access',
        icon: KeyIcon,
      },
    ],
  },
  {
    id: 'import-wizard',
    title: 'Import Wizard',
    items: [
      {
        id: 'import-services',
        label: 'Import Services',
        icon: DownloadIcon,
      },
      {
        id: 'import-drivers',
        label: 'Import Drivers',
        icon: UserPlusIcon,
      },
      {
        id: 'import-purchases',
        label: 'Import Purchases',
        icon: CloudArrowDownIcon,
      },
    ],
  },
];

export function SettingsOverlayTopBar({ isOpen, onClose, activeItemId = '', onItemClick }: SettingsOverlayTopBarProps) {

  // Handle ESC key to close overlay
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when overlay is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleItemClick = useCallback((clickedItem: NavigationItem) => {
    onItemClick?.({ id: clickedItem.id, label: clickedItem.label });
    console.log(`[Demo] Settings item clicked: "${clickedItem.label}"`);
  }, [onItemClick]);

  const handleLearnMore = useCallback((item: NavigationItem) => {
    console.log(`[Demo] Learn more about settings item: "${item.label}"`);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, _itemId: string) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Basic keyboard navigation - could be enhanced
    }
  }, []);

  const handleItemHover = useCallback((_itemId: string, _anchorRect: DOMRect) => {
    // Placeholder for hover functionality if needed
  }, []);

  const handleItemLeave = useCallback(() => {
    // Placeholder for hover functionality if needed
  }, []);

  return (
    <>
      {/* Settings Sidebar - positioned as a proper sidebar */}
      <div 
        className={`absolute top-0 left-0 bottom-0 w-68 bg-white z-50 flex flex-col transition-transform duration-200 ease-out border-r border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          boxShadow: '2px 0 4px -1px rgb(0 0 0 / 0.1), 1px 0 2px -1px rgb(0 0 0 / 0.06)'
        }}
      >
        {/* Header */}
        <div className="px-4 py-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-800">
              <GearIcon className="w-4 h-4" />
              <h2 className="text-base font-semibold">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:hover-only:bg-gray-100 rounded transition-immediate focus-ring"
              aria-label="Close settings"
            >
              <XIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Settings Navigation */}
        <nav
          className="flex-1 overflow-y-auto py-4 custom-scrollbar"
          role="navigation"
          aria-label="Settings navigation"
        >
          <div>
            {settingsNavigationData.map((section) => (
              <div key={section.id} className="mb-6">
                {section.title && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-medium text-gray-500">
                      {section.title}
                    </h3>
                  </div>
                )}
                <div className="space-y-0.5 px-2">
                  {section.items.map((item) => {
                    const isActive = activeItemId === item.id;
                    
                    return (
                      <NavigationItemGroupDemo
                        key={item.id}
                        item={item}
                        isActive={isActive}
                        isExpanded={false}
                        isLocked={false}
                        activeItemId={activeItemId}
                        lockedItemIds={[]}
                        onItemClick={handleItemClick}
                        onExpandToggle={() => {}} // No expansion in settings
                        onLearnMore={handleLearnMore}
                        onKeyDown={handleKeyDown}
                        onItemHover={handleItemHover}
                        onItemLeave={handleItemLeave}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}