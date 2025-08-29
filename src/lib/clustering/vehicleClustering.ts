import type { Vehicle } from '@/types/fleet';

// Global cluster cache for position stability
let clusterCache = new Map<string, VehicleCluster>();
let cacheTimestamp = 0;

export interface VehicleCluster {
  id: string;
  position: [number, number]; // [longitude, latitude]
  vehicles: Vehicle[];
  count: number;
  hash?: string; // For cluster stability across zoom levels
  previousPosition?: [number, number]; // For smooth transitions
}

export interface ClusteringResult {
  clusters: VehicleCluster[];
  individualVehicles: Vehicle[];
}

export interface ClusteringOptions {
  minClusterSize: number;
  clusterRadius: number; // in pixels at current zoom
  zoom: number;
  pixelsPerMeter: number;
  centerLatitude: number;
  previousZoom?: number; // For hysteresis
}

/**
 * Create a stable hash for a group of vehicles to maintain cluster identity
 */
function createClusterHash(vehicles: Vehicle[]): string {
  // Sort vehicles by ID to ensure consistent hash regardless of order
  const sortedIds = vehicles.map(v => v.id).sort();
  
  // Create a simple hash from the sorted vehicle IDs
  const idsString = sortedIds.join(',');
  let hash = 0;
  for (let i = 0; i < idsString.length; i++) {
    const char = idsString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * Find the most similar existing cluster based on vehicle membership overlap
 */
function findSimilarCluster(vehicles: Vehicle[], existingClusters: VehicleCluster[]): VehicleCluster | null {
  let bestMatch: VehicleCluster | null = null;
  let bestSimilarity = 0;
  const vehicleIds = new Set(vehicles.map(v => v.id));

  for (const cluster of existingClusters) {
    const clusterIds = new Set(cluster.vehicles.map(v => v.id));
    
    // Calculate Jaccard similarity (intersection / union)
    const intersection = new Set([...vehicleIds].filter(id => clusterIds.has(id)));
    const union = new Set([...vehicleIds, ...clusterIds]);
    const similarity = intersection.size / union.size;

    // Require at least 50% similarity to consider it the same cluster
    if (similarity >= 0.5 && similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = cluster;
    }
  }

  return bestMatch;
}

/**
 * Calculate stable position for a cluster, considering previous position
 */
function calculateStablePosition(
  vehicles: Vehicle[], 
  previousPosition?: [number, number],
  stabilityFactor: number = 0.3
): [number, number] {
  const centroid = calculateCentroid(vehicles);
  
  if (!previousPosition) {
    return centroid;
  }

  // Weighted average between new centroid and previous position for stability
  const [prevLng, prevLat] = previousPosition;
  const [newLng, newLat] = centroid;
  
  return [
    prevLng * stabilityFactor + newLng * (1 - stabilityFactor),
    prevLat * stabilityFactor + newLat * (1 - stabilityFactor)
  ];
}

/**
 * Calculate distance between two points in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert pixel distance to meters based on zoom level
 */
function pixelsToMeters(pixels: number, zoom: number, latitude: number): number {
  // Approximate conversion - 1 degree longitude at equator = 111,320 meters
  const metersPerDegree = 111320 * Math.cos((latitude * Math.PI) / 180);
  const degreesPerPixel = 360 / (256 * Math.pow(2, zoom));
  const metersPerPixel = metersPerDegree * degreesPerPixel;
  return pixels * metersPerPixel;
}

/**
 * Get clustering pixel radius based on zoom level for visual overlap detection
 * Very restrictive - only clusters when vehicle icons would actually overlap
 */
function getClusteringPixelRadius(zoom: number): number {
  // Base on vehicle icon size (32-48px) + small padding for visual overlap
  const vehicleIconSize = 32; // Base vehicle icon size in pixels
  const padding = 8; // Small padding to detect near-overlaps
  
  // At very low zoom, allow slightly more generous clustering
  if (zoom <= 6) return vehicleIconSize + padding + 8;  // ~48px - very rare clustering
  if (zoom <= 9) return vehicleIconSize + padding + 4;  // ~44px - rare clustering  
  if (zoom <= 11) return vehicleIconSize + padding;     // ~40px - minimal clustering
  
  // At higher zooms, be very restrictive - only true visual overlaps
  return vehicleIconSize * 0.75; // ~24px - only when icons actually overlap
}

/**
 * Get minimum cluster size based on zoom level with enhanced hysteresis
 */
function getMinClusterSize(zoom: number, previousZoom?: number): number {
  const hysteresis = 0.5; // Increased buffer zone to prevent flickering
  
  // Base thresholds - more restrictive to make clusters rare and stable
  const thresholds = [
    { zoom: 6, size: 3 },   // Very low zoom: need 3+ vehicles to cluster
    { zoom: 9, size: 4 },   // Low zoom: need 4+ vehicles  
    { zoom: 11, size: 5 },  // Medium zoom: need 5+ vehicles
    { zoom: 13, size: 6 },  // High zoom: need 6+ vehicles
  ];
  
  let targetSize = 7; // Default for very high zoom - rare clustering
  
  for (const threshold of thresholds) {
    if (zoom <= threshold.zoom) {
      targetSize = threshold.size;
      break;
    }
  }
  
  // Apply enhanced hysteresis if we have a previous zoom
  if (previousZoom !== undefined) {
    const previousSize = getMinClusterSizeNoHysteresis(previousZoom);
    const zoomDirection = zoom > previousZoom ? 1 : -1;
    
    // Enhanced hysteresis with directional bias
    for (const threshold of thresholds) {
      const distance = Math.abs(zoom - threshold.zoom);
      const directionAdjustedHysteresis = zoomDirection > 0 ? hysteresis * 1.5 : hysteresis;
      
      if (distance < directionAdjustedHysteresis) {
        // Stay with previous size if we're in the buffer zone
        if (previousSize !== targetSize) {
          // Bias towards maintaining existing clusters when zooming in
          if (zoomDirection > 0 && previousSize < targetSize) {
            return previousSize;
          }
          // Bias towards breaking clusters when zooming out
          if (zoomDirection < 0 && previousSize > targetSize) {
            return previousSize;
          }
        }
      }
    }
    
    // Additional stability: if the change is small, keep previous size
    if (Math.abs(targetSize - previousSize) === 1 && Math.abs(zoom - (previousZoom || zoom)) < 1.0) {
      return previousSize;
    }
  }
  
  return targetSize;
}

/**
 * Helper function to get min cluster size without hysteresis
 */
function getMinClusterSizeNoHysteresis(zoom: number): number {
  if (zoom <= 6) return 3;
  if (zoom <= 9) return 4;
  if (zoom <= 11) return 5;
  if (zoom <= 13) return 6;
  return 7;
}

/**
 * Get clustering radius in meters based on zoom level and latitude with stability
 */
function getClusteringRadius(zoom: number, centerLatitude: number = 53.35, previousZoom?: number): number {
  let pixelRadius = getClusteringPixelRadius(zoom);
  
  // Apply radius hysteresis to prevent rapid cluster boundary changes
  if (previousZoom !== undefined) {
    const previousPixelRadius = getClusteringPixelRadius(previousZoom);
    const radiusDiff = Math.abs(pixelRadius - previousPixelRadius);
    
    // If the radius change is small, use interpolation for stability
    if (radiusDiff < 10 && Math.abs(zoom - previousZoom) < 0.5) {
      pixelRadius = (pixelRadius + previousPixelRadius) / 2;
    }
  }
  
  return pixelsToMeters(pixelRadius, zoom, centerLatitude);
}

/**
 * Calculate centroid of a group of vehicles
 */
function calculateCentroid(vehicles: Vehicle[]): [number, number] {
  if (vehicles.length === 0) return [0, 0];
  
  let totalLng = 0;
  let totalLat = 0;
  
  vehicles.forEach(vehicle => {
    totalLng += vehicle.currentPosition.longitude;
    totalLat += vehicle.currentPosition.latitude;
  });
  
  return [
    totalLng / vehicles.length, // longitude
    totalLat / vehicles.length   // latitude
  ];
}

/**
 * Simple spatial grid index for performance optimization
 */
class SpatialGrid {
  private grid: Map<string, Vehicle[]> = new Map();
  private cellSize: number;
  
  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }
  
  private getKey(lat: number, lng: number): string {
    const cellLat = Math.floor(lat / this.cellSize);
    const cellLng = Math.floor(lng / this.cellSize);
    return `${cellLat},${cellLng}`;
  }
  
  insert(vehicle: Vehicle): void {
    const key = this.getKey(
      vehicle.currentPosition.latitude,
      vehicle.currentPosition.longitude
    );
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(vehicle);
  }
  
  getNearbyVehicles(vehicle: Vehicle, radiusMeters: number): Vehicle[] {
    const { latitude, longitude } = vehicle.currentPosition;
    
    // Convert radius to degrees (approximate)
    const radiusDegrees = radiusMeters / 111320; // meters per degree at equator
    
    // Get all cells that might contain vehicles within the radius
    const cellRadius = Math.ceil(radiusDegrees / this.cellSize);
    const centerKey = this.getKey(latitude, longitude);
    const [centerLat, centerLng] = centerKey.split(',').map(Number);
    
    const nearbyVehicles: Vehicle[] = [];
    
    for (let latOffset = -cellRadius; latOffset <= cellRadius; latOffset++) {
      for (let lngOffset = -cellRadius; lngOffset <= cellRadius; lngOffset++) {
        const cellKey = `${centerLat + latOffset},${centerLng + lngOffset}`;
        const cellVehicles = this.grid.get(cellKey) || [];
        
        // Filter by actual distance within the cell
        for (const otherVehicle of cellVehicles) {
          if (otherVehicle.id !== vehicle.id) {
            const distance = calculateDistance(
              latitude,
              longitude,
              otherVehicle.currentPosition.latitude,
              otherVehicle.currentPosition.longitude
            );
            
            if (distance <= radiusMeters) {
              nearbyVehicles.push(otherVehicle);
            }
          }
        }
      }
    }
    
    return nearbyVehicles;
  }
}

/**
 * Group vehicles into clusters using transitive BFS-based clustering (DBSCAN-style)
 */
export function clusterVehicles(
  vehicles: Vehicle[],
  options: Partial<ClusteringOptions> = {}
): ClusteringResult {
  const {
    zoom = 10,
    centerLatitude = 53.35,
    previousZoom,
  } = options;

  // Clean old cache entries (older than 5 seconds)
  const now = Date.now();
  if (now - cacheTimestamp > 5000) {
    clusterCache.clear();
    cacheTimestamp = now;
  }

  // Use dynamic parameters based on zoom level and location
  const minClusterSize = getMinClusterSize(zoom, previousZoom);
  const radiusMeters = getClusteringRadius(zoom, centerLatitude, previousZoom);
  
  const clusters: VehicleCluster[] = [];
  const visited = new Set<string>();
  const individualVehicles: Vehicle[] = [];
  const existingClusters = Array.from(clusterCache.values());

  // Use spatial indexing for performance with large fleets
  const useSpacialIndex = vehicles.length > 50;
  const neighbors = new Map<string, Vehicle[]>();
  
  if (useSpacialIndex) {
    // Use spatial grid for efficient neighbor lookup
    const cellSize = radiusMeters / 111320; // Convert meters to degrees
    const spatialGrid = new SpatialGrid(cellSize);
    
    // Insert all vehicles into the spatial grid
    for (const vehicle of vehicles) {
      spatialGrid.insert(vehicle);
      neighbors.set(vehicle.id, []);
    }
    
    // Find neighbors using spatial indexing
    for (const vehicle of vehicles) {
      const nearbyVehicles = spatialGrid.getNearbyVehicles(vehicle, radiusMeters);
      neighbors.set(vehicle.id, nearbyVehicles);
    }
  } else {
    // Use naive O(n²) approach for small fleets
    for (const vehicle of vehicles) {
      neighbors.set(vehicle.id, []);
    }

    // Pre-compute all neighboring relationships (symmetric)
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle1 = vehicles[i];
      for (let j = i + 1; j < vehicles.length; j++) {
        const vehicle2 = vehicles[j];
        
        const distance = calculateDistance(
          vehicle1.currentPosition.latitude,
          vehicle1.currentPosition.longitude,
          vehicle2.currentPosition.latitude,
          vehicle2.currentPosition.longitude
        );
        
        if (distance <= radiusMeters) {
          neighbors.get(vehicle1.id)?.push(vehicle2);
          neighbors.get(vehicle2.id)?.push(vehicle1);
        }
      }
    }
  }

  // Perform BFS to find connected components (transitive clustering)
  for (const vehicle of vehicles) {
    if (visited.has(vehicle.id)) continue;

    // Start BFS from this unvisited vehicle
    const queue = [vehicle];
    const component: Vehicle[] = [];
    visited.add(vehicle.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);

      // Add all unvisited neighbors to the queue
      const vehicleNeighbors = neighbors.get(current.id) || [];
      for (const neighbor of vehicleNeighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          queue.push(neighbor);
        }
      }
    }

    // Create cluster if component is large enough
    if (component.length >= minClusterSize) {
      const hash = createClusterHash(component);
      const similarCluster = findSimilarCluster(component, existingClusters);
      
      // Use stable position calculation
      const stablePosition = calculateStablePosition(
        component,
        similarCluster?.position,
        0.3 // 30% weight for previous position
      );
      
      const clusterId = similarCluster?.id || `cluster-${hash}`;
      
      const cluster: VehicleCluster = {
        id: clusterId,
        position: stablePosition,
        vehicles: component,
        count: component.length,
        hash,
        previousPosition: similarCluster?.position,
      };
      
      clusters.push(cluster);
      
      // Update cache
      clusterCache.set(hash, cluster);
    } else {
      // Add all vehicles in the small component to individual vehicles
      individualVehicles.push(...component);
    }
  }

  return {
    clusters,
    individualVehicles,
  };
}

/**
 * Get cluster size category for styling
 */
export function getClusterSizeCategory(count: number): 'small' | 'medium' | 'large' | 'xlarge' {
  if (count < 5) return 'small';
  if (count < 10) return 'medium';  
  if (count < 20) return 'large';
  return 'xlarge';
}

/**
 * Get cluster color based on size
 */
export function getClusterColor(count: number): [number, number, number, number] {
  const category = getClusterSizeCategory(count);
  
  switch (category) {
    case 'small': return [76, 175, 80, 200];   // Green
    case 'medium': return [255, 193, 7, 200];  // Amber  
    case 'large': return [255, 152, 0, 200];   // Orange
    case 'xlarge': return [244, 67, 54, 200];  // Red
  }
}

/**
 * Convert pixel radius to meters for DeckGL world coordinates
 */
export function pixelRadiusToMeters(pixelRadius: number, zoom: number, latitude: number = 53.35): number {
  // Web Mercator projection: at zoom level Z, 1 pixel = 156,543.04 / (2^Z) meters at equator
  // Adjust for latitude using cosine correction
  const metersPerPixel = 156543.04 / Math.pow(2, zoom) * Math.cos(latitude * Math.PI / 180);
  return pixelRadius * metersPerPixel;
}

/**
 * Get cluster size in pixels based on vehicle count and zoom level
 */
export function getClusterSize(count: number, zoom?: number): number {
  const category = getClusterSizeCategory(count);
  
  // Base sizes
  let baseSize: number;
  switch (category) {
    case 'small': baseSize = 30; break;
    case 'medium': baseSize = 40; break;
    case 'large': baseSize = 50; break;  
    case 'xlarge': baseSize = 60; break;
  }
  
  // Scale with zoom - maintain consistent visual size
  if (zoom !== undefined) {
    // At zoom 10, use base size. Scale down at higher zoom, up at lower zoom
    const zoomFactor = Math.pow(2, (10 - zoom) * 0.3);
    return Math.max(20, Math.min(100, baseSize * zoomFactor));
  }
  
  return baseSize;
}

// Removed getClusterViewport function - clusters now expand automatically on zoom