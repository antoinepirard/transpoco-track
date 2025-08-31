import {
  IconLayer,
  PathLayer,
  ScatterplotLayer,
  TextLayer,
} from '@deck.gl/layers';
import type { Vehicle, VehiclePosition } from '@/types/fleet';
import {
  clusterVehicles as clusterVehiclesByDistance,
  getClusterColor,
  getClusterSize,
  pixelRadiusToMeters,
  type VehicleCluster,
} from '@/lib/clustering/vehicleClustering';

export function createVehicleLayer({
  vehicles,
  selectedVehicleId,
  onVehicleClick,
  onVehicleHover,
  clusterVehicles,
  zoom,
  centerLatitude,
  previousZoom,
}: {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  clusterVehicles?: boolean;
  zoom?: number;
  centerLatitude?: number;
  previousZoom?: number;
}) {
  // ALWAYS create individual vehicle layer first - vehicles never move from GPS positions
  const individualVehicleLayer = createIndividualVehicleLayer({
    vehicles,
    selectedVehicleId,
    onVehicleClick,
    onVehicleHover,
  });

  // If clustering is enabled, add cluster overlays WITHOUT affecting vehicle positions
  if (clusterVehicles && zoom !== undefined) {
    // Enhanced transition zone for smooth layer switching
    const clusteringThreshold = 12;
    const transitionZone = 0.5;

    // At street/building level (zoom 12+), only show individual vehicles
    if (zoom >= clusteringThreshold + transitionZone) {
      return individualVehicleLayer;
    }

    // In transition zone, prefer previous state for stability
    if (
      previousZoom !== undefined &&
      zoom >= clusteringThreshold - transitionZone &&
      zoom <= clusteringThreshold + transitionZone
    ) {
      if (previousZoom >= clusteringThreshold) {
        return individualVehicleLayer;
      }
    }

    const clusteringResult = clusterVehiclesByDistance(vehicles, {
      zoom,
      centerLatitude,
      previousZoom,
    });

    const layers = [];

    // Always add individual vehicles at their exact GPS positions
    layers.push(individualVehicleLayer);

    // Add cluster overlays only when there are actually clusters
    if (clusteringResult.clusters.length > 0) {
      // Hide individual vehicles that are part of clusters
      const clusteredVehicleIds = new Set(
        clusteringResult.clusters.flatMap(cluster => cluster.vehicles.map(v => v.id))
      );
      
      // Create filtered individual vehicle layer (only non-clustered vehicles)
      const nonClusteredVehicles = vehicles.filter(v => !clusteredVehicleIds.has(v.id));
      
      layers.splice(0, 1); // Remove the full individual vehicle layer
      
      // Add non-clustered individual vehicles
      if (nonClusteredVehicles.length > 0) {
        layers.push(
          createIndividualVehicleLayer({
            vehicles: nonClusteredVehicles,
            selectedVehicleId,
            onVehicleClick,
            onVehicleHover,
          })
        );
      }
      
      // Add cluster visual overlays
      layers.push(
        createVehicleClusterLayer({
          clusters: clusteringResult.clusters,
          zoom,
        })
      );
    }

    return layers;
  }

  // Fall back to individual vehicles only
  return individualVehicleLayer;
}

/**
 * Create layer for individual vehicles (non-clustered)
 */
function createIndividualVehicleLayer({
  vehicles,
  selectedVehicleId,
  onVehicleClick,
  onVehicleHover,
}: {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
}) {
  return new IconLayer({
    id: 'individual-vehicles',
    data: vehicles,
    pickable: true,
    getId: (vehicle: Vehicle) => vehicle.id,
    getIcon: (vehicle: Vehicle) => ({
      url: getVehicleIconUrl(vehicle),
      width: 128,
      height: 128,
      anchorY: 128,
    }),
    getPosition: (vehicle: Vehicle) => [
      vehicle.currentPosition.longitude,
      vehicle.currentPosition.latitude,
    ],
    getSize: (vehicle: Vehicle) => (vehicle.id === selectedVehicleId ? 48 : 32),
    getAngle: (vehicle: Vehicle) => -vehicle.currentPosition.heading,
    onClick: (info) => {
      if (info.object && onVehicleClick) {
        onVehicleClick(info.object as Vehicle);
      }
    },
    onHover: (info) => {
      if (onVehicleHover) {
        onVehicleHover(info.object as Vehicle | null);
      }
    },
    updateTriggers: {
      getSize: selectedVehicleId,
    },
    // Remove position transitions to prevent GPS coordinate movement
    transitions: {
      getAngle: {
        duration: 400,
        easing: (t: number) => t * t * (3 - 2 * t), // Smooth ease-in-out
      },
      getSize: {
        duration: 300,
        easing: (t: number) => t,
      },
    },
    parameters: {
      depthTest: false,
      depthMask: false,
    },
  });
}

/**
 * Create layer for vehicle clusters
 */
function createVehicleClusterLayer({
  clusters,
  zoom,
}: {
  clusters: VehicleCluster[];
  zoom?: number;
}) {
  return [
    // Cluster background circles
    new ScatterplotLayer({
      id: 'vehicle-clusters-bg',
      data: clusters,
      pickable: false, // Clusters are purely visual - no interaction
      getId: (cluster: VehicleCluster) => cluster.id,
      getPosition: (cluster: VehicleCluster) => cluster.position,
      getRadius: (cluster: VehicleCluster) => {
        const pixelSize = getClusterSize(cluster.count);
        // Convert pixel size to meters using cluster position latitude
        return zoom
          ? pixelRadiusToMeters(pixelSize, zoom, cluster.position[1])
          : pixelSize;
      },
      getFillColor: (cluster: VehicleCluster) => getClusterColor(cluster.count),
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 2,
      // Set pixel-based size constraints for consistent visual appearance
      radiusScale: 1,
      radiusMinPixels: 20, // Minimum size in pixels
      radiusMaxPixels: 80, // Maximum size in pixels
      // No interaction - clusters are purely visual indicators
      updateTriggers: {
        getRadius: [zoom],
        getFillColor: 'count',
      },
      transitions: {
        getPosition: {
          duration: 600,
          easing: (t: number) => t * (2 - t), // Ease-out quadratic
        },
        getRadius: {
          duration: 600,
          easing: (t: number) => t * (2 - t),
        },
        getFillColor: {
          duration: 300,
          easing: (t: number) => t,
        },
      },
    }),

    // Cluster count text
    new TextLayer({
      id: 'vehicle-clusters-text',
      data: clusters,
      pickable: false,
      getId: (cluster: VehicleCluster) => `${cluster.id}-text`,
      getPosition: (cluster: VehicleCluster) => cluster.position,
      getText: (cluster: VehicleCluster) => cluster.count.toString(),
      getSize: (cluster: VehicleCluster) => {
        const baseSize = getClusterSize(cluster.count, zoom);
        return Math.max(12, baseSize * 0.4);
      },
      getColor: [255, 255, 255, 255],
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      parameters: {
        depthTest: false,
      },
      updateTriggers: {
        getSize: [zoom],
      },
      transitions: {
        getPosition: {
          duration: 600,
          easing: (t: number) => t * (2 - t), // Match cluster position transitions
        },
        getSize: {
          duration: 600,
          easing: (t: number) => t * (2 - t),
        },
        getColor: {
          duration: 300,
          easing: (t: number) => t,
        },
      },
    }),
  ];
}

interface TrailData {
  id: string;
  path: Array<[number, number]>;
  vehicleId?: string;
  color: string;
}

export function createTrailLayer({
  trails,
  selectedVehicleId,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  width = 3,
  opacity = 0.8,
}: {
  trails: VehiclePosition[][];
  selectedVehicleId?: string;
  colors?: string[];
  width?: number;
  opacity?: number;
}) {
  return new PathLayer({
    id: 'trails',
    data: trails.map((trail, index) => ({
      id: `trail-${trail[0]?.vehicleId || index}`,
      path: trail.map((pos) => [pos.longitude, pos.latitude]),
      vehicleId: trail[0]?.vehicleId,
      color: colors[index % colors.length],
    })),
    pickable: true,
    getId: (d: TrailData) => d.id,
    widthScale: width,
    widthMinPixels: 1,
    widthMaxPixels: 8,
    rounded: true,
    capRounded: true,
    jointRounded: true,
    getPath: (d: TrailData) => d.path,
    getColor: (d: TrailData) => {
      if (selectedVehicleId && d.vehicleId === selectedVehicleId) {
        return [255, 107, 107, Math.floor(255 * opacity)];
      }
      const color = hexToRgb(d.color);
      return color
        ? [...color, Math.floor(255 * opacity)]
        : [255, 107, 107, Math.floor(255 * opacity)];
    },
    getWidth: (d: TrailData) =>
      d.vehicleId === selectedVehicleId ? width * 1.5 : width,
    updateTriggers: {
      getColor: selectedVehicleId,
      getWidth: selectedVehicleId,
    },
  });
}

export function createHeatmapLayer(positions: VehiclePosition[]) {
  return new ScatterplotLayer({
    id: 'heatmap',
    data: positions,
    pickable: false,
    opacity: 0.6,
    stroked: false,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    getPosition: (pos: VehiclePosition) => [pos.longitude, pos.latitude],
    getRadius: () => 50,
    getFillColor: () => [255, 140, 0, 160],
  });
}

function getVehicleIconUrl(vehicle: Vehicle): string {
  const baseUrl = '/icons/vehicles';
  // Simplified: only use active or inactive based on status
  const isActive = vehicle.status === 'active';
  return `${baseUrl}/${isActive ? 'active' : 'inactive'}.svg`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}
