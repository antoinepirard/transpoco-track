'use client';

import React from 'react';
import {
  CheckCircleIcon,
  GearIcon,
  ListIcon,
  CalendarIcon,
  UsersIcon,
  TruckIcon,
  BellIcon,
  QuestionIcon,
  EnvelopeIcon,
  PaperPlaneIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface SecondaryTopBarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SubPageSecondaryTopBarProps {
  pageId: string;
  activeTabId?: string;
  onTabClick?: (tab: { id: string; label: string }) => void;
  showActionButton?: boolean;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
}

// Tabs organized by sub-page
const subPageTabs: Record<string, SecondaryTopBarItem[]> = {
  // Messages page
  messages: [
    { id: 'messages', label: 'Messages', icon: EnvelopeIcon },
    { id: 'sent-messages', label: 'Sent Messages', icon: PaperPlaneIcon },
  ],

  // Walkaround sub-pages
  'all-checks': [
    { id: 'weekly', label: 'Weekly', icon: CalendarIcon },
    { id: 'list-view', label: 'List view', icon: ListIcon },
  ],
  'driven-without-checks': [
    { id: 'per-driver', label: 'Per Driver', icon: UsersIcon },
    { id: 'per-vehicle', label: 'Per Vehicle', icon: TruckIcon },
  ],
  'walkaround-settings': [
    { id: 'alerts', label: 'Alerts', icon: BellIcon },
    { id: 'checklist', label: 'Checklist', icon: CheckCircleIcon },
    { id: 'settings-company', label: 'Settings Company', icon: GearIcon },
  ],

  // Driving Style sub-pages
  'speed-summary': [
    { id: 'per-vehicle', label: 'Per Vehicle', icon: TruckIcon },
    { id: 'per-driver', label: 'Per Driver', icon: UsersIcon },
  ],
  'driving-summary': [
    { id: 'per-vehicle', label: 'Per Vehicle', icon: TruckIcon },
    { id: 'per-driver', label: 'Per Driver', icon: UsersIcon },
  ],

  // Reports: Journeys
  journeys: [
    { id: 'journeys', label: 'Journeys', icon: TruckIcon },
    { id: 'off-road', label: 'Off road', icon: ListIcon },
  ],

  // Fuel / Electric module (moved to sidebar submenus; keep empty for now)
  'fuel-electric': [],
};

export function SubPageSecondaryTopBar({
  pageId,
  activeTabId = '',
  onTabClick,
  showActionButton = false,
  actionButtonLabel = '',
  onActionButtonClick,
}: SubPageSecondaryTopBarProps) {
  const tabs = subPageTabs[pageId] || [];

  const handleTabClick = (tab: SecondaryTopBarItem) => {
    onTabClick?.({ id: tab.id, label: tab.label });
  };

  // Always render the bar so pages without tabs (e.g., Fuel/Electric) can still show the help menu

  return (
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 relative z-20">
      {/* Left side - Tab items */}
      <div className="flex items-center space-x-1 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabId === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex items-center px-3 h-full text-sm font-medium rounded-t-md transition-immediate group focus-ring cursor-pointer relative ${
                isActive
                  ? 'bg-blue-50 text-[#3D88C5]'
                  : 'text-gray-600 hover:hover-only:bg-white hover:hover-only:text-gray-900'
              }`}
            >
              {Icon && (
                <Icon
                  className={`mr-2 h-4 w-4 flex-shrink-0 transition-immediate ${
                    isActive
                      ? 'text-[#3D88C5]'
                      : 'text-gray-400 group-hover:hover-only:text-gray-500'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3D88C5]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right side - Action button or Help menu */}
      <div className="flex items-center">
        {showActionButton ? (
          <Button
            onClick={onActionButtonClick}
            size="sm"
            className="bg-[#3D88C5] hover:bg-[#2d6a9a] text-white"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            {actionButtonLabel}
          </Button>
        ) : (
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
        )}
      </div>
    </div>
  );
}
