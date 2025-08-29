import { IconLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import type { Vehicle, VehiclePosition } from '@/types/fleet';

export function createVehicleLayer({
  vehicles,
  selectedVehicleId,
  onVehicleClick,
  onVehicleHover,
}: {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  showTrails?: boolean;
  clusterVehicles?: boolean;
}) {
  return new IconLayer({
    id: 'vehicles',
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
  });
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
