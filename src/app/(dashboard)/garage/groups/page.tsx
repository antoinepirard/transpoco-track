'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TruckIcon,
  UsersIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupDialog } from '@/components/garage/GroupDialog';
import { DeleteGroupDialog } from '@/components/garage/DeleteGroupDialog';
import {
  VEHICLE_GROUPS,
  DRIVER_GROUPS,
  VEHICLE_DRIVER_GROUPS,
} from '@/lib/demo/garageData';
import type { GarageGroup, GroupType } from '@/types/garage';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'vehicle' | 'driver' | 'vehicle-driver';

const filterTabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Groups', icon: null },
  { id: 'vehicle', label: 'Vehicles', icon: <TruckIcon className="w-4 h-4" /> },
  { id: 'driver', label: 'Drivers', icon: <UsersIcon className="w-4 h-4" /> },
  { id: 'vehicle-driver', label: 'Assignments', icon: <LinkIcon className="w-4 h-4" /> },
];

function GroupCard({
  group,
  onSelect,
  onRename,
  onDelete,
}: {
  group: GarageGroup;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTypeLabel = (type: GroupType) => {
    switch (type) {
      case 'vehicle':
        return 'Vehicles';
      case 'driver':
        return 'Drivers';
      case 'vehicle-driver':
        return 'Assignments';
    }
  };

  const getTypeIcon = (type: GroupType) => {
    switch (type) {
      case 'vehicle':
        return <TruckIcon className="w-4 h-4" />;
      case 'driver':
        return <UsersIcon className="w-4 h-4" />;
      case 'vehicle-driver':
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div
      className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-[#3D88C5]/30 transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {group.color && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: group.color }}
            />
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {group.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">{getTypeIcon(group.type)}</span>
            {getTypeLabel(group.type)}
          </Badge>

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'p-1.5 rounded hover:bg-gray-100 transition-opacity',
                  'opacity-0 group-hover:opacity-100',
                  isMenuOpen && 'opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <DotsThreeIcon className="w-4 h-4 text-gray-500" weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                }}
                className="cursor-pointer"
              >
                <PencilSimpleIcon className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
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

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span>{group.memberCount} members</span>
        <span>Updated {new Date(group.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as FilterTab) || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>(initialType);

  // Local state for groups (in production would come from API)
  const [vehicleGroups, setVehicleGroups] = useState<GarageGroup[]>(VEHICLE_GROUPS);
  const [driverGroups, setDriverGroups] = useState<GarageGroup[]>(DRIVER_GROUPS);
  const [vehicleDriverGroups, setVehicleDriverGroups] = useState<GarageGroup[]>(VEHICLE_DRIVER_GROUPS);

  // Dialog states
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState<'add' | 'rename'>('add');
  const [groupDialogType, setGroupDialogType] = useState<GroupType>('vehicle');
  const [selectedGroup, setSelectedGroup] = useState<GarageGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Combine and filter groups
  const filteredGroups = useMemo(() => {
    const allGroups = [
      ...vehicleGroups,
      ...driverGroups,
      ...vehicleDriverGroups,
    ];

    // Sort by updatedAt descending
    const sorted = allGroups.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Filter by type
    const typeFiltered = activeTab === 'all'
      ? sorted
      : sorted.filter((g) => g.type === activeTab);

    // Filter by search
    if (!searchQuery.trim()) return typeFiltered;
    return typeFiltered.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vehicleGroups, driverGroups, vehicleDriverGroups, activeTab, searchQuery]);

  // Handle group selection - navigate back to garage with selection
  const handleSelectGroup = (group: GarageGroup) => {
    const sectionMap: Record<GroupType, string> = {
      vehicle: 'vehicles',
      driver: 'drivers',
      'vehicle-driver': 'assignments',
    };
    const section = sectionMap[group.type];
    router.push(`/garage?section=${section}&groupId=${group.id}`);
  };

  // Handle rename group
  const handleRenameGroup = (group: GarageGroup) => {
    setGroupDialogMode('rename');
    setGroupDialogType(group.type);
    setSelectedGroup(group);
    setGroupDialogOpen(true);
  };

  // Handle delete group
  const handleDeleteGroup = (group: GarageGroup) => {
    setSelectedGroup(group);
    setDeleteDialogOpen(true);
  };

  // Submit group dialog (rename)
  const handleGroupSubmit = (name: string, color: string) => {
    const now = new Date().toISOString();

    if (groupDialogMode === 'rename' && selectedGroup) {
      const updateGroup = (groups: GarageGroup[]) =>
        groups.map((g) =>
          g.id === selectedGroup.id ? { ...g, name, color, updatedAt: now } : g
        );

      switch (selectedGroup.type) {
        case 'vehicle':
          setVehicleGroups(updateGroup);
          break;
        case 'driver':
          setDriverGroups(updateGroup);
          break;
        case 'vehicle-driver':
          setVehicleDriverGroups(updateGroup);
          break;
      }
    }
  };

  // Confirm delete group
  const handleDeleteConfirm = () => {
    if (!selectedGroup) return;

    const removeGroup = (groups: GarageGroup[]) =>
      groups.filter((g) => g.id !== selectedGroup.id);

    switch (selectedGroup.type) {
      case 'vehicle':
        setVehicleGroups(removeGroup);
        break;
      case 'driver':
        setDriverGroups(removeGroup);
        break;
      case 'vehicle-driver':
        setVehicleDriverGroups(removeGroup);
        break;
    }
  };

  // Count groups by type
  const groupCounts = useMemo(() => ({
    all: vehicleGroups.length + driverGroups.length + vehicleDriverGroups.length,
    vehicle: vehicleGroups.length,
    driver: driverGroups.length,
    'vehicle-driver': vehicleDriverGroups.length,
  }), [vehicleGroups, driverGroups, vehicleDriverGroups]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/garage')}
            className="gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Garage
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">All Groups</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {groupCounts.all} groups total
            </p>
          </div>

          <div className="relative w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mt-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-[#3D88C5] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {tab.icon}
              {tab.label}
              <Badge
                variant={activeTab === tab.id ? 'secondary' : 'outline'}
                className={cn(
                  'ml-1 text-xs',
                  activeTab === tab.id && 'bg-white/20 text-white border-transparent'
                )}
              >
                {groupCounts[tab.id]}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <MagnifyingGlassIcon className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">No groups found</p>
            <p className="text-sm">
              {searchQuery
                ? 'Try a different search term'
                : 'Create a group from the Garage page'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onSelect={() => handleSelectGroup(group)}
                onRename={() => handleRenameGroup(group)}
                onDelete={() => handleDeleteGroup(group)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Group Dialog */}
      <GroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        mode={groupDialogMode}
        groupType={groupDialogType}
        group={selectedGroup}
        onSubmit={handleGroupSubmit}
      />

      {/* Delete Group Dialog */}
      <DeleteGroupDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        group={selectedGroup}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

