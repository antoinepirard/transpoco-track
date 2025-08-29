/**
 * Map viewport and trails management
 */

import type { MapViewport, VehiclePosition } from '@/types/fleet';

export interface MapManagerState {
  viewport: MapViewport;
  trails: Record<string, VehiclePosition[]>;
  isConnected: boolean;
  [key: string]: unknown;
}

export interface MapManagerActions {
  setViewport: (viewport: MapViewport) => void;
  addTrail: (vehicleId: string, positions: VehiclePosition[]) => void;
  clearTrails: () => void;
  setConnectionStatus: (connected: boolean) => void;
}

export const createMapManagerSlice = (set: (updates: Partial<MapManagerState> | ((state: MapManagerState) => Partial<MapManagerState>)) => void, get: () => MapManagerState) => ({
  // Initial state
  viewport: {
    latitude: 53.3498,
    longitude: -6.2603,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  },
  trails: {},
  isConnected: false,

  // Actions
  setViewport: (viewport: MapViewport) => {
    const current = get().viewport;
    const latDiff = Math.abs(current.latitude - viewport.latitude);
    const lngDiff = Math.abs(current.longitude - viewport.longitude);
    const zoomDiff = Math.abs((current.zoom ?? 0) - (viewport.zoom ?? 0));
    const bearingDiff = Math.abs(
      (current.bearing ?? 0) - (viewport.bearing ?? 0)
    );
    const pitchDiff = Math.abs((current.pitch ?? 0) - (viewport.pitch ?? 0));

    if (
      latDiff > 0.0001 ||
      lngDiff > 0.0001 ||
      zoomDiff > 0.01 ||
      bearingDiff > 0.1 ||
      pitchDiff > 0.1
    ) {
      set({ viewport });
    }
  },

  addTrail: (vehicleId: string, positions: VehiclePosition[]) => {
    set((state: MapManagerState) => ({
      trails: {
        ...state.trails,
        [vehicleId]: [...(state.trails[vehicleId] || []), ...positions],
      },
    }));
  },

  clearTrails: () => {
    set({ trails: {} });
  },

  setConnectionStatus: (connected: boolean) => {
    set({ isConnected: connected });
  },
});
