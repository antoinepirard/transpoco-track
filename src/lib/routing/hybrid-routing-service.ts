import type {
  RoutingService,
  Route,
  RoadSnapResult,
  RoutingOptions,
  TrafficInfo,
  RoutingError,
  RoutingProvider,
} from '@/types/routing';
import { MapboxRoutingService } from './mapbox-routing-service';
import { LocalRoutingService } from './local-routing-service';
import { getMapboxConfig, ROUTING_CONFIG } from './config';

interface HybridConfig {
  preferredProvider: RoutingProvider;
  fallbackEnabled: boolean;
  healthCheckInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
}

/**
 * Hybrid routing service that intelligently combines Mapbox and local routing
 * - Uses Mapbox for production accuracy when available
 * - Falls back to local service for reliability and performance
 * - Monitors service health and switches automatically
 */
export class HybridRoutingService implements RoutingService {
  private mapboxService: MapboxRoutingService | null = null;
  private localService: LocalRoutingService;
  private config: HybridConfig;
  private serviceHealth: Map<RoutingProvider, boolean> = new Map();
  private lastHealthCheck = 0;
  private healthCheckPromise: Promise<void> | null = null;

  constructor(config: Partial<HybridConfig> = {}) {
    this.config = {
      preferredProvider: 'mapbox',
      fallbackEnabled: true,
      healthCheckInterval: 30000, // 30 seconds
      maxRetries: 2,
      retryDelay: 1000,
      ...config,
    };

    console.log('🚗 Initializing Hybrid Routing Service', {
      preferredProvider: this.config.preferredProvider,
      fallbackEnabled: this.config.fallbackEnabled
    });

    // Initialize services
    this.localService = new LocalRoutingService(ROUTING_CONFIG.local);
    console.log('✅ Local routing service initialized');

    try {
      const mapboxConfig = getMapboxConfig();
      console.log('🔑 Mapbox configuration check:', {
        hasApiKey: !!mapboxConfig.apiKey,
        apiKeyPrefix: mapboxConfig.apiKey?.substring(0, 10) + '...'
      });

      if (mapboxConfig.apiKey) {
        this.mapboxService = new MapboxRoutingService(mapboxConfig);
        console.log('✅ Mapbox routing service initialized');
      } else {
        console.warn('❌ Mapbox API key not found, using local routing only');
        this.config.preferredProvider = 'local';
      }
    } catch (error) {
      console.warn('❌ Failed to initialize Mapbox service:', error);
      this.config.preferredProvider = 'local';
    }

    // Initialize service health
    this.serviceHealth.set('local', true); // Local is always healthy
    this.serviceHealth.set('mapbox', false); // Will be checked

    console.log('🏁 Initial service health:', this.getServiceHealth());

    // Start health monitoring
    this.startHealthMonitoring();
  }

  async snapToRoad(
    latitude: number,
    longitude: number,
    options?: RoutingOptions
  ): Promise<RoadSnapResult> {
    // Validate coordinates before processing
    if (!this.isValidCoordinates(latitude, longitude)) {
      const error = this.createError(
        'INVALID_COORDINATES',
        `Invalid coordinates: lat=${latitude}, lng=${longitude}`
      );
      console.warn('Road snapping failed due to invalid coordinates:', { latitude, longitude });
      throw error;
    }

    // Detect potential coordinate swap for Ireland-focused tracking
    if (!this.isLikelyIrishCoordinates(latitude, longitude)) {
      console.warn('Coordinates appear to be outside Ireland:', { latitude, longitude });
    }

    return this.executeWithFallback(
      'snapToRoad',
      async (service) => {
        const result = await service.snapToRoad(latitude, longitude, options);
        
        // Log successful snapping for debugging
        if (process.env.NODE_ENV === 'development') {
          console.debug('Road snap result:', {
            originalCoords: { latitude, longitude },
            snappedCoords: result.location,
            distance: result.distance,
            confidence: result.confidence,
            provider: service.constructor.name
          });
        }
        
        return result;
      }
    );
  }

  async calculateRoute(
    from: [number, number],
    to: [number, number],
    options?: RoutingOptions
  ): Promise<Route> {
    return this.executeWithFallback(
      'calculateRoute',
      async (service) => service.calculateRoute(from, to, options)
    );
  }

  async matchToRoads(
    coordinates: Array<[number, number]>,
    options?: RoutingOptions
  ): Promise<{
    matchedCoordinates: Array<[number, number]>;
    confidence: number;
    route?: Route;
  }> {
    return this.executeWithFallback(
      'matchToRoads',
      async (service) => service.matchToRoads(coordinates, options)
    );
  }

  async getTrafficInfo(
    from: [number, number],
    to: [number, number]
  ): Promise<TrafficInfo> {
    // Traffic info is only available from Mapbox, fallback to simulated data
    if (this.mapboxService && this.serviceHealth.get('mapbox')) {
      try {
        return await this.mapboxService.getTrafficInfo!(from, to);
      } catch (error) {
        console.warn('Mapbox traffic info failed, using fallback:', error);
      }
    }

    return this.localService.getTrafficInfo!();
  }

  async isAvailable(): Promise<boolean> {
    // Hybrid service is available if at least one service is healthy
    return (
      this.serviceHealth.get('local') ||
      this.serviceHealth.get('mapbox') ||
      false
    );
  }

  /**
   * Execute a routing operation with intelligent fallback
   */
  private async executeWithFallback<T>(
    operation: string,
    serviceCall: (service: RoutingService) => Promise<T>
  ): Promise<T> {
    await this.ensureHealthCheck();

    const providers = this.getPreferredProviders();
    console.log(`🔄 Executing ${operation} with providers:`, providers);
    console.log(`📊 Current service health:`, this.getServiceHealth());
    
    let lastError: RoutingError | null = null;

    for (const provider of providers) {
      const service = this.getService(provider);
      const isHealthy = this.serviceHealth.get(provider);
      
      console.log(`🎯 Trying ${provider} service:`, {
        hasService: !!service,
        isHealthy,
        operation
      });

      if (!service || !isHealthy) {
        console.log(`⏭️ Skipping ${provider}: ${!service ? 'no service' : 'unhealthy'}`);
        continue;
      }

      try {
        console.log(`⚡ Executing ${operation} via ${provider}...`);
        const startTime = Date.now();
        
        const result = await this.executeWithRetry(
          serviceCall,
          service,
          operation
        );
        
        const duration = Date.now() - startTime;
        console.log(`✅ ${operation} succeeded via ${provider} in ${duration}ms`);
        
        this.onOperationSuccess(provider, operation);
        return result;
      } catch (error) {
        lastError = error as RoutingError;
        console.warn(`❌ ${provider} ${operation} failed:`, error);
        
        this.onOperationError(provider, operation, lastError);

        // If it's not retryable, mark service as unhealthy
        if (!lastError.retryable) {
          console.log(`💀 Marking ${provider} as unhealthy due to non-retryable error`);
          this.serviceHealth.set(provider, false);
        }
      }
    }

    // All services failed
    console.error(`💥 All routing services failed for ${operation}:`, lastError);
    throw (
      lastError ||
      this.createError(
        'SERVICE_UNAVAILABLE',
        `All routing services failed for operation: ${operation}`
      )
    );
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    serviceCall: (service: RoutingService) => Promise<T>,
    service: RoutingService,
    operation: string
  ): Promise<T> {
    let retries = 0;

    while (retries <= this.config.maxRetries) {
      try {
        return await serviceCall(service);
      } catch (error) {
        const routingError = error as RoutingError;

        if (!routingError.retryable || retries === this.config.maxRetries) {
          throw error;
        }

        retries++;
        const delay = this.config.retryDelay * Math.pow(2, retries - 1); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw this.createError(
      'API_ERROR',
      `Max retries exceeded for ${operation}`
    );
  }

  /**
   * Get ordered list of providers to try
   */
  private getPreferredProviders(): RoutingProvider[] {
    const providers: RoutingProvider[] = [];

    // Add preferred provider first
    if (this.config.preferredProvider === 'mapbox' && this.mapboxService) {
      providers.push('mapbox');
    }
    providers.push('local');

    // Add fallback provider if different from preferred
    if (
      this.config.preferredProvider === 'local' &&
      this.mapboxService &&
      this.config.fallbackEnabled
    ) {
      providers.push('mapbox');
    }

    return providers;
  }

  /**
   * Get service instance by provider
   */
  private getService(provider: RoutingProvider): RoutingService | null {
    switch (provider) {
      case 'mapbox':
        return this.mapboxService;
      case 'local':
        return this.localService;
      default:
        return null;
    }
  }

  /**
   * Start health monitoring for services
   */
  private startHealthMonitoring(): void {
    // Initial health check
    this.checkServiceHealth();

    // Periodic health checks
    setInterval(() => {
      this.checkServiceHealth();
    }, this.config.healthCheckInterval);
  }

  /**
   * Check health of all services
   */
  private async checkServiceHealth(): Promise<void> {
    console.log('🏥 Starting health check...');
    
    try {
      // Check local service (should always be healthy)
      console.log('🔍 Checking local service health...');
      const localHealthy = await this.localService.isAvailable();
      this.serviceHealth.set('local', localHealthy);
      console.log(`📋 Local service health: ${localHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);

      // Check Mapbox service if available
      if (this.mapboxService) {
        console.log('🔍 Checking Mapbox service health...');
        try {
          const mapboxHealthy = await this.mapboxService.isAvailable();
          this.serviceHealth.set('mapbox', mapboxHealthy);
          console.log(`📋 Mapbox service health: ${mapboxHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
        } catch (error) {
          console.warn('❌ Mapbox health check failed:', error);
          this.serviceHealth.set('mapbox', false);
        }
      } else {
        console.log('⚠️ No Mapbox service available for health check');
        this.serviceHealth.set('mapbox', false);
      }

      this.lastHealthCheck = Date.now();
      console.log('🏁 Health check complete:', this.getServiceHealth());
    } catch (error) {
      console.error('💥 Health check failed:', error);
    }
  }

  /**
   * Ensure health check is recent
   */
  private async ensureHealthCheck(): Promise<void> {
    const timeSinceLastCheck = Date.now() - this.lastHealthCheck;

    if (timeSinceLastCheck > this.config.healthCheckInterval) {
      // Avoid concurrent health checks
      if (!this.healthCheckPromise) {
        this.healthCheckPromise = this.checkServiceHealth().finally(() => {
          this.healthCheckPromise = null;
        });
      }
      await this.healthCheckPromise;
    }
  }

  /**
   * Handle successful operation
   */
  private onOperationSuccess(
    provider: RoutingProvider,
    operation: string
  ): void {
    // Mark service as healthy on success
    this.serviceHealth.set(provider, true);

    // Optional: Log success metrics
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${provider} routing success:`, operation);
    }
  }

  /**
   * Handle operation error
   */
  private onOperationError(
    provider: RoutingProvider,
    operation: string,
    error: RoutingError
  ): void {
    // Log error for monitoring
    console.warn(`${provider} routing error in ${operation}:`, error.message);

    // Optional: Send to error tracking service
    // errorTracking.report(error, { provider, operation });
  }

  /**
   * Create standardized routing error
   */
  private createError(
    code: RoutingError['code'],
    message: string
  ): RoutingError {
    const error = new Error(message) as RoutingError;
    error.code = code;
    error.provider = 'hybrid';
    error.retryable = false;
    return error;
  }

  /**
   * Get current service health status
   */
  getServiceHealth(): Record<RoutingProvider, boolean> {
    return {
      local: this.serviceHealth.get('local') || false,
      mapbox: this.serviceHealth.get('mapbox') || false,
      hybrid: true, // Hybrid is always available if we have at least one service
    };
  }

  /**
   * Force a service health check
   */
  async refreshServiceHealth(): Promise<void> {
    await this.checkServiceHealth();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HybridConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): HybridConfig {
    return { ...this.config };
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
      longitude <= 180
    );
  }

  /**
   * Check if coordinates are likely in Ireland (for validation)
   */
  private isLikelyIrishCoordinates(latitude: number, longitude: number): boolean {
    const IRELAND_BOUNDS = {
      north: 55.7,
      south: 51.2,
      east: -5.0,
      west: -11.0,
    };

    return (
      latitude >= IRELAND_BOUNDS.south &&
      latitude <= IRELAND_BOUNDS.north &&
      longitude >= IRELAND_BOUNDS.west &&
      longitude <= IRELAND_BOUNDS.east
    );
  }
}
