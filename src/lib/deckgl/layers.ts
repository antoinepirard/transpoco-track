import { IconLayer, PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { Vehicle, VehiclePosition } from '@/types/fleet';
import { 
  clusterVehicles as clusterVehiclesByDistance, 
  getClusterColor, 
  getClusterSize,
  pixelRadiusToMeters,
  type VehicleCluster,
  type ClusteringResult 
} from '@/lib/clustering/vehicleClustering';

export function createVehicleLayer({
  vehicles,
  selectedVehicleId,
  onVehicleClick,
  onVehicleHover,
  showTrails,
  clusterVehicles,
  zoom,
}: {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  showTrails?: boolean;
  clusterVehicles?: boolean;
  zoom?: number;
}) {
  // If clustering is enabled and we have enough vehicles
  if (clusterVehicles && vehicles.length > 10 && zoom !== undefined) {
    // At building level (zoom 16+), disable clustering entirely for precise navigation
    if (zoom >= 16) {
      return createIndividualVehicleLayer({
        vehicles,
        selectedVehicleId,
        onVehicleClick,
        onVehicleHover,
      });
    }

    const clusteringResult = clusterVehiclesByDistance(vehicles, {
      zoom,
    });

    const layers = [];

    // Add cluster markers layer
    if (clusteringResult.clusters.length > 0) {
      layers.push(createVehicleClusterLayer({
        clusters: clusteringResult.clusters,
        onClusterClick: onVehicleClick ? (cluster: VehicleCluster) => {
          // For now, click the first vehicle in the cluster
          // TODO: Show cluster popup or zoom to cluster
          onVehicleClick(cluster.vehicles[0]);
        } : undefined,
        zoom,
      }));
    }

    // Add individual vehicles layer
    if (clusteringResult.individualVehicles.length > 0) {
      layers.push(createIndividualVehicleLayer({
        vehicles: clusteringResult.individualVehicles,
        selectedVehicleId,
        onVehicleClick,
        onVehicleHover,
      }));
    }

    return layers;
  }

  // Fall back to individual vehicles
  return createIndividualVehicleLayer({
    vehicles,
    selectedVehicleId,
    onVehicleClick,
    onVehicleHover,
  });
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
  onClusterClick,
  zoom,
}: {
  clusters: VehicleCluster[];
  onClusterClick?: (cluster: VehicleCluster) => void;
  zoom?: number;
}) {
  return [
    // Cluster background circles
    new ScatterplotLayer({
      id: 'vehicle-clusters-bg',
      data: clusters,
      pickable: true,
      getPosition: (cluster: VehicleCluster) => cluster.position,
      getRadius: (cluster: VehicleCluster) => {
        const pixelSize = getClusterSize(cluster.count);
        // Convert pixel size to meters using cluster position latitude
        return zoom ? pixelRadiusToMeters(pixelSize, zoom, cluster.position[1]) : pixelSize;
      },
      getFillColor: (cluster: VehicleCluster) => getClusterColor(cluster.count),
      getLineColor: [255, 255, 255, 255],
      getLineWidth: 2,
      // Set pixel-based size constraints for consistent visual appearance
      radiusScale: 1,
      radiusMinPixels: 20,  // Minimum size in pixels
      radiusMaxPixels: 80,  // Maximum size in pixels
      onClick: (info) => {
        if (info.object && onClusterClick) {
          onClusterClick(info.object as VehicleCluster);
        }
      },
      updateTriggers: {
        getRadius: [zoom],
        getFillColor: 'count',
      },
    }),
    
    // Cluster count text
    new TextLayer({
      id: 'vehicle-clusters-text',
      data: clusters,
      pickable: false,
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
    }),
  ];
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
      path: trail.map((pos) => [pos.longitude, pos.latitude]),
      vehicleId: trail[0]?.vehicleId,
      color: colors[index % colors.length],
    })),
    pickable: true,
    widthScale: width,
    widthMinPixels: 1,
    widthMaxPixels: 8,
    rounded: true,
    capRounded: true,
    jointRounded: true,
    getPath: (d) => d.path,
    getColor: (d) => {
      if (selectedVehicleId && d.vehicleId === selectedVehicleId) {
        return [255, 107, 107, Math.floor(255 * opacity)];
      }
      const color = hexToRgb(d.color);
      return color
        ? [...color, Math.floor(255 * opacity)]
        : [255, 107, 107, Math.floor(255 * opacity)];
    },
    getWidth: (d) => (d.vehicleId === selectedVehicleId ? width * 1.5 : width),
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
