import type { Vehicle, VehiclePosition } from '@/types/fleet';


class FakeDataGenerator {
  private vehicles: Vehicle[] = [];
  private trails: Map<string, VehiclePosition[]> = new Map();
  private callbacks: Set<(vehicles: Vehicle[]) => void> = new Set();
  private trailCallbacks: Set<
    (vehicleId: string, positions: VehiclePosition[]) => void
  > = new Set();

  // Ireland area bounds (covering entire island)
  private readonly IRELAND_BOUNDS = {
    north: 55.5, // Malin Head, Donegal
    south: 51.4, // Mizen Head, Cork
    east: -5.4, // Wicklow Head
    west: -10.7, // Dingle Peninsula, Kerry
  };

  constructor() {
    this.generateVehicles(200);
  }


  private generateVehicles(count: number): void {
    this.vehicles = [];
    this.trails.clear();

    for (let i = 0; i < count; i++) {
      // Generate random coordinates within Ireland bounds
      const latitude = this.randomInRange(
        this.IRELAND_BOUNDS.south,
        this.IRELAND_BOUNDS.north
      );
      const longitude = this.randomInRange(
        this.IRELAND_BOUNDS.west,
        this.IRELAND_BOUNDS.east
      );

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
          latitude,
          longitude,
          speed: Math.max(0, currentSpeed),
          heading: this.randomInRange(0, 360),
          timestamp: Date.now(),
          ignition: Math.random() > 0.1,
          accuracy: this.randomInRange(1, 5),
          odometer: this.randomInRange(10000, 200000),
          fuelLevel: this.randomInRange(10, 100),
          engineRpm: this.randomInRange(800, 3000),
          temperature: this.randomInRange(80, 105),
        },
        lastUpdate: Date.now(),
      };

      this.vehicles.push(vehicle);

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



  public start(): void {
    // Just provide initial callback with static vehicles
    this.callbacks.forEach((callback) => {
      callback([...this.vehicles]);
    });
  }

  public stop(): void {
    // No-op since vehicles are static
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

}

export const fakeDataGenerator = new FakeDataGenerator();
