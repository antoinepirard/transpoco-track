import type { RoutingServiceConfig } from '@/types/routing';

export const ROUTING_CONFIG: Record<string, RoutingServiceConfig> = {
  mapbox: {
    baseUrl: 'https://api.mapbox.com',
    rateLimitRpm: 600, // 600 requests per minute for Mapbox
    timeout: 5000, // 5 seconds
    enableCaching: true,
    cacheTtl: 5 * 60 * 1000, // 5 minutes cache
  },
  local: {
    timeout: 100, // Very fast local processing
    enableCaching: false,
  },
};

export const getMapboxConfig = (): RoutingServiceConfig => ({
  ...ROUTING_CONFIG.mapbox,
  apiKey: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
});

// Fallback API keys for different providers
export const ROUTING_API_KEYS = {
  mapbox: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  google: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  here: process.env.NEXT_PUBLIC_HERE_API_KEY,
} as const;

export const DEFAULT_ROUTING_OPTIONS = {
  profile: 'driving-traffic' as const,
  alternatives: false,
  steps: false,
  overview: 'simplified' as const,
  geometries: 'geojson' as const,
  radiusMeters: 50, // 50m radius for map matching
  annotations: ['duration', 'distance', 'speed'],
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  maxConcurrentRequests: 5,
  requestInterval: 100, // ms between requests
  maxRetries: 3,
  backoffMultiplier: 2,
};

// Cache configuration for different operation types
export const CACHE_CONFIG = {
  snapToRoad: { ttl: 2 * 60 * 1000 }, // 2 minutes - GPS coords don't change much
  calculateRoute: { ttl: 5 * 60 * 1000 }, // 5 minutes - routes can change with traffic
  matchToRoads: { ttl: 1 * 60 * 1000 }, // 1 minute - for cleaning GPS traces
  trafficInfo: { ttl: 30 * 1000 }, // 30 seconds - traffic changes quickly
} as const;
