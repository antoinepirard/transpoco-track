import type { RoutingService, RoutingProvider } from '@/types/routing';
import { HybridRoutingService } from './hybrid-routing-service';
import { MapboxRoutingService } from './mapbox-routing-service';
import { LocalRoutingService } from './local-routing-service';
import { getMapboxConfig, ROUTING_CONFIG } from './config';

// Export all types and classes
export * from '@/types/routing';
export { HybridRoutingService } from './hybrid-routing-service';
export { MapboxRoutingService } from './mapbox-routing-service';
export { LocalRoutingService } from './local-routing-service';
export * from './config';

/**
 * Create a routing service instance based on configuration
 */
export function createRoutingService(
  provider: RoutingProvider = 'hybrid'
): RoutingService {
  switch (provider) {
    case 'hybrid':
      return new HybridRoutingService({
        preferredProvider: 'mapbox',
        fallbackEnabled: true,
        healthCheckInterval: 30000,
        maxRetries: 2,
        retryDelay: 1000,
      });

    case 'mapbox':
      const mapboxConfig = getMapboxConfig();
      if (!mapboxConfig.apiKey) {
        console.warn('Mapbox API key not found, falling back to local routing');
        return new LocalRoutingService(ROUTING_CONFIG.local);
      }
      return new MapboxRoutingService(mapboxConfig);

    case 'local':
      return new LocalRoutingService(ROUTING_CONFIG.local);

    default:
      throw new Error(`Unknown routing provider: ${provider}`);
  }
}

/**
 * Default routing service instance (singleton)
 * Uses hybrid approach with Mapbox preferred and local fallback
 */
let defaultRoutingService: RoutingService | null = null;

export function getRoutingService(): RoutingService {
  if (!defaultRoutingService) {
    defaultRoutingService = createRoutingService('hybrid');
  }
  return defaultRoutingService;
}

/**
 * Reset the default routing service (useful for testing)
 */
export function resetRoutingService(): void {
  defaultRoutingService = null;
}

/**
 * Configure the default routing service
 */
export function configureRoutingService(provider: RoutingProvider): void {
  defaultRoutingService = createRoutingService(provider);
}

/**
 * Utility functions for common routing operations
 */
export class RoutingUtils {
  /**
   * Check if coordinates are within Ireland bounds
   */
  static isWithinIreland(latitude: number, longitude: number): boolean {
    const IRELAND_BOUNDS = {
      north: 55.5,
      south: 51.4,
      east: -5.4,
      west: -10.7,
    };

    return (
      latitude >= IRELAND_BOUNDS.south &&
      latitude <= IRELAND_BOUNDS.north &&
      longitude >= IRELAND_BOUNDS.west &&
      longitude <= IRELAND_BOUNDS.east
    );
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(
    latitude: number,
    longitude: number,
    precision = 4
  ): string {
    return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
  }

  /**
   * Calculate approximate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Calculate bearing between two coordinates
   */
  static calculateBearing(
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

  /**
   * Validate coordinates
   */
  static isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Validate if coordinates are likely in Ireland (with buffer)
   */
  static isLikelyIrishCoordinates(latitude: number, longitude: number): boolean {
    const IRELAND_BOUNDS_BUFFERED = {
      north: 55.7,  // Extended north
      south: 51.2,  // Extended south
      east: -5.0,   // Extended east
      west: -11.0,  // Extended west
    };

    return (
      latitude >= IRELAND_BOUNDS_BUFFERED.south &&
      latitude <= IRELAND_BOUNDS_BUFFERED.north &&
      longitude >= IRELAND_BOUNDS_BUFFERED.west &&
      longitude <= IRELAND_BOUNDS_BUFFERED.east
    );
  }

  /**
   * Validate and normalize coordinates from various input formats
   */
  static normalizeCoordinates(input: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    lon?: number;
  }): { latitude: number; longitude: number } | null {
    const lat = input.latitude ?? input.lat;
    const lng = input.longitude ?? input.lng ?? input.lon;

    if (lat === undefined || lng === undefined) {
      console.warn('Missing coordinates:', input);
      return null;
    }

    if (!this.isValidCoordinates(lat, lng)) {
      console.warn('Invalid coordinates:', { latitude: lat, longitude: lng });
      return null;
    }

    return { latitude: lat, longitude: lng };
  }

  /**
   * Convert coordinate array to object with validation
   */
  static arrayToCoordinates(coords: [number, number]): { 
    latitude: number; 
    longitude: number; 
  } | null {
    if (!Array.isArray(coords) || coords.length !== 2) {
      console.warn('Invalid coordinate array:', coords);
      return null;
    }

    const [lng, lat] = coords; // Mapbox format: [longitude, latitude]
    return this.normalizeCoordinates({ latitude: lat, longitude: lng });
  }

  /**
   * Convert coordinate object to Mapbox array format [lng, lat]
   */
  static coordinatesToArray(coords: { latitude: number; longitude: number }): [number, number] | null {
    const normalized = this.normalizeCoordinates(coords);
    if (!normalized) return null;
    
    return [normalized.longitude, normalized.latitude]; // Mapbox format
  }

  /**
   * Detect if coordinates might be swapped (lat/lng vs lng/lat)
   */
  static detectCoordinateSwap(
    latitude: number, 
    longitude: number
  ): { 
    isSwapped: boolean; 
    correctedLatitude: number; 
    correctedLongitude: number; 
    confidence: number;
  } {
    // For Ireland, longitude should be negative (west of Prime Meridian)
    // and latitude should be between ~51-56
    const originalValid = this.isLikelyIrishCoordinates(latitude, longitude);
    const swappedValid = this.isLikelyIrishCoordinates(longitude, latitude);

    if (originalValid && !swappedValid) {
      return {
        isSwapped: false,
        correctedLatitude: latitude,
        correctedLongitude: longitude,
        confidence: 0.9
      };
    }

    if (!originalValid && swappedValid) {
      console.warn('Detected coordinate swap, correcting:', { 
        original: { latitude, longitude },
        corrected: { latitude: longitude, longitude: latitude }
      });
      return {
        isSwapped: true,
        correctedLatitude: longitude,
        correctedLongitude: latitude,
        confidence: 0.8
      };
    }

    // If both are valid or both are invalid, assume no swap needed
    return {
      isSwapped: false,
      correctedLatitude: latitude,
      correctedLongitude: longitude,
      confidence: originalValid ? 0.7 : 0.3
    };
  }

  /**
   * Convert route duration to human readable format
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Convert distance to human readable format
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }

    const kilometers = meters / 1000;
    if (kilometers < 10) {
      return `${kilometers.toFixed(1)}km`;
    }

    return `${Math.round(kilometers)}km`;
  }

  /**
   * Simplify coordinates array by removing points that are too close
   */
  static simplifyCoordinates(
    coordinates: Array<[number, number]>,
    tolerance = 10 // meters
  ): Array<[number, number]> {
    if (coordinates.length <= 2) return coordinates;

    const simplified = [coordinates[0]];

    for (let i = 1; i < coordinates.length - 1; i++) {
      const prev = coordinates[i - 1];
      const current = coordinates[i];
      const distance = this.calculateDistance(
        prev[1],
        prev[0],
        current[1],
        current[0]
      );

      if (distance >= tolerance) {
        simplified.push(current);
      }
    }

    // Always include the last point
    simplified.push(coordinates[coordinates.length - 1]);

    return simplified;
  }
}
