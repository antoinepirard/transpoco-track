import type { SpeedingData, SeverityBreakdown } from '@/types/speeding';

/**
 * Generates realistic mock speeding data for vehicles and drivers
 */
class SpeedingDataGenerator {
  private vehicleNames = [
    'My vehicle - Piotr',
    '251LH2065',
    '868324023423390',
    '212D28564',
    'Private Mode',
    '353691845095826',
    'nosim350317175704',
    'VOK_TestPolo',
    '865733025630757',
    'Bhartendu',
    'Cork Van 12',
    'Dublin Truck 7',
    'Galway Car 3',
    'Limerick Van 5',
    'Waterford Truck 2',
  ];

  private driverNames = [
    'Liam Murphy',
    'Emma Kelly',
    'Sean Sullivan',
    'Aoife Walsh',
    'Conor Brien',
    'Niamh Byrne',
    'Cian Ryan',
    'Saoirse Connor',
    'Fionn Doyle',
    'Clodagh McCarthy',
    'Tadhg Gallagher',
    'Aisling Kennedy',
    'Darragh Lynch',
    'Róisín Quinn',
    'Oisin Moore',
  ];

  /**
   * Generate speeding data for vehicles
   */
  generateVehicleSpeedingData(count?: number): SpeedingData[] {
    const vehicleCount = Math.min(count || this.vehicleNames.length, this.vehicleNames.length);
    const data: SpeedingData[] = [];

    for (let i = 0; i < vehicleCount; i++) {
      const totalUpdates = this.randomInt(5000, 15000);
      const speedingProfile = this.getSpeedingProfile(i, vehicleCount);

      const severityBreakdown: SeverityBreakdown = {
        mild: speedingProfile.mild,
        moderate: speedingProfile.moderate,
        severe: speedingProfile.severe,
      };

      const speedingPercentage = severityBreakdown.mild + severityBreakdown.moderate + severityBreakdown.severe;
      const speedingUpdates = Math.round((totalUpdates * speedingPercentage) / 100);

      data.push({
        id: `vehicle-${i + 1}`,
        name: this.vehicleNames[i],
        totalUpdates,
        speedingUpdates,
        speedingPercentage: parseFloat(speedingPercentage.toFixed(2)),
        severityBreakdown: {
          mild: parseFloat(severityBreakdown.mild.toFixed(2)),
          moderate: parseFloat(severityBreakdown.moderate.toFixed(2)),
          severe: parseFloat(severityBreakdown.severe.toFixed(2)),
        },
      });
    }

    // Sort by speeding percentage (worst to best)
    return data.sort((a, b) => b.speedingPercentage - a.speedingPercentage);
  }

  /**
   * Generate speeding data for drivers
   */
  generateDriverSpeedingData(count?: number): SpeedingData[] {
    const driverCount = Math.min(count || this.driverNames.length, this.driverNames.length);
    const data: SpeedingData[] = [];

    for (let i = 0; i < driverCount; i++) {
      const totalUpdates = this.randomInt(4000, 12000);
      const speedingProfile = this.getSpeedingProfile(i, driverCount);

      const severityBreakdown: SeverityBreakdown = {
        mild: speedingProfile.mild,
        moderate: speedingProfile.moderate,
        severe: speedingProfile.severe,
      };

      const speedingPercentage = severityBreakdown.mild + severityBreakdown.moderate + severityBreakdown.severe;
      const speedingUpdates = Math.round((totalUpdates * speedingPercentage) / 100);

      data.push({
        id: `driver-${i + 1}`,
        name: this.driverNames[i],
        totalUpdates,
        speedingUpdates,
        speedingPercentage: parseFloat(speedingPercentage.toFixed(2)),
        severityBreakdown: {
          mild: parseFloat(severityBreakdown.mild.toFixed(2)),
          moderate: parseFloat(severityBreakdown.moderate.toFixed(2)),
          severe: parseFloat(severityBreakdown.severe.toFixed(2)),
        },
      });
    }

    // Sort by speeding percentage (worst to best)
    return data.sort((a, b) => b.speedingPercentage - a.speedingPercentage);
  }

  /**
   * Calculate fleet average from speeding data
   */
  calculateFleetAverage(data: SpeedingData[]): number {
    if (data.length === 0) return 0;
    const totalPercentage = data.reduce((sum, item) => sum + item.speedingPercentage, 0);
    return parseFloat((totalPercentage / data.length).toFixed(2));
  }

  /**
   * Get a speeding profile based on position in the list
   * Creates a realistic distribution where most vehicles/drivers are good,
   * a few are moderate, and 1-2 are really bad
   */
  private getSpeedingProfile(index: number, total: number): SeverityBreakdown {
    // First vehicle/driver is always the worst (matches the screenshot)
    if (index === 0) {
      return {
        mild: this.randomFloat(3.5, 4.5),
        moderate: this.randomFloat(0.5, 0.8),
        severe: this.randomFloat(0.3, 0.5),
      };
    }

    // Second is moderately bad
    if (index === 1) {
      return {
        mild: this.randomFloat(1.3, 1.8),
        moderate: this.randomFloat(0.3, 0.4),
        severe: this.randomFloat(0.25, 0.35),
      };
    }

    // 3-5 are somewhat concerning
    if (index < 5) {
      return {
        mild: this.randomFloat(0.35, 0.55),
        moderate: this.randomFloat(0.1, 0.2),
        severe: this.randomFloat(0.05, 0.15),
      };
    }

    // Rest are generally good with occasional minor speeding
    const ratio = index / total;
    if (ratio < 0.7) {
      return {
        mild: this.randomFloat(0.2, 0.4),
        moderate: this.randomFloat(0.05, 0.15),
        severe: this.randomFloat(0.01, 0.08),
      };
    } else {
      return {
        mild: this.randomFloat(0.05, 0.2),
        moderate: this.randomFloat(0.01, 0.05),
        severe: Math.random() > 0.5 ? this.randomFloat(0, 0.03) : 0,
      };
    }
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}

// Export singleton instance
export const speedingDataGenerator = new SpeedingDataGenerator();
