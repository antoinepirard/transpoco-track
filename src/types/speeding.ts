/**
 * Speeding data types for Speed Summary feature
 */

/**
 * Severity breakdown of speeding events by percentage over limit
 */
export interface SeverityBreakdown {
  /** 11-20% over speed limit */
  mild: number;
  /** 21-30% over speed limit */
  moderate: number;
  /** >30% over speed limit */
  severe: number;
}

/**
 * Speeding statistics for a single vehicle or driver
 */
export interface SpeedingData {
  /** Unique identifier (vehicle ID or driver ID) */
  id: string;
  /** Display name (vehicle name or driver name) */
  name: string;
  /** Total number of tracker updates received */
  totalUpdates: number;
  /** Total number of speeding updates */
  speedingUpdates: number;
  /** Percentage of updates where speed was over limit */
  speedingPercentage: number;
  /** Breakdown by severity level (as percentages of total updates) */
  severityBreakdown: SeverityBreakdown;
}

/**
 * API response for speeding statistics
 */
export interface SpeedingStatsResponse {
  /** List of speeding data for vehicles or drivers */
  data: SpeedingData[];
  /** Fleet average speeding percentage */
  fleetAverage: number;
  /** Date range for the data */
  dateRange: {
    startDate: string;
    endDate: string;
  };
  /** Whether data is grouped by vehicle or driver */
  groupBy: 'vehicle' | 'driver';
}

/**
 * Filter parameters for speeding data API
 */
export interface SpeedingFilters {
  startDate: string;
  endDate: string;
  groupBy: 'vehicle' | 'driver';
  vehicleIds?: string[];
  driverIds?: string[];
}
