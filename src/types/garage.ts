// Vehicle types
export type VehicleType = 'truck' | 'van' | 'car' | 'motorcycle' | 'trailer';
export type VehicleStatus = 'active' | 'archived';
export type FuelType = 'diesel' | 'petrol' | 'electric' | 'hybrid' | 'lpg';
export type LabelColor =
  | 'white_label'
  | 'blue_label'
  | 'green_label'
  | 'red_label'
  | 'yellow_label'
  | 'orange_label';
export type VehicleIcon =
  | 'stairs'
  | 'electric_tractor'
  | 'truck'
  | 'van'
  | 'car'
  | 'motorcycle';

export interface GarageVehicle {
  id: string;
  // Basic info
  registrationNumber: string;
  description: string; // Was "name"
  secondaryDescription?: string;
  make?: string;
  model?: string;
  fuelType?: FuelType;
  fleetNumber?: string;
  // Mileage & Engine
  mileage?: number; // Was "odometer"
  currentEngineHours?: number;
  initialEngineHours?: number;
  engineType?: string;
  // Identification
  vin?: string;
  cameraSerialNumber?: string;
  // Display & Labeling
  label?: string;
  labelColor?: LabelColor;
  icon?: VehicleIcon;
  // Operational
  canbusEnabled?: boolean;
  whitelistEnabled?: boolean;
  division?: string; // Division/Station
  passengers?: number;
  // Financial
  vehicleValue?: number;
  purchaseCost?: number; // ex VAT
  consumptionTarget?: number;
  // Notes & Media
  notes?: string;
  photo?: string; // URL or base64
  // Legacy fields (keeping for compatibility)
  type?: VehicleType;
  year?: number;
  // Relationships
  status: VehicleStatus;
  groupId?: string;
  assignedDriverId?: string;
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
