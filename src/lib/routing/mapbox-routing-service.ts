import type {
  RoutingService,
  Route,
  RoadSnapResult,
  RoutingOptions,
  TrafficInfo,
  RoutingServiceConfig,
  RoutingError,
} from '@/types/routing';
import { DEFAULT_ROUTING_OPTIONS } from './config';

interface MapboxDirectionsResponse {
  routes: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    distance: number;
    duration: number;
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        geometry: {
          coordinates: Array<[number, number]>;
        };
        distance: number;
        duration: number;
        name: string;
      }>;
    }>;
  }>;
  waypoints: Array<{
    location: [number, number];
    distance: number;
    name?: string;
  }>;
}

interface MapboxMapMatchingResponse {
  matchings: Array<{
    geometry: {
      coordinates: Array<[number, number]>;
    };
    distance: number;
    duration: number;
    confidence: number;
  }>;
  tracepoints: Array<{
    location: [number, number];
    matchings_index: number;
    waypoint_index: number;
    distance_from_trace: number;
  }>;
}

/**
 * Mapbox routing service for production-grade road mapping and routing
 * Uses Mapbox Directions API and Map Matching API
 */
export class MapboxRoutingService implements RoutingService {
  private config: RoutingServiceConfig;
  private rateLimitQueue: Array<() => Promise<unknown>> = [];
  private requestsInProgress = 0;
  private lastRequestTime = 0;
  private cache: Map<string, { data: unknown; expires: number }> = new Map();
  private backoffMultiplier = 1;
  private isRateLimited = false;
  private rateLimitResetTime = 0;

  constructor(config: RoutingServiceConfig) {
    this.config = {
      baseUrl: 'https://api.mapbox.com',
      rateLimitRpm: 600,
      timeout: 5000,
      enableCaching: true,
      cacheTtl: 15 * 60 * 1000, // Extended cache TTL to 15 minutes
      ...config,
    };

    if (!this.config.apiKey) {
      throw new Error('Mapbox API key is required');
    }

    // Start cleanup interval for cache
    if (this.config.enableCaching) {
      setInterval(() => this.cleanupCache(), 60000); // Clean every minute
    }
  }

  async snapToRoad(
    latitude: number,
    longitude: number,
    options?: RoutingOptions
  ): Promise<RoadSnapResult> {
    // Round coordinates to reduce cache misses (precision to ~10m)
    const roundedLat = Math.round(latitude * 10000) / 10000;
    const roundedLng = Math.round(longitude * 10000) / 10000;
    const cacheKey = `snap:${roundedLat}:${roundedLng}:${options?.radiusMeters || 400}`;

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data as RoadSnapResult;
      }
    }

    try {
      // For single-point snapping, we'll use Mapbox's Map Matching API with a minimal approach
      // Create 3 points in a line to help the matching algorithm
      const offsetMeters = 5; // Smaller offset for better accuracy
      const lngOffsetDegrees =
        offsetMeters / (111000 * Math.cos((latitude * Math.PI) / 180));

      // Create a small cross pattern around the point to give map matching context
      const coords: [number, number][] = [
        [longitude - lngOffsetDegrees, latitude], // West
        [longitude, latitude], // Center (original point)
        [longitude + lngOffsetDegrees, latitude], // East
      ];


      // Use appropriate radius for better matching - increased for Dublin area
      const matchOptions = {
        ...options,
        radiusMeters: Math.min(
          500,
          Math.max(300, options?.radiusMeters || 400)
        ), // Increased radius for urban areas
      };

      const matchResult = await this.matchToRoads(coords, matchOptions);

      if (matchResult.matchedCoordinates.length === 0) {
        // Fallback: try with a larger radius
        const fallbackOptions = {
          ...matchOptions,
          radiusMeters: 600,
        };
        const fallbackResult = await this.matchToRoads(coords, fallbackOptions);

        if (fallbackResult.matchedCoordinates.length === 0) {
          throw this.createError(
            'INVALID_COORDINATES',
            'No road found near coordinates'
          );
        }

        // Use fallback result
        const snappedCoord =
          fallbackResult.matchedCoordinates[1] ||
          fallbackResult.matchedCoordinates[0];
        return {
          location: snappedCoord,
          distance: this.calculateDistance([longitude, latitude], snappedCoord),
          confidence: Math.max(0.3, fallbackResult.confidence - 0.2), // Lower confidence for fallback
          heading: this.calculateHeadingFromSegment(
            fallbackResult.matchedCoordinates
          ),
        };
      }

      // Use the center point (index 1) if available, otherwise the first point
      const snappedCoord =
        matchResult.matchedCoordinates[1] || matchResult.matchedCoordinates[0];

      const result: RoadSnapResult = {
        location: snappedCoord,
        distance: this.calculateDistance([longitude, latitude], snappedCoord),
        confidence: matchResult.confidence,
        heading: this.calculateHeadingFromSegment(
          matchResult.matchedCoordinates
        ),
      };

      // Cache result
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, {
          data: result,
          expires: Date.now() + (this.config.cacheTtl || 300000),
        });
      }

      return result;
    } catch (error) {
      throw this.handleError(error as Error, 'snapToRoad');
    }
  }

  async calculateRoute(
    from: [number, number],
    to: [number, number],
    options?: RoutingOptions
  ): Promise<Route> {
    const mergedOptions = { ...DEFAULT_ROUTING_OPTIONS, ...options };
    const cacheKey = `route:${from.join(',')}:${to.join(',')}:${JSON.stringify(mergedOptions)}`;

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data as Route;
      }
    }

    try {
      const url = this.buildDirectionsUrl([from, to], mergedOptions);
      const response = await this.makeRequest<MapboxDirectionsResponse>(url);

      if (!response.routes || response.routes.length === 0) {
        throw this.createError('API_ERROR', 'No route found');
      }

      const route = response.routes[0];
      const result: Route = {
        id: `mapbox-${Date.now()}`,
        coordinates: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
        waypoints: response.waypoints.map((wp) => ({
          location: wp.location,
          distance: wp.distance,
          name: wp.name,
        })),
      };

      // Cache result
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, {
          data: result,
          expires: Date.now() + (this.config.cacheTtl || 300000),
        });
      }

      return result;
    } catch (error) {
      throw this.handleError(error as Error, 'calculateRoute');
    }
  }

  async matchToRoads(
    coordinates: Array<[number, number]>,
    options?: RoutingOptions
  ): Promise<{
    matchedCoordinates: Array<[number, number]>;
    confidence: number;
    route?: Route;
  }> {
    const mergedOptions = { ...DEFAULT_ROUTING_OPTIONS, ...options };
    // Round coordinates for better cache hits
    const roundedCoords = coordinates.map(([lng, lat]) => [
      Math.round(lng * 10000) / 10000,
      Math.round(lat * 10000) / 10000,
    ]);
    const cacheKey = `match:${roundedCoords.map((c) => c.join(',')).join(';')}:${mergedOptions.radiusMeters || 400}`;

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data as { matchedCoordinates: Array<[number, number]>; confidence: number; route?: Route };
      }
    }

    try {
      const url = this.buildMapMatchingUrl(coordinates, mergedOptions);
      const response = await this.makeRequest<MapboxMapMatchingResponse>(url);

      if (!response.matchings || response.matchings.length === 0) {
        return {
          matchedCoordinates: coordinates, // Fallback to original coordinates
          confidence: 0,
        };
      }

      const matching = response.matchings[0];


      const result = {
        matchedCoordinates: matching.geometry.coordinates,
        confidence: matching.confidence,
        route: {
          id: `mapbox-match-${Date.now()}`,
          coordinates: matching.geometry.coordinates,
          distance: matching.distance,
          duration: matching.duration,
        } as Route,
      };

      // Cache result
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, {
          data: result,
          expires: Date.now() + (this.config.cacheTtl || 900000), // Extended cache for matching to 15 minutes
        });
      }

      return result;
    } catch (error) {
      throw this.handleError(error as Error, 'matchToRoads');
    }
  }

  async getTrafficInfo(
    from: [number, number],
    to: [number, number]
  ): Promise<TrafficInfo> {
    // Use directions with traffic profile
    try {
      const routeWithTraffic = await this.calculateRoute(from, to, {
        profile: 'driving-traffic',
        annotations: ['duration', 'distance', 'speed'],
      });

      const routeWithoutTraffic = await this.calculateRoute(from, to, {
        profile: 'driving',
        annotations: ['duration', 'distance', 'speed'],
      });

      const speedReduction = Math.max(
        0,
        ((routeWithoutTraffic.duration - routeWithTraffic.duration) /
          routeWithoutTraffic.duration) *
          100
      );

      const averageSpeed =
        routeWithTraffic.distance / 1000 / (routeWithTraffic.duration / 3600);

      let congestionLevel: TrafficInfo['congestionLevel'] = 'low';
      if (speedReduction > 50) congestionLevel = 'severe';
      else if (speedReduction > 30) congestionLevel = 'heavy';
      else if (speedReduction > 15) congestionLevel = 'moderate';

      return {
        congestionLevel,
        speedReduction,
        averageSpeed,
      };
    } catch {
      // Fallback traffic info
      return {
        congestionLevel: 'moderate',
        speedReduction: 20,
        averageSpeed: 30,
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      console.log(
        '🩺 Testing Mapbox service availability with Dublin coordinates...'
      );
      // Test with a simple request to Dublin city center
      const result = await this.snapToRoad(53.3498, -6.2603, {
        radiusMeters: 100,
      });
      return true;
    } catch (err) {
      console.error('❌ Mapbox availability test failed:', err);
      return false;
    }
  }

  private buildDirectionsUrl(
    coordinates: Array<[number, number]>,
    options: RoutingOptions
  ): string {
    const coords = coordinates.map((c) => c.join(',')).join(';');
    const params = new URLSearchParams();

    params.set('access_token', this.config.apiKey!);
    if (options.alternatives) params.set('alternatives', 'true');
    if (options.steps) params.set('steps', 'true');
    if (options.overview) params.set('overview', options.overview);
    if (options.geometries) params.set('geometries', options.geometries);
    if (options.annotations)
      params.set('annotations', options.annotations.join(','));

    return `${this.config.baseUrl}/directions/v5/mapbox/${options.profile || 'driving'}/${coords}?${params}`;
  }

  private buildMapMatchingUrl(
    coordinates: Array<[number, number]>,
    options: RoutingOptions
  ): string {
    const coords = coordinates.map((c) => c.join(',')).join(';');
    const params = new URLSearchParams();

    params.set('access_token', this.config.apiKey!);

    // Essential parameters for better map matching
    params.set('geometries', options.geometries || 'geojson');
    params.set('overview', 'full'); // Get full geometry
    params.set('steps', 'false'); // We don't need turn-by-turn
    params.set('tidy', 'true'); // Clean up the trace

    if (options.radiusMeters) {
      params.set(
        'radiuses',
        coordinates.map(() => options.radiusMeters).join(';')
      );
    }

    if (options.annotations) {
      params.set('annotations', options.annotations.join(','));
    }

    const url = `${this.config.baseUrl}/matching/v5/mapbox/${options.profile || 'driving'}/${coords}?${params}`;


    return url;
  }

  private async makeRequest<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const makeCall = async () => {
        try {

          // Rate limiting
          await this.waitForRateLimit();
          this.requestsInProgress++;
          this.lastRequestTime = Date.now();

          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.warn(
              '⏰ Mapbox request timeout after',
              this.config.timeout,
              'ms'
            );
            controller.abort();
          }, this.config.timeout);

          const startTime = Date.now();
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'TranspocoTrack/1.0',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          this.requestsInProgress--;
          const duration = Date.now() - startTime;


          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Mapbox API error response:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText.substring(0, 500),
            });

            if (response.status === 429) {
              // Parse rate limit reset time from headers
              const resetTime = response.headers.get('x-rate-limit-reset');
              if (resetTime) {
                this.rateLimitResetTime = parseInt(resetTime) * 1000; // Convert to milliseconds
                this.isRateLimited = true;
                console.warn(
                  '🚦 Rate limit hit, reset at:',
                  new Date(this.rateLimitResetTime).toISOString()
                );
              }
              // Increase backoff multiplier for subsequent requests
              this.backoffMultiplier = Math.min(this.backoffMultiplier * 2, 8);
              throw this.createError('RATE_LIMIT', 'Rate limit exceeded');
            }
            throw this.createError(
              'API_ERROR',
              `HTTP ${response.status}: ${response.statusText} - ${errorText}`
            );
          }

          const data = await response.json();

          // Reset rate limiting on successful request
          if (this.isRateLimited && Date.now() > this.rateLimitResetTime) {
            this.isRateLimited = false;
            this.backoffMultiplier = 1;
            console.log('🟢 Rate limit cleared, backoff reset');
          }

          resolve(data);
        } catch (error) {
          this.requestsInProgress--;
          console.error('💥 Mapbox API request failed:', error);
          reject(error);
        } finally {
          // Process next item in queue after this request completes
          setTimeout(() => this.processQueue(), 0);
        }
      };

      this.rateLimitQueue.push(makeCall);
      this.processQueue();
    });
  }

  private async waitForRateLimit(): Promise<void> {
    const maxRequestsPerMinute = this.config.rateLimitRpm || 600;
    const baseInterval = 60000 / maxRequestsPerMinute; // milliseconds between requests

    // Apply exponential backoff if rate limited
    const minInterval = this.isRateLimited
      ? baseInterval * this.backoffMultiplier
      : baseInterval;

    // If rate limited and reset time is known, wait until reset time
    if (this.isRateLimited && this.rateLimitResetTime > 0) {
      const waitUntilReset = this.rateLimitResetTime - Date.now();
      if (waitUntilReset > 0 && waitUntilReset < 60000) {
        // Don't wait more than 1 minute
        console.log(
          `⏳ Waiting ${Math.ceil(waitUntilReset / 1000)}s for rate limit reset`
        );
        await new Promise((resolve) => setTimeout(resolve, waitUntilReset));
        this.isRateLimited = false;
        this.backoffMultiplier = 1;
        return;
      }
    }

    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      if (this.isRateLimited) {
        console.log(
          `⏳ Rate limited: waiting ${Math.ceil(waitTime / 1000)}s (backoff: ${this.backoffMultiplier}x)`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  private processQueue(): void {
    // Process multiple requests up to concurrency limit
    while (this.rateLimitQueue.length > 0 && this.requestsInProgress < 5) {
      const nextRequest = this.rateLimitQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  private calculateDistance(
    from: [number, number],
    to: [number, number]
  ): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (from[1] * Math.PI) / 180;
    const φ2 = (to[1] * Math.PI) / 180;
    const Δφ = ((to[1] - from[1]) * Math.PI) / 180;
    const Δλ = ((to[0] - from[0]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
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

  private calculateHeadingFromSegment(
    coordinates: Array<[number, number]>
  ): number | undefined {
    if (coordinates.length < 2) return undefined;

    // Find the best pair of points for calculating heading
    // Use points that are far enough apart for accurate bearing
    let bestDistance = 0;
    let bestHeading: number | undefined;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const p1 = coordinates[i];
      const p2 = coordinates[i + 1];
      const distance = this.calculateDistance(p1, p2);

      if (distance > bestDistance && distance > 5) {
        // At least 5 meters apart
        bestDistance = distance;
        bestHeading = this.calculateBearing(p1[1], p1[0], p2[1], p2[0]);
      }
    }

    return bestHeading;
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  private createError(
    code: RoutingError['code'],
    message: string
  ): RoutingError {
    const error = new Error(message) as RoutingError;
    error.code = code;
    error.provider = 'mapbox';
    error.retryable = code === 'RATE_LIMIT' || code === 'NETWORK_ERROR';
    return error;
  }

  private handleError(error: Error, operation: string): RoutingError {
    if ((error as RoutingError).provider) {
      return error as RoutingError;
    }

    let code: RoutingError['code'] = 'API_ERROR';
    if (error.name === 'AbortError') {
      code = 'NETWORK_ERROR';
    } else if (error.message.includes('fetch')) {
      code = 'NETWORK_ERROR';
    }

    const routingError = this.createError(
      code,
      `${operation} failed: ${error.message}`
    );
    return routingError;
  }
}
