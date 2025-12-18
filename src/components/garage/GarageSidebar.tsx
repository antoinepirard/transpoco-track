'use client';

import { useState } from 'react';
import {
  TruckIcon,
  UsersIcon,
  LinkIcon,
  CaretDownIcon,
  CaretRightIcon,
  DotsThreeIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  GarageGroup,
  GarageSidebarSection,
  GroupType,
} from '@/types/garage';
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
        'w-full flex items-center justify-between px-3 py-1.5 text-sm rounded-md transition-colors',
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

interface GroupItemProps {
  group: GarageGroup;
  count: number;
  isActive: boolean;
  onClick: () => void;
  onRename: (group: GarageGroup) => void;
  onDelete: (group: GarageGroup) => void;
}

function GroupItem({
  group,
  count,
  isActive,
  onClick,
  onRename,
  onDelete,
}: GroupItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        'group relative flex items-center rounded-md transition-colors',
        isActive ? 'bg-[#3D88C5] text-white' : 'text-gray-700 hover:bg-gray-100'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onClick}
        className="flex-1 flex items-center justify-between px-3 py-1.5 text-sm min-w-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          {group.color && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: group.color }}
            />
          )}
          <span className="truncate">{group.name}</span>
        </div>
        <Badge
          variant={isActive ? 'secondary' : 'outline'}
          className={cn(
            'ml-2 flex-shrink-0 transition-opacity',
            isActive && 'bg-white/20 text-white border-transparent',
            (isHovered || isMenuOpen) && 'opacity-0'
          )}
        >
          {count}
        </Badge>
      </button>

      {/* 3-dot menu */}
      <div
        className={cn(
          'absolute right-1 transition-opacity',
          isHovered || isMenuOpen ? 'opacity-100' : 'opacity-0'
        )}
      >
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'p-1 rounded hover:bg-black/10',
                isActive && 'hover:bg-white/20'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <DotsThreeIcon className="w-4 h-4" weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename(group);
              }}
              className="cursor-pointer"
            >
              <PencilSimpleIcon className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(group);
              }}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface SidebarSectionProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  onAddGroup: () => void;
  children: React.ReactNode;
}

function SidebarSection({
  title,
  icon,
  isExpanded,
  onToggle,
  onAddGroup,
  children,
}: SidebarSectionProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? (
          <CaretDownIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <CaretRightIcon className="w-4 h-4 text-gray-500" />
        )}
        {icon}
        <span>{title}</span>
      </button>
      {isExpanded && (
        <div className="px-2 pb-2 space-y-0.5">
          {children}
          <button
            onClick={onAddGroup}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Group</span>
          </button>
        </div>
      )}
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
  onAddGroup?: (type: GroupType) => void;
  onRenameGroup?: (group: GarageGroup) => void;
  onDeleteGroup?: (group: GarageGroup) => void;
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
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
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

  const handleRename = (group: GarageGroup) => {
    onRenameGroup?.(group);
  };

  const handleDelete = (group: GarageGroup) => {
    onDeleteGroup?.(group);
  };

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">Garage</h2>
        <p className="text-sm text-gray-500">Manage your fleet</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Vehicles Section */}
        <SidebarSection
          title="Vehicles"
          icon={<TruckIcon className="w-4 h-4 text-gray-500" />}
          isExpanded={expandedSections.has('vehicles')}
          onToggle={() => toggleSection('vehicles')}
          onAddGroup={() => onAddGroup?.('vehicle')}
        >
          <SidebarItem
            label="All Vehicles"
            count={vehicleCounts.all}
            isActive={isItemActive('vehicles', null)}
            onClick={() => onSelectionChange('vehicles', null)}
          />
          {vehicleGroups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              count={vehicleCounts.byGroup[group.id] || 0}
              isActive={isItemActive('vehicles', group.id)}
              onClick={() => onSelectionChange('vehicles', group.id)}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </SidebarSection>

        {/* Drivers Section */}
        <SidebarSection
          title="Drivers"
          icon={<UsersIcon className="w-4 h-4 text-gray-500" />}
          isExpanded={expandedSections.has('drivers')}
          onToggle={() => toggleSection('drivers')}
          onAddGroup={() => onAddGroup?.('driver')}
        >
          <SidebarItem
            label="All Drivers"
            count={driverCounts.all}
            isActive={isItemActive('drivers', null)}
            onClick={() => onSelectionChange('drivers', null)}
          />
          {driverGroups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              count={driverCounts.byGroup[group.id] || 0}
              isActive={isItemActive('drivers', group.id)}
              onClick={() => onSelectionChange('drivers', group.id)}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </SidebarSection>

        {/* Assignments Section */}
        <SidebarSection
          title="Assignments"
          icon={<LinkIcon className="w-4 h-4 text-gray-500" />}
          isExpanded={expandedSections.has('assignments')}
          onToggle={() => toggleSection('assignments')}
          onAddGroup={() => onAddGroup?.('vehicle-driver')}
        >
          <SidebarItem
            label="All Assignments"
            count={assignmentCounts.all}
            isActive={isItemActive('assignments', null)}
            onClick={() => onSelectionChange('assignments', null)}
          />
          {vehicleDriverGroups.map((group) => (
            <GroupItem
              key={group.id}
              group={group}
              count={assignmentCounts.byGroup[group.id] || 0}
              isActive={isItemActive('assignments', group.id)}
              onClick={() => onSelectionChange('assignments', group.id)}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </SidebarSection>
      </div>
    </div>
  );
}
