import type { Vehicle, VehiclePosition } from '@/types/fleet';
import { getRandomRoadCoordinate, getNearbyRoadCoordinates, type RoadPoint } from './roadCoordinates';
import { 
  snapToNearestRoad, 
  moveAlongRoad, 
  getRandomRoadSegment, 
  getSpeedForRoadType,
  type SegmentPosition 
} from '../geo/roadNetwork';

interface VehicleMovement {
  segmentPosition: SegmentPosition;
  speed: number;
  lastUpdate: Date;
  baseSpeed: number; // Base speed for this vehicle type
}

class FakeDataGenerator {
  private vehicles: Vehicle[] = [];
  private movements: Map<string, VehicleMovement> = new Map();
  private trails: Map<string, VehiclePosition[]> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private callbacks: Set<(vehicles: Vehicle[]) => void> = new Set();
  private trailCallbacks: Set<(vehicleId: string, positions: VehiclePosition[]) => void> = new Set();

  // San Francisco area bounds
  private readonly SF_BOUNDS = {
    north: 37.8199,
    south: 37.7049,
    east: -122.3549,
    west: -122.5349,
  };

  constructor() {
    this.generateVehicles(200);
  }

  private generateVehicles(count: number): void {
    this.vehicles = [];
    this.movements.clear();
    this.trails.clear();

    for (let i = 0; i < count; i++) {
      // Start vehicles on road segments
      const segmentPosition = getRandomRoadSegment();
      
      const vehicleType = this.getRandomVehicleType();
      const baseSpeed = this.getBaseSpeedForVehicleType(vehicleType);
      const currentSpeed = baseSpeed + this.randomInRange(-10, 15);
      
      const vehicle: Vehicle = {
        id: `demo-vehicle-${i + 1}`,
        name: `Vehicle ${i + 1}`,
        registrationNumber: `DEMO${String(i + 1).padStart(3, '0')}`,
        type: vehicleType,
        status: this.getRandomStatus(),
        driver: Math.random() > 0.3 ? {
          id: `driver-${i + 1}`,
          name: `Driver ${i + 1}`
        } : undefined,
        currentPosition: {
          id: `pos-${i + 1}`,
          vehicleId: `demo-vehicle-${i + 1}`,
          latitude: segmentPosition.position.latitude,
          longitude: segmentPosition.position.longitude,
          speed: Math.max(0, currentSpeed),
          heading: segmentPosition.heading,
          timestamp: new Date(),
          ignition: Math.random() > 0.1,
          accuracy: this.randomInRange(1, 5),
          odometer: this.randomInRange(10000, 200000),
          fuelLevel: this.randomInRange(10, 100),
          engineRpm: this.randomInRange(800, 3000),
          temperature: this.randomInRange(80, 105),
        },
        lastUpdate: new Date(),
      };

      this.vehicles.push(vehicle);

      // Initialize movement with road-based navigation
      this.movements.set(vehicle.id, {
        segmentPosition,
        speed: currentSpeed,
        lastUpdate: new Date(),
        baseSpeed,
      });

      // Initialize trail
      this.trails.set(vehicle.id, [vehicle.currentPosition]);
    }
  }

  private getRandomVehicleType(): Vehicle['type'] {
    const types: Vehicle['type'][] = ['truck', 'van', 'car', 'motorcycle'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomStatus(): Vehicle['status'] {
    const statuses: Vehicle['status'][] = ['active', 'active', 'active', 'inactive', 'offline'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getBaseSpeedForVehicleType(type: Vehicle['type']): number {
    switch (type) {
      case 'motorcycle': return 40;
      case 'car': return 35;
      case 'van': return 30;
      case 'truck': return 25;
      default: return 30;
    }
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private updateVehiclePositions(): void {
    const now = new Date();
    const deltaTimeSeconds = 2; // Update every 2 seconds

    this.vehicles.forEach((vehicle) => {
      if (vehicle.status !== 'active') return;

      const movement = this.movements.get(vehicle.id);
      if (!movement) return;

      // Occasionally adjust speed (simulate traffic conditions)
      if (Math.random() < 0.1) {
        const variation = this.randomInRange(-8, 12);
        movement.speed = Math.max(5, Math.min(movement.baseSpeed + variation, movement.baseSpeed + 20));
      }

      // Calculate distance to move in this update
      const speedKmh = movement.speed;
      const speedMs = speedKmh / 3.6; // Convert to m/s
      const distanceM = speedMs * deltaTimeSeconds; // Distance in meters for this update

      // Move along road network
      const newSegmentPosition = moveAlongRoad(
        movement.segmentPosition,
        distanceM,
        movement.segmentPosition.heading // Use current heading as preferred bearing
      );

      // Update movement state
      movement.segmentPosition = newSegmentPosition;
      movement.lastUpdate = now;

      // Create new vehicle position
      const newPosition: VehiclePosition = {
        ...vehicle.currentPosition,
        id: `pos-${vehicle.id}-${Date.now()}`,
        latitude: newSegmentPosition.position.latitude,
        longitude: newSegmentPosition.position.longitude,
        speed: speedKmh + this.randomInRange(-2, 3), // Small speed variation for realism
        heading: newSegmentPosition.heading,
        timestamp: now,
        ignition: vehicle.status === 'active',
        fuelLevel: Math.max(0, (vehicle.currentPosition.fuelLevel || 50) - 0.05),
        engineRpm: this.randomInRange(1000, 2500),
        temperature: this.randomInRange(85, 100),
      };

      vehicle.currentPosition = newPosition;
      vehicle.lastUpdate = now;

      // Add to trail
      const trail = this.trails.get(vehicle.id) || [];
      trail.push(newPosition);
      
      // Keep only last 100 positions for performance
      if (trail.length > 100) {
        trail.shift();
      }
      this.trails.set(vehicle.id, trail);

      // Notify trail callbacks
      this.trailCallbacks.forEach(callback => {
        callback(vehicle.id, [newPosition]);
      });
    });

    // Notify callbacks with updated vehicles
    this.callbacks.forEach(callback => {
      callback([...this.vehicles]);
    });
  }

  public start(): void {
    if (this.updateInterval) return;

    // Initial callback
    this.callbacks.forEach(callback => {
      callback([...this.vehicles]);
    });

    // Start regular updates
    this.updateInterval = setInterval(() => {
      this.updateVehiclePositions();
    }, 2000); // Update every 2 seconds
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public onVehicleUpdate(callback: (vehicles: Vehicle[]) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  public onTrailUpdate(callback: (vehicleId: string, positions: VehiclePosition[]) => void): () => void {
    this.trailCallbacks.add(callback);
    return () => {
      this.trailCallbacks.delete(callback);
    };
  }

  public getVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  public getTrails(): Record<string, VehiclePosition[]> {
    const trails: Record<string, VehiclePosition[]> = {};
    this.trails.forEach((positions, vehicleId) => {
      trails[vehicleId] = [...positions];
    });
    return trails;
  }
}

export const fakeDataGenerator = new FakeDataGenerator();