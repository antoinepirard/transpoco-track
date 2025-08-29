import type { Vehicle, VehiclePosition } from '@/types/fleet';
import {
  moveAlongRoad,
  getRandomRoadSegment,
  type SegmentPosition,
} from '../geo/roadNetwork';
import { getRoutingService } from '../routing';

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
  private trailCallbacks: Set<
    (vehicleId: string, positions: VehiclePosition[]) => void
  > = new Set();
  private positionUpdateCallbacks: Set<
    (
      vehicleId: string,
      latitude: number,
      longitude: number,
      heading: number
    ) => Promise<void>
  > = new Set();
  private routingService = getRoutingService();
  private useRoadSnapping = true; // Enable Mapbox road snapping for demo vehicles

  // Ireland area bounds (covering entire island)
  private readonly IRELAND_BOUNDS = {
    north: 55.5,  // Malin Head, Donegal
    south: 51.4,  // Mizen Head, Cork  
    east: -5.4,   // Wicklow Head
    west: -10.7,  // Dingle Peninsula, Kerry
  };

  constructor() {
    this.generateVehicles(200);
    // Initialize road snapping after construction (async, non-blocking)
    setTimeout(() => {
      this.initializeRoadSnapping().catch((error) => {
        console.debug('Demo road snapping initialization failed:', error);
      });
    }, 100);
  }

  private async initializeRoadSnapping(): Promise<void> {
    if (!this.useRoadSnapping) return;

    try {
      // Snap all existing vehicles to Mapbox roads
      for (const vehicle of this.vehicles) {
        const snapResult = await this.routingService.snapToRoad(
          vehicle.currentPosition.latitude,
          vehicle.currentPosition.longitude,
          { radiusMeters: 100 }
        );

        if (snapResult.confidence && snapResult.confidence > 0.25 && snapResult.distance < 200) {
          // snapResult.location is [longitude, latitude] from Mapbox format
          vehicle.currentPosition.latitude = snapResult.location[1]; // latitude is at index 1
          vehicle.currentPosition.longitude = snapResult.location[0]; // longitude is at index 0
          vehicle.currentPosition.heading =
            snapResult.heading || vehicle.currentPosition.heading;
        }
      }

      // Notify callbacks with road-snapped vehicles
      this.callbacks.forEach((callback) => {
        callback([...this.vehicles]);
      });
    } catch (error) {
      console.debug(
        'Failed to initialize road snapping for demo vehicles, using local network:',
        error
      );
    }
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
        id: `transpoco-${i + 1}`,
        name: `${this.getVehicleNamePrefix(vehicleType)} ${i + 1}`,
        registrationNumber: this.generateIrishRegistration(),
        type: vehicleType,
        status: this.getRandomStatus(),
        driver:
          Math.random() > 0.3
            ? {
                id: `driver-${i + 1}`,
                name: this.generateIrishDriverName(),
              }
            : undefined,
        currentPosition: {
          id: `pos-${i + 1}`,
          vehicleId: `transpoco-${i + 1}`,
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
    const statuses: Vehicle['status'][] = [
      'active',
      'active',
      'active',
      'inactive',
      'offline',
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getBaseSpeedForVehicleType(type: Vehicle['type']): number {
    switch (type) {
      case 'motorcycle':
        return 40;
      case 'car':
        return 35;
      case 'van':
        return 30;
      case 'truck':
        return 25;
      default:
        return 30;
    }
  }

  private getVehicleNamePrefix(type: Vehicle['type']): string {
    switch (type) {
      case 'truck':
        return 'Delivery Truck';
      case 'van':
        return 'Service Van';
      case 'car':
        return 'Company Car';
      case 'motorcycle':
        return 'Courier Bike';
      default:
        return 'Fleet Vehicle';
    }
  }

  private generateIrishRegistration(): string {
    // Irish registration format: YY-C-NNNN (e.g., 23-D-1234)
    const year = Math.floor(Math.random() * 10) + 14; // 14-23 (2014-2023)
    const counties = [
      'D',
      'C',
      'CE',
      'CN',
      'CW',
      'DL',
      'G',
      'KE',
      'KK',
      'KY',
      'LD',
      'LH',
      'LM',
      'LS',
      'MH',
      'MN',
      'MO',
      'OY',
      'RN',
      'SO',
      'T',
      'W',
      'WH',
      'WW',
      'WX',
    ];
    const county = counties[Math.floor(Math.random() * counties.length)];
    const number = Math.floor(Math.random() * 9999) + 1;

    return `${year}-${county}-${number.toString().padStart(4, '0')}`;
  }

  private generateIrishDriverName(): string {
    const firstNames = [
      'Liam',
      'Emma',
      'Noah',
      'Olivia',
      'Sean',
      'Aoife',
      'Conor',
      'Saoirse',
      'Cian',
      'Niamh',
      'Oisin',
      'Caoimhe',
      'Fionn',
      'Róisín',
      'Darragh',
      'Clodagh',
      'Tadhg',
      'Aisling',
      'Cillian',
      'Siobhan',
    ];
    const lastNames = [
      'Murphy',
      'Kelly',
      'Sullivan',
      'Walsh',
      'Smith',
      'Brien',
      'Byrne',
      'Ryan',
      'Connor',
      'Reilly',
      'Doyle',
      'McCarthy',
      'Gallagher',
      'Doherty',
      'Kennedy',
      'Lynch',
      'Murray',
      'Quinn',
      'Moore',
      'McLoughlin',
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const x = Math.sin(Δλ) * Math.cos(φ2);
    const y =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(x, y);
    return ((θ * 180) / Math.PI + 360) % 360; // Convert to degrees and normalize
  }

  private async updateVehiclePositions(): Promise<void> {
    const now = new Date();
    const deltaTimeSeconds = 2; // Update every 2 seconds

    // Process all vehicles but avoid overwhelming API with concurrent requests
    const activeVehicles = this.vehicles.filter((v) => v.status === 'active');

    if (activeVehicles.length === 0) {
      console.debug('No active vehicles to update');
      return;
    }

    // Process vehicles in smaller batches to avoid rate limiting
    const batchSize = this.useRoadSnapping ? 5 : 15; // Smaller batches when using API
    let updatedCount = 0;

    for (let i = 0; i < activeVehicles.length; i += batchSize) {
      const batch = activeVehicles.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (vehicle) => {
          const movement = this.movements.get(vehicle.id);
          if (!movement) return;

          try {
            // Occasionally adjust speed (simulate traffic conditions)
            if (Math.random() < 0.1) {
              const variation = this.randomInRange(-8, 12);
              movement.speed = Math.max(
                5,
                Math.min(movement.baseSpeed + variation, movement.baseSpeed + 20)
              );
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

            // Calculate base position using local road network for realistic movement
            const finalLatitude = newSegmentPosition.position.latitude;
            const finalLongitude = newSegmentPosition.position.longitude;
            const finalHeading = newSegmentPosition.heading;

            // Validate coordinates before proceeding
            if (
              !this.isValidCoordinates(finalLatitude, finalLongitude)
            ) {
              console.warn(`Generated invalid coordinates for vehicle ${vehicle.id}:`, {
                latitude: finalLatitude,
                longitude: finalLongitude,
              });
              return;
            }

            // Use the store's road snapping pipeline instead of direct assignment
            if (this.positionUpdateCallbacks.size > 0) {
              // Emit position update through road snapping pipeline
              for (const callback of this.positionUpdateCallbacks) {
                try {
                  await callback(
                    vehicle.id,
                    finalLatitude,
                    finalLongitude,
                    finalHeading
                  );
                  updatedCount++;
                } catch (error) {
                  console.warn(`Road snapping failed for vehicle ${vehicle.id}:`, error);
                  // Continue with fallback below
                }
              }
            } else {
              // Fallback to direct assignment if no position update callbacks
              const newPosition: VehiclePosition = {
                ...vehicle.currentPosition,
                id: `pos-${vehicle.id}-${Date.now()}`,
                latitude: finalLatitude,
                longitude: finalLongitude,
                speed: speedKmh + this.randomInRange(-2, 3), // Small speed variation for realism
                heading: finalHeading,
                timestamp: now,
                ignition: vehicle.status === 'active',
                fuelLevel: Math.max(
                  0,
                  (vehicle.currentPosition.fuelLevel || 50) - 0.05
                ),
                engineRpm: this.randomInRange(1000, 2500),
                temperature: this.randomInRange(85, 100),
              };

              vehicle.currentPosition = newPosition;
              vehicle.lastUpdate = now;
              updatedCount++;

              // Add to trail
              const trail = this.trails.get(vehicle.id) || [];
              trail.push(newPosition);

              // Keep only last 100 positions for performance
              if (trail.length > 100) {
                trail.shift();
              }
              this.trails.set(vehicle.id, trail);

              // Notify trail callbacks
              this.trailCallbacks.forEach((callback) => {
                callback(vehicle.id, [newPosition]);
              });
            }
          } catch (error) {
            console.warn(`Failed to update vehicle ${vehicle.id}:`, error);
          }
        })
      );

      // Log batch processing results in development
      if (process.env.NODE_ENV === 'development') {
        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        if (failed > 0) {
          console.debug(`Batch ${Math.floor(i / batchSize) + 1}: ${successful} successful, ${failed} failed`);
        }
      }

      // Add delay between batches to prevent overwhelming the API
      if (this.useRoadSnapping && i + batchSize < activeVehicles.length) {
        await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay between batches
      }
    }

    // Only notify bulk callbacks if we're not using position update pipeline
    if (this.positionUpdateCallbacks.size === 0) {
      this.callbacks.forEach((callback) => {
        callback([...this.vehicles]);
      });
    }

    if (process.env.NODE_ENV === 'development' && updatedCount > 0) {
      console.debug(`Updated ${updatedCount}/${activeVehicles.length} vehicles`);
    }
  }

  public start(): void {
    if (this.updateInterval) return;

    // Initial callback
    this.callbacks.forEach((callback) => {
      callback([...this.vehicles]);
    });

    // Start regular updates
    this.updateInterval = setInterval(() => {
      this.updateVehiclePositions().catch((error) => {
        console.warn('Demo vehicle update failed:', error);
      });
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

  public onTrailUpdate(
    callback: (vehicleId: string, positions: VehiclePosition[]) => void
  ): () => void {
    this.trailCallbacks.add(callback);
    return () => {
      this.trailCallbacks.delete(callback);
    };
  }

  public onPositionUpdate(
    callback: (
      vehicleId: string,
      latitude: number,
      longitude: number,
      heading: number
    ) => Promise<void>
  ): () => void {
    this.positionUpdateCallbacks.add(callback);
    return () => {
      this.positionUpdateCallbacks.delete(callback);
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

  /**
   * Enable or disable road snapping for demo vehicles
   */
  public setRoadSnapping(enabled: boolean): void {
    this.useRoadSnapping = enabled;
    console.log(`Demo road snapping ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if road snapping is enabled
   */
  public isRoadSnappingEnabled(): boolean {
    return this.useRoadSnapping;
  }

  /**
   * Validate coordinates
   */
  private isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= this.IRELAND_BOUNDS.south &&
      latitude <= this.IRELAND_BOUNDS.north &&
      longitude >= this.IRELAND_BOUNDS.west &&
      longitude <= this.IRELAND_BOUNDS.east
    );
  }

  /**
   * Manually snap all current vehicles to roads (useful for testing)
   */
  public async snapAllVehiclesToRoads(): Promise<void> {
    if (!this.useRoadSnapping) return;

    try {
      for (const vehicle of this.vehicles) {
        const snapResult = await this.routingService.snapToRoad(
          vehicle.currentPosition.latitude,
          vehicle.currentPosition.longitude,
          { radiusMeters: 100 }
        );

        if (snapResult.confidence && snapResult.confidence > 0.25 && snapResult.distance < 200) {
          // snapResult.location is [longitude, latitude] from Mapbox format
          vehicle.currentPosition.latitude = snapResult.location[1]; // latitude is at index 1
          vehicle.currentPosition.longitude = snapResult.location[0]; // longitude is at index 0
          vehicle.currentPosition.heading =
            snapResult.heading || vehicle.currentPosition.heading;
        }
      }

      // Notify callbacks
      this.callbacks.forEach((callback) => {
        callback([...this.vehicles]);
      });
    } catch (error) {
      console.warn('Failed to snap vehicles to roads:', error);
    }
  }
}

export const fakeDataGenerator = new FakeDataGenerator();
