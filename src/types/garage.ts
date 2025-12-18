// Vehicle types
export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle' | 'trailer';
export type VehicleStatus = 'active' | 'archived';
export type FuelType = 'diesel' | 'petrol' | 'electric' | 'hybrid' | 'lpg';

export interface GarageVehicle {
  id: string;
  name: string;
  registrationNumber: string;
  type: VehicleType;
  make?: string;
  model?: string;
  year?: number;
  fuelType?: FuelType;
  vin?: string;
  status: VehicleStatus;
  groupId?: string;
  assignedDriverId?: string;
  odometer?: number;
  createdAt: string;
  updatedAt: string;
}

// Driver types
export type DriverStatus = 'active' | 'archived';

export interface GarageDriver {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  status: DriverStatus;
  groupId?: string;
  assignedVehicleId?: string;
  createdAt: string;
  updatedAt: string;
}

// Group types
export type GroupType = 'vehicle' | 'driver' | 'vehicle-driver';

export interface GarageGroup {
  id: string;
  name: string;
  type: GroupType;
  description?: string;
  color?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

// Assignment types (vehicle-driver assignments)
export type AssignmentStatus = 'active' | 'archived';

export interface VehicleDriverAssignment {
  id: string;
  vehicleId: string;
  driverId: string;
  vehicle?: GarageVehicle;
  driver?: GarageDriver;
  groupId?: string;
  startDate: string;
  endDate?: string;
  status: AssignmentStatus;
  isPrimary: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sidebar selection types
export type GarageSidebarSection = 'vehicles' | 'drivers' | 'assignments';

export interface GarageSidebarSelection {
  section: GarageSidebarSection;
  groupId: string | null; // null means "All"
}

// Tab types for Active/Archived views
export type GarageTabStatus = 'active' | 'archived';

// Dashboard summary
export interface GarageSummary {
  totalVehicles: number;
  activeVehicles: number;
  archivedVehicles: number;
  totalDrivers: number;
  activeDrivers: number;
  archivedDrivers: number;
  totalAssignments: number;
  activeAssignments: number;
  archivedAssignments: number;
  vehicleGroups: number;
  driverGroups: number;
  vehicleDriverGroups: number;
}
