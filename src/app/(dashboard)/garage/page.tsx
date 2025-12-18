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
import { GroupDialog } from '@/components/garage/GroupDialog';
import { DeleteGroupDialog } from '@/components/garage/DeleteGroupDialog';
import { AddVehicleDialog } from '@/components/garage/AddVehicleDialog';
import { AddDriverDialog } from '@/components/garage/AddDriverDialog';
import { AddAssignmentDialog } from '@/components/garage/AddAssignmentDialog';
import { VehicleDetailDrawer } from '@/components/garage/VehicleDetailDrawer';
import { DriverDetailDrawer } from '@/components/garage/DriverDetailDrawer';
import { AssignmentDetailDrawer } from '@/components/garage/AssignmentDetailDrawer';
import {
  VEHICLES as INITIAL_VEHICLES,
  DRIVERS as INITIAL_DRIVERS,
  VEHICLE_GROUPS,
  DRIVER_GROUPS,
  VEHICLE_DRIVER_GROUPS,
  getAssignmentsWithDetails,
} from '@/lib/demo/garageData';
import type {
  GarageSidebarSection,
  GarageTabStatus,
  GarageGroup,
  GroupType,
  GarageVehicle,
  GarageDriver,
  VehicleDriverAssignment,
} from '@/types/garage';
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

  // Local state for data (demo - would be API in production)
  const [vehicles, setVehicles] = useState<GarageVehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<GarageDriver[]>(INITIAL_DRIVERS);
  const [assignments, setAssignments] = useState<VehicleDriverAssignment[]>(
    () => getAssignmentsWithDetails()
  );

  // Local state for groups
  const [vehicleGroups, setVehicleGroups] =
    useState<GarageGroup[]>(VEHICLE_GROUPS);
  const [driverGroups, setDriverGroups] =
    useState<GarageGroup[]>(DRIVER_GROUPS);
  const [vehicleDriverGroups, setVehicleDriverGroups] = useState<GarageGroup[]>(
    VEHICLE_DRIVER_GROUPS
  );

  // Group dialog state
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogMode, setGroupDialogMode] = useState<'add' | 'rename'>(
    'add'
  );
  const [groupDialogType, setGroupDialogType] = useState<GroupType>('vehicle');
  const [selectedGroup, setSelectedGroup] = useState<GarageGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Entity dialog states
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [addDriverDialogOpen, setAddDriverDialogOpen] = useState(false);
  const [addAssignmentDialogOpen, setAddAssignmentDialogOpen] = useState(false);

  // Detail drawer states
  const [selectedVehicle, setSelectedVehicle] = useState<GarageVehicle | null>(
    null
  );
  const [selectedDriver, setSelectedDriver] = useState<GarageDriver | null>(
    null
  );
  const [selectedAssignment, setSelectedAssignment] =
    useState<VehicleDriverAssignment | null>(null);
  const [vehicleDrawerOpen, setVehicleDrawerOpen] = useState(false);
  const [driverDrawerOpen, setDriverDrawerOpen] = useState(false);
  const [assignmentDrawerOpen, setAssignmentDrawerOpen] = useState(false);

  // Get all groups combined for lookups
  const allGroups = useMemo(
    () => [...vehicleGroups, ...driverGroups, ...vehicleDriverGroups],
    [vehicleGroups, driverGroups, vehicleDriverGroups]
  );

  // Filter data based on selection
  const filteredVehicles = useMemo(() => {
    if (!selectedGroupId) return vehicles;
    return vehicles.filter((v) => v.groupId === selectedGroupId);
  }, [vehicles, selectedGroupId]);

  const filteredDrivers = useMemo(() => {
    if (!selectedGroupId) return drivers;
    return drivers.filter((d) => d.groupId === selectedGroupId);
  }, [drivers, selectedGroupId]);

  const filteredAssignments = useMemo(() => {
    if (!selectedGroupId) return assignments;
    return assignments.filter((a) => a.groupId === selectedGroupId);
  }, [assignments, selectedGroupId]);

  // Calculate counts for sidebar
  const vehicleCounts = useMemo(() => {
    const byGroup: Record<string, number> = {};
    vehicleGroups.forEach((group) => {
      byGroup[group.id] = vehicles.filter((v) => v.groupId === group.id).length;
    });
    return { all: vehicles.length, byGroup };
  }, [vehicleGroups, vehicles]);

  const driverCounts = useMemo(() => {
    const byGroup: Record<string, number> = {};
    driverGroups.forEach((group) => {
      byGroup[group.id] = drivers.filter((d) => d.groupId === group.id).length;
    });
    return { all: drivers.length, byGroup };
  }, [driverGroups, drivers]);

  const assignmentCounts = useMemo(() => {
    const byGroup: Record<string, number> = {};
    vehicleDriverGroups.forEach((group) => {
      byGroup[group.id] = assignments.filter(
        (a) => a.groupId === group.id
      ).length;
    });
    return { all: assignments.length, byGroup };
  }, [vehicleDriverGroups, assignments]);

  // Handle selection change
  const handleSelectionChange = (
    section: GarageSidebarSection,
    groupId: string | null
  ) => {
    setSelectedSection(section);
    setSelectedGroupId(groupId);
    setSearchQuery('');
  };

  // Handle add button click
  const handleAddButtonClick = () => {
    switch (selectedSection) {
      case 'vehicles':
        setAddVehicleDialogOpen(true);
        break;
      case 'drivers':
        setAddDriverDialogOpen(true);
        break;
      case 'assignments':
        setAddAssignmentDialogOpen(true);
        break;
    }
  };

  // Handle row clicks to open drawers
  const handleVehicleRowClick = (vehicle: GarageVehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleDrawerOpen(true);
  };

  const handleDriverRowClick = (driver: GarageDriver) => {
    setSelectedDriver(driver);
    setDriverDrawerOpen(true);
  };

  const handleAssignmentRowClick = (assignment: VehicleDriverAssignment) => {
    setSelectedAssignment(assignment);
    setAssignmentDrawerOpen(true);
  };

  // Handle add vehicle
  const handleAddVehicle = (
    vehicleData: Omit<GarageVehicle, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const newVehicle: GarageVehicle = {
      ...vehicleData,
      id: `v-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setVehicles((prev) => [newVehicle, ...prev]);
  };

  // Handle add driver
  const handleAddDriver = (
    driverData: Omit<GarageDriver, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const newDriver: GarageDriver = {
      ...driverData,
      id: `d-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setDrivers((prev) => [newDriver, ...prev]);
  };

  // Handle add assignment
  const handleAddAssignment = (
    assignmentData: Omit<
      VehicleDriverAssignment,
      'id' | 'createdAt' | 'updatedAt' | 'vehicle' | 'driver'
    >
  ) => {
    const now = new Date().toISOString();
    const vehicle = vehicles.find((v) => v.id === assignmentData.vehicleId);
    const driver = drivers.find((d) => d.id === assignmentData.driverId);

    const newAssignment: VehicleDriverAssignment = {
      ...assignmentData,
      id: `a-${Date.now()}`,
      vehicle,
      driver,
      createdAt: now,
      updatedAt: now,
    };
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  // Handle save vehicle
  const handleSaveVehicle = (vehicle: GarageVehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? vehicle : v)));
    setSelectedVehicle(vehicle);
  };

  // Handle archive/restore vehicle
  const handleArchiveVehicle = (vehicle: GarageVehicle) => {
    const updated = {
      ...vehicle,
      status: 'archived' as const,
      updatedAt: new Date().toISOString(),
    };
    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? updated : v)));
    setSelectedVehicle(updated);
  };

  const handleRestoreVehicle = (vehicle: GarageVehicle) => {
    const updated = {
      ...vehicle,
      status: 'active' as const,
      updatedAt: new Date().toISOString(),
    };
    setVehicles((prev) => prev.map((v) => (v.id === vehicle.id ? updated : v)));
    setSelectedVehicle(updated);
  };

  // Handle delete vehicle
  const handleDeleteVehicle = (vehicle: GarageVehicle) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    setVehicleDrawerOpen(false);
  };

  // Handle save driver
  const handleSaveDriver = (driver: GarageDriver) => {
    setDrivers((prev) => prev.map((d) => (d.id === driver.id ? driver : d)));
    setSelectedDriver(driver);
  };

  // Handle archive/restore driver
  const handleArchiveDriver = (driver: GarageDriver) => {
    const updated = {
      ...driver,
      status: 'archived' as const,
      updatedAt: new Date().toISOString(),
    };
    setDrivers((prev) => prev.map((d) => (d.id === driver.id ? updated : d)));
    setSelectedDriver(updated);
  };

  const handleRestoreDriver = (driver: GarageDriver) => {
    const updated = {
      ...driver,
      status: 'active' as const,
      updatedAt: new Date().toISOString(),
    };
    setDrivers((prev) => prev.map((d) => (d.id === driver.id ? updated : d)));
    setSelectedDriver(updated);
  };

  // Handle delete driver
  const handleDeleteDriver = (driver: GarageDriver) => {
    setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
    setDriverDrawerOpen(false);
  };

  // Handle save assignment
  const handleSaveAssignment = (assignment: VehicleDriverAssignment) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? assignment : a))
    );
    setSelectedAssignment(assignment);
  };

  // Handle archive/restore assignment
  const handleArchiveAssignment = (assignment: VehicleDriverAssignment) => {
    const updated = {
      ...assignment,
      status: 'archived' as const,
      endDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? updated : a))
    );
    setSelectedAssignment(updated);
  };

  const handleRestoreAssignment = (assignment: VehicleDriverAssignment) => {
    const updated = {
      ...assignment,
      status: 'active' as const,
      endDate: undefined,
      updatedAt: new Date().toISOString(),
    };
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? updated : a))
    );
    setSelectedAssignment(updated);
  };

  // Handle delete assignment
  const handleDeleteAssignment = (assignment: VehicleDriverAssignment) => {
    setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
    setAssignmentDrawerOpen(false);
  };

  // Handle add group
  const handleAddGroup = (type: GroupType) => {
    setGroupDialogMode('add');
    setGroupDialogType(type);
    setSelectedGroup(null);
    setGroupDialogOpen(true);
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

  // Submit group dialog (add or rename)
  const handleGroupSubmit = (name: string, color: string) => {
    const now = new Date().toISOString();

    if (groupDialogMode === 'add') {
      const newGroup: GarageGroup = {
        id: `${groupDialogType}-${Date.now()}`,
        name,
        type: groupDialogType,
        color,
        memberCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      switch (groupDialogType) {
        case 'vehicle':
          setVehicleGroups((prev) => [...prev, newGroup]);
          break;
        case 'driver':
          setDriverGroups((prev) => [...prev, newGroup]);
          break;
        case 'vehicle-driver':
          setVehicleDriverGroups((prev) => [...prev, newGroup]);
          break;
      }
    } else if (groupDialogMode === 'rename' && selectedGroup) {
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

    if (selectedGroupId === selectedGroup.id) {
      setSelectedGroupId(null);
    }
  };

  // Get page title based on selection
  const getPageTitle = () => {
    const groupName =
      selectedGroupId && allGroups.find((g) => g.id === selectedGroupId)?.name;

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
        vehicleGroups={vehicleGroups}
        driverGroups={driverGroups}
        vehicleDriverGroups={vehicleDriverGroups}
        vehicleCounts={vehicleCounts}
        driverCounts={driverCounts}
        assignmentCounts={assignmentCounts}
        selectedSection={selectedSection}
        selectedGroupId={selectedGroupId}
        onSelectionChange={handleSelectionChange}
        onAddGroup={handleAddGroup}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
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
              <Button
                size="sm"
                className="bg-[#3D88C5] hover:bg-[#3478a5]"
                onClick={handleAddButtonClick}
              >
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
              vehicles={filteredVehicles}
              tabStatus={tabStatus}
              searchQuery={searchQuery}
              onRowClick={handleVehicleRowClick}
            />
          )}
          {selectedSection === 'drivers' && (
            <DriversTable
              drivers={filteredDrivers}
              tabStatus={tabStatus}
              searchQuery={searchQuery}
              onRowClick={handleDriverRowClick}
            />
          )}
          {selectedSection === 'assignments' && (
            <AssignmentsTable
              assignments={filteredAssignments}
              tabStatus={tabStatus}
              searchQuery={searchQuery}
              onRowClick={handleAssignmentRowClick}
            />
          )}
        </div>
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

      {/* Add Vehicle Dialog */}
      <AddVehicleDialog
        open={addVehicleDialogOpen}
        onOpenChange={setAddVehicleDialogOpen}
        vehicleGroups={vehicleGroups}
        onSubmit={handleAddVehicle}
      />

      {/* Add Driver Dialog */}
      <AddDriverDialog
        open={addDriverDialogOpen}
        onOpenChange={setAddDriverDialogOpen}
        driverGroups={driverGroups}
        onSubmit={handleAddDriver}
      />

      {/* Add Assignment Dialog */}
      <AddAssignmentDialog
        open={addAssignmentDialogOpen}
        onOpenChange={setAddAssignmentDialogOpen}
        vehicles={vehicles}
        drivers={drivers}
        assignmentGroups={vehicleDriverGroups}
        onSubmit={handleAddAssignment}
      />

      {/* Vehicle Detail Drawer */}
      <VehicleDetailDrawer
        open={vehicleDrawerOpen}
        onOpenChange={setVehicleDrawerOpen}
        vehicle={selectedVehicle}
        vehicleGroups={vehicleGroups}
        onSave={handleSaveVehicle}
        onArchive={handleArchiveVehicle}
        onRestore={handleRestoreVehicle}
        onDelete={handleDeleteVehicle}
      />

      {/* Driver Detail Drawer */}
      <DriverDetailDrawer
        open={driverDrawerOpen}
        onOpenChange={setDriverDrawerOpen}
        driver={selectedDriver}
        driverGroups={driverGroups}
        onSave={handleSaveDriver}
        onArchive={handleArchiveDriver}
        onRestore={handleRestoreDriver}
        onDelete={handleDeleteDriver}
      />

      {/* Assignment Detail Drawer */}
      <AssignmentDetailDrawer
        open={assignmentDrawerOpen}
        onOpenChange={setAssignmentDrawerOpen}
        assignment={selectedAssignment}
        vehicles={vehicles}
        drivers={drivers}
        assignmentGroups={vehicleDriverGroups}
        onSave={handleSaveAssignment}
        onArchive={handleArchiveAssignment}
        onRestore={handleRestoreAssignment}
        onDelete={handleDeleteAssignment}
      />
    </div>
  );
}
