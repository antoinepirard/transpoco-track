import type { Vehicle } from '@/types/fleet';

export interface VehicleCluster {
  id: string;
  position: [number, number]; // [longitude, latitude]
  vehicles: Vehicle[];
  count: number;
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
 * Get clustering pixel radius based on zoom level for smart clustering
 */
function getClusteringPixelRadius(zoom: number): number {
  // More aggressive clustering at low zoom, less at high zoom
  if (zoom <= 6) return 80;   // Country level: large clusters (80px)
  if (zoom <= 9) return 60;   // Region level: medium clusters (60px)
  if (zoom <= 12) return 40;  // City level: small clusters (40px)
  if (zoom <= 15) return 25;  // Street level: minimal clusters (25px)
  return 15;                  // Building level: very minimal (15px)
}

/**
 * Get minimum cluster size based on zoom level
 */
function getMinClusterSize(zoom: number): number {
  if (zoom <= 8) return 2;   // Low zoom: cluster any 2+ vehicles
  if (zoom <= 12) return 3;  // Medium zoom: need 3+ vehicles
  if (zoom <= 15) return 4;  // High zoom: need 4+ vehicles  
  return 5;                  // Very high zoom: need 5+ vehicles
}

/**
 * Get clustering radius in meters based on zoom level
 */
function getClusteringRadius(zoom: number): number {
  // Use a representative latitude (Dublin area)
  const representativeLat = 53.35;
  const pixelRadius = getClusteringPixelRadius(zoom);
  return pixelsToMeters(pixelRadius, zoom, representativeLat);
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
 * Group vehicles into clusters based on distance
 */
export function clusterVehicles(
  vehicles: Vehicle[],
  options: Partial<ClusteringOptions> = {}
): ClusteringResult {
  const {
    zoom = 10,
  } = options;

  // Use dynamic parameters based on zoom level
  const minClusterSize = getMinClusterSize(zoom);
  const radiusMeters = getClusteringRadius(zoom);
  
  const clusters: VehicleCluster[] = [];
  const processed = new Set<string>();
  const individualVehicles: Vehicle[] = [];

  vehicles.forEach((vehicle, index) => {
    if (processed.has(vehicle.id)) return;

    // Find all vehicles within clustering radius
    const nearbyVehicles = vehicles.filter((otherVehicle, otherIndex) => {
      if (otherIndex === index || processed.has(otherVehicle.id)) return false;
      
      const distance = calculateDistance(
        vehicle.currentPosition.latitude,
        vehicle.currentPosition.longitude,
        otherVehicle.currentPosition.latitude,
        otherVehicle.currentPosition.longitude
      );
      
      return distance <= radiusMeters;
    });

    // Include the current vehicle in the group
    const vehicleGroup = [vehicle, ...nearbyVehicles];

    if (vehicleGroup.length >= minClusterSize) {
      // Create cluster
      const clusterId = `cluster-${clusters.length}`;
      const centroid = calculateCentroid(vehicleGroup);
      
      clusters.push({
        id: clusterId,
        position: centroid,
        vehicles: vehicleGroup,
        count: vehicleGroup.length,
      });

      // Mark all vehicles in this cluster as processed
      vehicleGroup.forEach(v => processed.add(v.id));
    } else {
      // Add to individual vehicles if not already processed
      if (!processed.has(vehicle.id)) {
        individualVehicles.push(vehicle);
        processed.add(vehicle.id);
      }
    }
  });

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