'use client';

import { useState } from 'react';
import {
  TruckIcon,
  UsersIcon,
  LinkIcon,
  CaretDownIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import type { GarageGroup, GarageSidebarSection } from '@/types/garage';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  color?: string;
}

function SidebarItem({
  label,
  count,
  isActive,
  onClick,
  color,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
        isActive ? 'bg-[#3D88C5] text-white' : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {color && (
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="truncate">{label}</span>
      </div>
      <Badge
        variant={isActive ? 'secondary' : 'outline'}
        className={cn(
          'ml-2 flex-shrink-0',
          isActive && 'bg-white/20 text-white border-transparent'
        )}
      >
        {count}
      </Badge>
    </button>
  );
}

interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function SidebarSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
}: SidebarSectionProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <CaretDownIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <CaretRightIcon className="w-4 h-4 text-gray-500" />
        )}
        {icon}
        <span>{title}</span>
      </button>
      {isExpanded && <div className="px-2 pb-3 space-y-0.5">{children}</div>}
    </div>
  );
}

interface GarageSidebarProps {
  vehicleGroups: GarageGroup[];
  driverGroups: GarageGroup[];
  vehicleDriverGroups: GarageGroup[];
  vehicleCounts: { all: number; byGroup: Record<string, number> };
  driverCounts: { all: number; byGroup: Record<string, number> };
  assignmentCounts: { all: number; byGroup: Record<string, number> };
  selectedSection: GarageSidebarSection;
  selectedGroupId: string | null;
  onSelectionChange: (
    section: GarageSidebarSection,
    groupId: string | null
  ) => void;
}

export function GarageSidebar({
  vehicleGroups,
  driverGroups,
  vehicleDriverGroups,
  vehicleCounts,
  driverCounts,
  assignmentCounts,
  selectedSection,
  selectedGroupId,
  onSelectionChange,
}: GarageSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['vehicles', 'drivers', 'assignments'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const isItemActive = (
    section: GarageSidebarSection,
    groupId: string | null
  ) => selectedSection === section && selectedGroupId === groupId;

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Garage</h2>
        <p className="text-sm text-gray-500">Manage your fleet</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Vehicles Section */}
        <SidebarSection
          title="Vehicles"
          icon={<TruckIcon className="w-4 h-4 text-gray-500" />}
          isExpanded={expandedSections.has('vehicles')}
          onToggle={() => toggleSection('vehicles')}
        >
          <SidebarItem
            label="All Vehicles"
            count={vehicleCounts.all}
            isActive={isItemActive('vehicles', null)}
            onClick={() => onSelectionChange('vehicles', null)}
          />
          {vehicleGroups.map((group) => (
            <SidebarItem
              key={group.id}
              label={group.name}
              count={vehicleCounts.byGroup[group.id] || 0}
              isActive={isItemActive('vehicles', group.id)}
              onClick={() => onSelectionChange('vehicles', group.id)}
              color={group.color}
            />
          ))}
        </SidebarSection>

        {/* Drivers Section */}
        <SidebarSection
          title="Drivers"
          icon={<UsersIcon className="w-4 h-4 text-gray-500" />}
          isExpanded={expandedSections.has('drivers')}
          onToggle={() => toggleSection('drivers')}
        >
          <SidebarItem
            label="All Drivers"
            count={driverCounts.all}
            isActive={isItemActive('drivers', null)}
            onClick={() => onSelectionChange('drivers', null)}
          />
          {driverGroups.map((group) => (
            <SidebarItem
              key={group.id}
              label={group.name}
              count={driverCounts.byGroup[group.id] || 0}
              isActive={isItemActive('drivers', group.id)}
              onClick={() => onSelectionChange('drivers', group.id)}
              color={group.color}
            />
          ))}
        </SidebarSection>

        {/* Assignments Section */}
        <SidebarSection
          title="Assignments"
          icon={<LinkIcon className="w-4 h-4 text-gray-500" />}
          isExpanded={expandedSections.has('assignments')}
          onToggle={() => toggleSection('assignments')}
        >
          <SidebarItem
            label="All Assignments"
            count={assignmentCounts.all}
            isActive={isItemActive('assignments', null)}
            onClick={() => onSelectionChange('assignments', null)}
          />
          {vehicleDriverGroups.map((group) => (
            <SidebarItem
              key={group.id}
              label={group.name}
              count={assignmentCounts.byGroup[group.id] || 0}
              isActive={isItemActive('assignments', group.id)}
              onClick={() => onSelectionChange('assignments', group.id)}
              color={group.color}
            />
          ))}
        </SidebarSection>
      </div>
    </div>
  );
}
