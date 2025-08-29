export interface Route {
  id: string;
  coordinates: Array<[number, number]>; // [lng, lat] format
  distance: number; // meters
  duration: number; // seconds
  geometry?: string; // encoded polyline
  waypoints?: RouteWaypoint[];
}

export interface RouteWaypoint {
  location: [number, number]; // [lng, lat]
  distance: number; // distance along route in meters
  name?: string;
}

export interface RoadSnapResult {
  location: [number, number]; // [lng, lat]
  distance: number; // distance from original point in meters
  roadName?: string;
  speedLimit?: number;
  roadType?: string;
  heading?: number;
  confidence?: number; // 0-1 confidence score
}

export interface TrafficInfo {
  congestionLevel: 'low' | 'moderate' | 'heavy' | 'severe';
  speedReduction: number; // percentage speed reduction
  averageSpeed: number; // km/h
}

export interface RoutingOptions {
  profile?: 'driving' | 'driving-traffic' | 'walking' | 'cycling';
  alternatives?: boolean;
  steps?: boolean;
  overview?: 'full' | 'simplified' | 'false';
  geometries?: 'geojson' | 'polyline' | 'polyline6';
  annotations?: string[];
  radiusMeters?: number; // for map matching
}

export interface RoutingService {
  /**
   * Snap a GPS coordinate to the nearest road
   */
  snapToRoad(
    latitude: number,
    longitude: number,
    options?: RoutingOptions
  ): Promise<RoadSnapResult>;

  /**
   * Calculate optimal route between two points
   */
  calculateRoute(
    from: [number, number],
    to: [number, number],
    options?: RoutingOptions
  ): Promise<Route>;

  /**
   * Match GPS coordinates to roads (for cleaning GPS traces)
   */
  matchToRoads(
    coordinates: Array<[number, number]>,
    options?: RoutingOptions
  ): Promise<{
    matchedCoordinates: Array<[number, number]>;
    confidence: number;
    route?: Route;
  }>;

  /**
   * Get current traffic information for a road segment
   */
  getTrafficInfo?(
    from: [number, number],
    to: [number, number]
  ): Promise<TrafficInfo>;

  /**
   * Check if service is available
   */
  isAvailable(): Promise<boolean>;
}

export interface RoutingServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  rateLimitRpm?: number; // requests per minute
  timeout?: number; // milliseconds
  enableCaching?: boolean;
  cacheTtl?: number; // cache time to live in milliseconds
}

export type RoutingProvider = 'mapbox' | 'local' | 'hybrid';

export interface RoutingError extends Error {
  code:
    | 'API_ERROR'
    | 'RATE_LIMIT'
    | 'NETWORK_ERROR'
    | 'INVALID_COORDINATES'
    | 'SERVICE_UNAVAILABLE';
  provider: RoutingProvider;
  retryable: boolean;
}
