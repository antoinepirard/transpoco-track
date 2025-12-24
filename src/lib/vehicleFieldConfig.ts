import type { FuelType, LabelColor, VehicleIcon } from '@/types/garage';

// Field types for the vehicle detail drawer
export type VehicleFieldTab = 'basic' | 'technical' | 'display' | 'financial';
export type VehicleFieldType = 'text' | 'number' | 'select' | 'checkbox' | 'readonly';

export interface VehicleFieldOption {
  value: string;
  label: string;
}

export interface VehicleFieldConfig {
  id: string;
  label: string;
  tab: VehicleFieldTab;
  type: VehicleFieldType;
  required?: boolean; // Cannot be hidden
  visible: boolean;
  order: number;
  options?: VehicleFieldOption[];
  placeholder?: string;
}

export interface VehicleDrawerFieldConfig {
  version: number;
  fields: VehicleFieldConfig[];
}

// Dropdown options
export const FUEL_TYPE_OPTIONS: VehicleFieldOption[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' },
];

export const LABEL_COLOR_OPTIONS: VehicleFieldOption[] = [
  { value: 'white_label', label: 'White' },
  { value: 'blue_label', label: 'Blue' },
  { value: 'green_label', label: 'Green' },
  { value: 'red_label', label: 'Red' },
  { value: 'yellow_label', label: 'Yellow' },
  { value: 'orange_label', label: 'Orange' },
];

export const VEHICLE_ICON_OPTIONS: VehicleFieldOption[] = [
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'stairs', label: 'Stairs' },
  { value: 'electric_tractor', label: 'Electric Tractor' },
];

// Default field configuration
export const DEFAULT_VEHICLE_FIELDS: VehicleFieldConfig[] = [
  // Basic Tab
  {
    id: 'registrationNumber',
    label: 'Registration',
    tab: 'basic',
    type: 'text',
    required: true,
    visible: true,
    order: 0,
  },
  {
    id: 'description',
    label: 'Description',
    tab: 'basic',
    type: 'text',
    required: true,
    visible: true,
    order: 1,
  },
  {
    id: 'fleetNumber',
    label: 'Fleet Number',
    tab: 'basic',
    type: 'text',
    visible: true,
    order: 2,
  },
  {
    id: 'secondaryDescription',
    label: 'Secondary Description',
    tab: 'basic',
    type: 'text',
    visible: true,
    order: 3,
  },
  {
    id: 'make',
    label: 'Make',
    tab: 'basic',
    type: 'text',
    visible: true,
    order: 4,
  },
  {
    id: 'model',
    label: 'Model',
    tab: 'basic',
    type: 'text',
    visible: true,
    order: 5,
  },
  {
    id: 'fuelType',
    label: 'Fuel Type',
    tab: 'basic',
    type: 'select',
    visible: true,
    order: 6,
    options: FUEL_TYPE_OPTIONS,
  },
  {
    id: 'division',
    label: 'Division / Station',
    tab: 'basic',
    type: 'text',
    visible: true,
    order: 7,
  },
  {
    id: 'groupId',
    label: 'Group',
    tab: 'basic',
    type: 'select',
    visible: true,
    order: 8,
  },
  {
    id: 'notes',
    label: 'Notes',
    tab: 'basic',
    type: 'text',
    visible: true,
    order: 9,
  },

  // Technical Tab
  {
    id: 'mileage',
    label: 'Mileage (km)',
    tab: 'technical',
    type: 'number',
    visible: true,
    order: 0,
  },
  {
    id: 'passengers',
    label: 'Passengers',
    tab: 'technical',
    type: 'number',
    visible: true,
    order: 1,
  },
  {
    id: 'vin',
    label: 'VIN',
    tab: 'technical',
    type: 'text',
    visible: true,
    order: 2,
  },
  {
    id: 'trackerId',
    label: 'Tracker ID',
    tab: 'technical',
    type: 'text',
    visible: true,
    order: 3,
    placeholder: 'e.g. TRK-001',
  },
  {
    id: 'currentEngineHours',
    label: 'Current Engine Hours',
    tab: 'technical',
    type: 'number',
    visible: true,
    order: 4,
  },
  {
    id: 'initialEngineHours',
    label: 'Initial Engine Hours',
    tab: 'technical',
    type: 'number',
    visible: true,
    order: 5,
  },
  {
    id: 'engineType',
    label: 'Engine Type',
    tab: 'technical',
    type: 'text',
    visible: true,
    order: 6,
  },
  {
    id: 'cameraSerialNumber',
    label: 'Camera Serial Number',
    tab: 'technical',
    type: 'text',
    visible: true,
    order: 7,
  },
  {
    id: 'canbusEnabled',
    label: 'CANbus Enabled',
    tab: 'technical',
    type: 'checkbox',
    visible: true,
    order: 8,
  },
  {
    id: 'whitelistEnabled',
    label: 'Whitelist Enabled',
    tab: 'technical',
    type: 'checkbox',
    visible: true,
    order: 9,
  },

  // Display Tab
  {
    id: 'label',
    label: 'Label',
    tab: 'display',
    type: 'text',
    visible: true,
    order: 0,
  },
  {
    id: 'labelColor',
    label: 'Label Colour',
    tab: 'display',
    type: 'select',
    visible: true,
    order: 1,
    options: LABEL_COLOR_OPTIONS,
  },
  {
    id: 'icon',
    label: 'Icon',
    tab: 'display',
    type: 'select',
    visible: true,
    order: 2,
    options: VEHICLE_ICON_OPTIONS,
  },
  {
    id: 'assignedDriver',
    label: 'Assigned Driver',
    tab: 'display',
    type: 'readonly',
    visible: true,
    order: 3,
  },
  {
    id: 'createdAt',
    label: 'Created',
    tab: 'display',
    type: 'readonly',
    visible: true,
    order: 4,
  },
  {
    id: 'updatedAt',
    label: 'Last Updated',
    tab: 'display',
    type: 'readonly',
    visible: true,
    order: 5,
  },

  // Financial Tab
  {
    id: 'vehicleValue',
    label: 'Vehicle Value',
    tab: 'financial',
    type: 'number',
    visible: true,
    order: 0,
  },
  {
    id: 'purchaseCost',
    label: 'Purchase Cost (ex VAT)',
    tab: 'financial',
    type: 'number',
    visible: true,
    order: 1,
  },
  {
    id: 'consumptionTarget',
    label: 'Consumption Target',
    tab: 'financial',
    type: 'number',
    visible: true,
    order: 2,
  },
];

export const CURRENT_CONFIG_VERSION = 1;
export const STORAGE_KEY = 'tp:garage:vehicle-field-config';
