import type {
  RoutingService,
  Route,
  RoadSnapResult,
  RoutingOptions,
  TrafficInfo,
  RoutingServiceConfig,
} from '@/types/routing';
import {
  snapToNearestRoad,
  getRandomRoadSegment,
} from '@/lib/geo/roadNetwork';
import { getSegmentById } from '@/lib/demo/roadCoordinates';
import { distance } from '@turf/turf';

/**
 * Local routing service using the existing Ireland road network
 * Provides fast, offline routing with good coverage of Irish roads
 */
export class LocalRoutingService implements RoutingService {
  private config: RoutingServiceConfig;

  constructor(config: RoutingServiceConfig = {}) {
    this.config = {
      timeout: 100,
      enableCaching: false,
      ...config,
    };
  }

  async snapToRoad(
    latitude: number,
    longitude: number
  ): Promise<RoadSnapResult> {
    try {
      const segmentPosition = snapToNearestRoad(latitude, longitude);
      const segment = getSegmentById(segmentPosition.segmentId);

      if (!segment) {
        throw new Error(`Segment ${segmentPosition.segmentId} not found`);
      }

      // Calculate distance from original point to snapped point
      const originalPoint: [number, number] = [longitude, latitude];
      const snappedPoint: [number, number] = [
        segmentPosition.position.longitude,
        segmentPosition.position.latitude,
      ];

      const snapDistance = distance(originalPoint, snappedPoint, {
        units: 'meters',
      });

      return {
        location: snappedPoint,
        distance: snapDistance,
        roadName: segment.roadName,
        speedLimit: segment.speedLimit,
        roadType: segment.roadType,
        heading: segmentPosition.heading,
        confidence: this.calculateConfidence(snapDistance),
      };
    } catch (error) {
      throw this.createError(
        'INVALID_COORDINATES',
        `Failed to snap to road: ${error}`
      );
    }
  }

  async calculateRoute(
    from: [number, number],
    to: [number, number],
    _options?: RoutingOptions
  ): Promise<Route> {
    try {
      // Snap start and end points to road network
      const startSnap = await this.snapToRoad(from[1], from[0]);
      const endSnap = await this.snapToRoad(to[1], to[0]);

      // For now, create a simple straight-line route
      // In a full implementation, this would use A* or similar pathfinding
      const coordinates: Array<[number, number]> = [
        startSnap.location,
        endSnap.location,
      ];

      const routeDistance = distance(startSnap.location, endSnap.location, {
        units: 'meters',
      });

      // Estimate duration based on average speed (assuming 40 km/h in urban areas)
      const averageSpeedKmh = 40;
      const durationSeconds = (routeDistance / 1000) * (3600 / averageSpeedKmh);

      return {
        id: `local-route-${Date.now()}`,
        coordinates,
        distance: routeDistance,
        duration: durationSeconds,
        waypoints: [
          { location: startSnap.location, distance: 0 },
          { location: endSnap.location, distance: routeDistance },
        ],
      };
    } catch (error) {
      throw this.createError(
        'API_ERROR',
        `Failed to calculate route: ${error}`
      );
    }
  }

  async matchToRoads(
    coordinates: Array<[number, number]>,
    _options?: RoutingOptions
  ): Promise<{
    matchedCoordinates: Array<[number, number]>;
    confidence: number;
    route?: Route;
  }> {
    try {
      const matchedCoordinates: Array<[number, number]> = [];
      let totalConfidence = 0;

      for (const coord of coordinates) {
        const snapped = await this.snapToRoad(coord[1], coord[0]);
        matchedCoordinates.push(snapped.location);
        totalConfidence += snapped.confidence || 0.5;
      }

      const averageConfidence = totalConfidence / coordinates.length;

      // Create a route from the matched coordinates
      let totalDistance = 0;
      for (let i = 1; i < matchedCoordinates.length; i++) {
        totalDistance += distance(
          matchedCoordinates[i - 1],
          matchedCoordinates[i],
          { units: 'meters' }
        );
      }

      const route: Route = {
        id: `local-match-${Date.now()}`,
        coordinates: matchedCoordinates,
        distance: totalDistance,
        duration: (totalDistance / 1000) * 90, // rough estimate
      };

      return {
        matchedCoordinates,
        confidence: averageConfidence,
        route,
      };
    } catch (error) {
      throw this.createError(
        'API_ERROR',
        `Failed to match coordinates: ${error}`
      );
    }
  }

  async getTrafficInfo(): Promise<TrafficInfo> {
    // Local service doesn't have real traffic data, return simulated data
    return {
      congestionLevel: 'moderate',
      speedReduction: 15, // 15% speed reduction
      averageSpeed: 35, // km/h
    };
  }

  async isAvailable(): Promise<boolean> {
    // Local service is always available
    return true;
  }

  /**
   * Calculate confidence score based on snap distance
   */
  private calculateConfidence(snapDistance: number): number {
    // Confidence decreases as distance increases
    // Perfect confidence (1.0) for distances < 5m
    // Zero confidence for distances > 100m
    if (snapDistance < 5) return 1.0;
    if (snapDistance > 100) return 0.0;

    return Math.max(0, 1 - (snapDistance - 5) / 95);
  }

  /**
   * Create standardized routing error
   */
  private createError(code: string, message: string): Error & { code: string; provider: string; retryable: boolean } {
    const error = new Error(message) as Error & { code: string; provider: string; retryable: boolean };
    error.code = code;
    error.provider = 'local';
    error.retryable = false;
    return error;
  }

  /**
   * Generate random positions for testing (using existing road network)
   */
  generateRandomPosition(): { latitude: number; longitude: number } {
    const segmentPosition = getRandomRoadSegment();
    return {
      latitude: segmentPosition.position.latitude,
      longitude: segmentPosition.position.longitude,
    };
  }

  /**
   * Get all available road segments (for debugging/visualization)
   */
  getAllRoadSegments() {
    // This would need to be implemented to return all segments
    // For now, return empty array
    return [];
  }
}
