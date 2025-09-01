import type { Vehicle, VehiclePosition } from '@/types/fleet';


class FakeDataGenerator {
  private vehicles: Vehicle[] = [];
  private trails: Map<string, VehiclePosition[]> = new Map();
  private callbacks: Set<(vehicles: Vehicle[]) => void> = new Set();
  private trailCallbacks: Set<
    (vehicleId: string, positions: VehiclePosition[]) => void
  > = new Set();

  // Curated list of realistic road coordinates across Ireland
  private readonly ROAD_COORDINATES: Array<{lat: number; lng: number; city: string}> = [
    // Dublin and surrounding areas
    { lat: 53.3498, lng: -6.2603, city: 'Dublin City Center' },
    { lat: 53.3441, lng: -6.2675, city: 'Dublin Temple Bar' },
    { lat: 53.3006, lng: -6.2397, city: 'Dublin South' },
    { lat: 53.3731, lng: -6.2741, city: 'Dublin North' },
    { lat: 53.3328, lng: -6.2436, city: 'Dublin Docklands' },
    { lat: 53.2859, lng: -6.1903, city: 'Dublin Blackrock' },
    { lat: 53.4129, lng: -6.2439, city: 'Dublin Airport' },
    { lat: 53.3584, lng: -6.1098, city: 'Dublin Howth' },
    
    // Cork and surrounding areas
    { lat: 51.8985, lng: -8.4756, city: 'Cork City Center' },
    { lat: 51.9023, lng: -8.4681, city: 'Cork North' },
    { lat: 51.8916, lng: -8.4913, city: 'Cork West' },
    { lat: 51.8847, lng: -8.4294, city: 'Cork East' },
    { lat: 51.8474, lng: -8.2949, city: 'Cork Midleton' },
    
    // Galway and surrounding areas
    { lat: 53.2707, lng: -9.0568, city: 'Galway City' },
    { lat: 53.2794, lng: -9.0492, city: 'Galway Salthill' },
    { lat: 53.2838, lng: -9.0731, city: 'Galway West' },
    { lat: 53.2629, lng: -9.0343, city: 'Galway East' },
    
    // Limerick and surrounding areas
    { lat: 52.6638, lng: -8.6267, city: 'Limerick City' },
    { lat: 52.6754, lng: -8.6494, city: 'Limerick North' },
    { lat: 52.6483, lng: -8.6024, city: 'Limerick South' },
    
    // Waterford and surrounding areas
    { lat: 52.2593, lng: -7.1101, city: 'Waterford City' },
    { lat: 52.2681, lng: -7.1284, city: 'Waterford North' },
    { lat: 52.2436, lng: -7.0894, city: 'Waterford East' },
    
    // Northern Ireland / Border areas
    { lat: 54.5973, lng: -5.9301, city: 'Belfast' },
    { lat: 54.9966, lng: -7.3086, city: 'Derry/Londonderry' },
    { lat: 54.3495, lng: -6.6651, city: 'Newry' },
    
    // Major towns and regional centers
    { lat: 54.2766, lng: -8.4761, city: 'Sligo' },
    { lat: 52.3369, lng: -6.4633, city: 'Wexford' },
    { lat: 52.6541, lng: -7.2448, city: 'Kilkenny' },
    { lat: 53.4239, lng: -7.9407, city: 'Athlone' },
    { lat: 52.2806, lng: -8.9518, city: 'Tralee' },
    { lat: 51.9461, lng: -10.2417, city: 'Killarney' },
    { lat: 53.8543, lng: -6.3503, city: 'Drogheda' },
    { lat: 53.6172, lng: -6.7032, city: 'Navan' },
    { lat: 52.8454, lng: -6.9088, city: 'Portlaoise' },
    { lat: 53.0917, lng: -7.6307, city: 'Tullamore' },
    { lat: 52.9677, lng: -9.4274, city: 'Ennis' },
    { lat: 53.7606, lng: -7.3364, city: 'Cavan' },
    { lat: 54.8433, lng: -7.6921, city: 'Letterkenny' },
    { lat: 54.0394, lng: -6.7711, city: 'Monaghan' },
    { lat: 53.3707, lng: -6.5400, city: 'Lucan' },
    { lat: 53.3498, lng: -6.2603, city: 'Dublin M50 South' },
    
    // Major motorway points
    { lat: 53.2176, lng: -6.4527, city: 'M7 Naas' },
    { lat: 53.4668, lng: -6.3734, city: 'M1 Swords' },
    { lat: 53.3864, lng: -6.5983, city: 'M4 Lucan' },
    { lat: 52.4940, lng: -7.8731, city: 'M8 Cashel' },
    { lat: 53.0342, lng: -6.4006, city: 'M11 Wicklow' },
    { lat: 52.7369, lng: -8.9204, city: 'M18 Shannon' },
    
    // Coastal towns
    { lat: 51.7012, lng: -8.4957, city: 'Kinsale' },
    { lat: 52.1601, lng: -10.2679, city: 'Dingle' },
    { lat: 53.8074, lng: -9.1316, city: 'Westport' },
    { lat: 55.2057, lng: -8.2781, city: 'Donegal Town' },
    { lat: 51.5517, lng: -9.5052, city: 'Bantry' },
  ];

  constructor() {
    this.generateVehicles(200);
  }


  private generateVehicles(count: number): void {
    this.vehicles = [];
    this.trails.clear();

    for (let i = 0; i < count; i++) {
      // Select a random road coordinate from our curated list
      const baseCoord = this.ROAD_COORDINATES[
        Math.floor(Math.random() * this.ROAD_COORDINATES.length)
      ];
      
      // Add small variation to spread vehicles around the base coordinate (stay on nearby roads)
      const latitude = baseCoord.lat + this.randomInRange(-0.005, 0.005);
      const longitude = baseCoord.lng + this.randomInRange(-0.008, 0.008);

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
   * Validate coordinates - now checks if coordinates are reasonable for Ireland
   */
  private isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= 51.0 && // Southern tip of Ireland
      latitude <= 55.5 && // Northern tip of Ireland  
      longitude >= -11.0 && // Western edge of Ireland
      longitude <= -5.0 // Eastern edge of Ireland
    );
  }

}

export const fakeDataGenerator = new FakeDataGenerator();
