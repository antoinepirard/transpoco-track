'use client';

import { useState, useMemo } from 'react';
import {
  PlusIcon,
  DownloadIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  UsersIcon,
  LinkIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GarageSidebar } from '@/components/garage/GarageSidebar';
import { VehiclesTable } from '@/components/garage/VehiclesTable';
import { DriversTable } from '@/components/garage/DriversTable';
import { AssignmentsTable } from '@/components/garage/AssignmentsTable';
import {
  VEHICLES,
  DRIVERS,
  VEHICLE_GROUPS,
  DRIVER_GROUPS,
  VEHICLE_DRIVER_GROUPS,
  getAssignmentsWithDetails,
  getVehiclesByGroup,
  getDriversByGroup,
  getAssignmentsByGroup,
} from '@/lib/demo/garageData';
import type { GarageSidebarSection, GarageTabStatus } from '@/types/garage';
import { cn } from '@/lib/utils';

type TabItem = {
  id: GarageTabStatus;
  label: string;
};

const tabs: TabItem[] = [
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
];

export default function GaragePage() {
  const [selectedSection, setSelectedSection] =
    useState<GarageSidebarSection>('vehicles');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [tabStatus, setTabStatus] = useState<GarageTabStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Get data based on selection
  const vehicles = useMemo(
    () => getVehiclesByGroup(selectedGroupId),
    [selectedGroupId]
  );
  const drivers = useMemo(
    () => getDriversByGroup(selectedGroupId),
    [selectedGroupId]
  );
  const assignments = useMemo(
    () => getAssignmentsByGroup(selectedGroupId),
    [selectedGroupId]
  );

  // Calculate counts for sidebar
  const vehicleCounts = useMemo(() => {
    const byGroup: Record<string, number> = {};
    VEHICLE_GROUPS.forEach((group) => {
      byGroup[group.id] = VEHICLES.filter((v) => v.groupId === group.id).length;
    });
    return { all: VEHICLES.length, byGroup };
  }, []);

  const driverCounts = useMemo(() => {
    const byGroup: Record<string, number> = {};
    DRIVER_GROUPS.forEach((group) => {
      byGroup[group.id] = DRIVERS.filter((d) => d.groupId === group.id).length;
    });
    return { all: DRIVERS.length, byGroup };
  }, []);

  const assignmentCounts = useMemo(() => {
    const allAssignments = getAssignmentsWithDetails();
    const byGroup: Record<string, number> = {};
    VEHICLE_DRIVER_GROUPS.forEach((group) => {
      byGroup[group.id] = allAssignments.filter(
        (a) => a.groupId === group.id
      ).length;
    });
    return { all: allAssignments.length, byGroup };
  }, []);

  // Handle selection change
  const handleSelectionChange = (
    section: GarageSidebarSection,
    groupId: string | null
  ) => {
    setSelectedSection(section);
    setSelectedGroupId(groupId);
    setSearchQuery(''); // Reset search when changing selection
  };

  // Get page title based on selection
  const getPageTitle = () => {
    const groupName =
      selectedGroupId &&
      [...VEHICLE_GROUPS, ...DRIVER_GROUPS, ...VEHICLE_DRIVER_GROUPS].find(
        (g) => g.id === selectedGroupId
      )?.name;

    switch (selectedSection) {
      case 'vehicles':
        return groupName ? `Vehicles - ${groupName}` : 'All Vehicles';
      case 'drivers':
        return groupName ? `Drivers - ${groupName}` : 'All Drivers';
      case 'assignments':
        return groupName ? `Assignments - ${groupName}` : 'All Assignments';
    }
  };

  // Get add button label
  const getAddButtonLabel = () => {
    switch (selectedSection) {
      case 'vehicles':
        return 'Add Vehicle';
      case 'drivers':
        return 'Add Driver';
      case 'assignments':
        return 'Add Assignment';
    }
  };

  // Get section icon
  const getSectionIcon = () => {
    switch (selectedSection) {
      case 'vehicles':
        return <TruckIcon className="w-5 h-5" />;
      case 'drivers':
        return <UsersIcon className="w-5 h-5" />;
      case 'assignments':
        return <LinkIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <GarageSidebar
        vehicleGroups={VEHICLE_GROUPS}
        driverGroups={DRIVER_GROUPS}
        vehicleDriverGroups={VEHICLE_DRIVER_GROUPS}
        vehicleCounts={vehicleCounts}
        driverCounts={driverCounts}
        assignmentCounts={assignmentCounts}
        selectedSection={selectedSection}
        selectedGroupId={selectedGroupId}
        onSelectionChange={handleSelectionChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">{getSectionIcon()}</span>
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-[#3D88C5] hover:bg-[#3478a5]">
                <PlusIcon className="w-4 h-4 mr-2" />
                {getAddButtonLabel()}
              </Button>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={`Search ${selectedSection}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabStatus(tab.id)}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                    tabStatus === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedSection === 'vehicles' && (
            <VehiclesTable
              vehicles={vehicles}
              tabStatus={tabStatus}
              searchQuery={searchQuery}
            />
          )}
          {selectedSection === 'drivers' && (
            <DriversTable
              drivers={drivers}
              tabStatus={tabStatus}
              searchQuery={searchQuery}
            />
          )}
          {selectedSection === 'assignments' && (
            <AssignmentsTable
              assignments={assignments}
              tabStatus={tabStatus}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}
