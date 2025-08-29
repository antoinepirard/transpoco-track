export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  driver?: {
    id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  currentPosition: VehiclePosition;
  lastUpdate: number;
  metadata?: Record<string, unknown>;
}

export interface VehiclePosition {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed: number;
  heading: number;
  accuracy?: number;
  timestamp: number;
  ignition: boolean;
  odometer?: number;
  fuelLevel?: number;
  engineRpm?: number;
  temperature?: number;
}

export interface VehicleTrail {
  vehicleId: string;
  positions: VehiclePosition[];
  startTime: number;
  endTime: number;
  distance: number;
  duration: number;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  coordinates: number[][] | [number, number, number];
  radius?: number;
  organizationId: string;
  isActive: boolean;
  alerts: {
    onEntry: boolean;
    onExit: boolean;
  };
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface VehicleUpdate {
  type: 'position' | 'status' | 'metadata';
  vehicleId: string;
  timestamp: number;
  data: Partial<Vehicle>;
}

export interface WebSocketMessage {
  type: 'vehicle_update' | 'bulk_update' | 'geofence_alert';
  organizationId: string;
  data: VehicleUpdate | VehicleUpdate[] | GeofenceAlert;
}

export interface GeofenceAlert {
  id: string;
  vehicleId: string;
  geofenceId: string;
  type: 'entry' | 'exit';
  timestamp: number;
  position: VehiclePosition;
}

export interface FleetStats {
  totalVehicles: number;
  activeVehicles: number;
  offlineVehicles: number;
  totalDistance: number;
  fuelConsumption: number;
  alerts: number;
}
