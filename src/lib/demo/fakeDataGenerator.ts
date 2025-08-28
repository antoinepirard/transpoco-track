import type { Vehicle, VehiclePosition } from '@/types/fleet';
import { getRandomRoadCoordinate, getNearbyRoadCoordinates, type RoadPoint } from './roadCoordinates';

interface VehicleMovement {
  baseLatitude: number;
  baseLongitude: number;
  angle: number;
  speed: number;
  lastUpdate: Date;
  targetRoad?: RoadPoint;
  nextRoadTargets: RoadPoint[];
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
      const roadCoordinate = getRandomRoadCoordinate();
      const latitude = roadCoordinate.latitude;
      const longitude = roadCoordinate.longitude;
      
      const vehicle: Vehicle = {
        id: `demo-vehicle-${i + 1}`,
        name: `Vehicle ${i + 1}`,
        registrationNumber: `DEMO${String(i + 1).padStart(3, '0')}`,
        type: this.getRandomVehicleType(),
        status: this.getRandomStatus(),
        driver: Math.random() > 0.3 ? {
          id: `driver-${i + 1}`,
          name: `Driver ${i + 1}`
        } : undefined,
        currentPosition: {
          id: `pos-${i + 1}`,
          vehicleId: `demo-vehicle-${i + 1}`,
          latitude,
          longitude,
          speed: this.randomInRange(0, 80),
          heading: this.randomInRange(0, 360),
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

      // Initialize movement pattern
      const nearbyRoads = getNearbyRoadCoordinates(roadCoordinate, 3);
      const targetRoad = nearbyRoads.length > 1 ? nearbyRoads[Math.floor(Math.random() * nearbyRoads.length)] : getRandomRoadCoordinate();
      
      this.movements.set(vehicle.id, {
        baseLatitude: latitude,
        baseLongitude: longitude,
        angle: this.calculateAngleToTarget(latitude, longitude, targetRoad.latitude, targetRoad.longitude),
        speed: this.randomInRange(20, 60),
        lastUpdate: new Date(),
        targetRoad,
        nextRoadTargets: nearbyRoads.slice(0, 5),
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

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private calculateAngleToTarget(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
    const dLng = toLng - fromLng;
    const dLat = toLat - fromLat;
    return Math.atan2(dLng, dLat) * 180 / Math.PI;
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
    const deltaTimeMinutes = 0.5; // Update every 30 seconds

    this.vehicles.forEach((vehicle) => {
      if (vehicle.status !== 'active') return;

      const movement = this.movements.get(vehicle.id);
      if (!movement) return;

      // Check if we're close to target road, if so pick new target
      if (movement.targetRoad) {
        const distanceToTarget = this.calculateDistance(
          vehicle.currentPosition.latitude,
          vehicle.currentPosition.longitude,
          movement.targetRoad.latitude,
          movement.targetRoad.longitude
        );

        // If close to target (within 100m), pick new target
        if (distanceToTarget < 100) {
          const nearbyRoads = getNearbyRoadCoordinates(movement.targetRoad, 2);
          if (nearbyRoads.length > 1) {
            // Don't go back to same road, pick different one
            const availableRoads = nearbyRoads.filter(road => 
              road.latitude !== movement.baseLatitude || road.longitude !== movement.baseLongitude
            );
            movement.targetRoad = availableRoads.length > 0 ? 
              availableRoads[Math.floor(Math.random() * availableRoads.length)] : 
              getRandomRoadCoordinate();
          } else {
            movement.targetRoad = getRandomRoadCoordinate();
          }

          // Update angle to new target
          movement.angle = this.calculateAngleToTarget(
            vehicle.currentPosition.latitude,
            vehicle.currentPosition.longitude,
            movement.targetRoad.latitude,
            movement.targetRoad.longitude
          );
          
          // Update base position
          movement.baseLatitude = vehicle.currentPosition.latitude;
          movement.baseLongitude = vehicle.currentPosition.longitude;
        }
      }

      // Occasionally adjust speed and direction slightly (but stay road-oriented)
      if (Math.random() < 0.05) {
        movement.angle += this.randomInRange(-15, 15); // Smaller angle changes
        movement.speed = this.randomInRange(15, 65);
      }

      // Calculate movement delta toward target
      const speedKmh = movement.speed;
      const speedMs = speedKmh / 3.6; // Convert to m/s
      const distanceM = speedMs * (deltaTimeMinutes * 60); // Distance in meters for this update

      // Convert to degrees (rough approximation)
      const latDelta = (distanceM * Math.cos((movement.angle * Math.PI) / 180)) / 111000; // ~111km per degree lat
      const lngDelta = (distanceM * Math.sin((movement.angle * Math.PI) / 180)) / (111000 * Math.cos((vehicle.currentPosition.latitude * Math.PI) / 180));

      let newLat = vehicle.currentPosition.latitude + latDelta;
      let newLng = vehicle.currentPosition.longitude + lngDelta;

      // Keep within SF bounds (fallback)
      if (newLat > this.SF_BOUNDS.north || newLat < this.SF_BOUNDS.south || 
          newLng > this.SF_BOUNDS.east || newLng < this.SF_BOUNDS.west) {
        // Find new nearby road target instead of bouncing
        movement.targetRoad = getRandomRoadCoordinate();
        movement.angle = this.calculateAngleToTarget(
          vehicle.currentPosition.latitude,
          vehicle.currentPosition.longitude,
          movement.targetRoad.latitude,
          movement.targetRoad.longitude
        );
        return; // Skip this update, recalculate next time
      }

      // Update vehicle position
      const newPosition: VehiclePosition = {
        ...vehicle.currentPosition,
        id: `pos-${vehicle.id}-${Date.now()}`,
        latitude: newLat,
        longitude: newLng,
        speed: speedKmh + this.randomInRange(-5, 5), // Add some variation
        heading: movement.angle,
        timestamp: now,
        ignition: vehicle.status === 'active',
        fuelLevel: Math.max(0, (vehicle.currentPosition.fuelLevel || 50) - 0.1),
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