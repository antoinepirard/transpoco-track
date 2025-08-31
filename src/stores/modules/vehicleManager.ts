/**
 * Vehicle state management with normalized storage and memoization
 */

import type { Vehicle } from '@/types/fleet';

interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface VehicleManagerState {
  vehiclesById: Record<string, Vehicle>;
  vehicleIds: string[];
  selectedVehicleId: string | null;
  lastUpdate: number | null;
  _vehiclesArray?: Vehicle[];
  _vehiclesArrayVersion?: number | null;
  viewport: Viewport;
  [key: string]: unknown;
}

export interface VehicleManagerActions {
  getVehicles: () => Vehicle[];
  getVehicle: (vehicleId: string) => Vehicle | undefined;
  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehiclesIfChanged: (vehicles: Vehicle[]) => void;
  updateVehicle: (vehicleId: string, update: Partial<Vehicle>) => void;
  applyVehicleUpdates: (
    updates: Array<{ vehicleId: string; update: Partial<Vehicle> }>
  ) => void;
  selectVehicle: (vehicleId: string | null) => void;
}

export const createVehicleManagerSlice = (set: (updates: Record<string, unknown> | ((state: VehicleManagerState & Record<string, unknown>) => Record<string, unknown>)) => void, get: () => VehicleManagerState & Record<string, unknown>) => ({
  // Initial state
  vehiclesById: {},
  vehicleIds: [],
  selectedVehicleId: null,
  lastUpdate: null,
  viewport: {
    latitude: 53.35,
    longitude: -6.26,
    zoom: 10,
  },

  // Getters with memoization
  getVehicles: () => {
    const state = get();
    // Return cached array if it's still valid
    if (
      state._vehiclesArrayVersion === state.lastUpdate &&
      state._vehiclesArray
    ) {
      return state._vehiclesArray;
    }

    // Rebuild the array (without updating state during render)
    const vehiclesArray = state.vehicleIds
      .map((id: string) => state.vehiclesById[id])
      .filter(Boolean);

    return vehiclesArray;
  },

  getVehicle: (vehicleId: string) => {
    return get().vehiclesById[vehicleId];
  },

  // Setters
  setVehicles: (vehicles: Vehicle[]) => {
    const vehiclesById: Record<string, Vehicle> = {};
    const vehicleIds: string[] = [];

    vehicles.forEach((vehicle) => {
      vehiclesById[vehicle.id] = vehicle;
      vehicleIds.push(vehicle.id);
    });

    const timestamp = Date.now();
    set({
      vehiclesById,
      vehicleIds,
      lastUpdate: timestamp,
      _vehiclesArray: vehicles,
      _vehiclesArrayVersion: timestamp,
    });
  },

  // Smart update that only changes vehicles if their data actually changed
  updateVehiclesIfChanged: (newVehicles: Vehicle[]) => {
    set((state: VehicleManagerState & Record<string, unknown>) => {
      // If different lengths, definitely changed
      if (state.vehicleIds.length !== newVehicles.length) {
        const vehiclesById: Record<string, Vehicle> = {};
        const vehicleIds: string[] = [];

        newVehicles.forEach((vehicle) => {
          vehiclesById[vehicle.id] = vehicle;
          vehicleIds.push(vehicle.id);
        });

        const timestamp = Date.now();
        return {
          vehiclesById,
          vehicleIds,
          lastUpdate: timestamp,
          _vehiclesArray: newVehicles,
          _vehiclesArrayVersion: timestamp,
        };
      }

      // Check if any vehicle actually changed by comparing key position data
      let hasChanges = false;
      const newVehiclesById: Record<string, Vehicle> = {};
      const newVehicleIds: string[] = [];

      for (const newVehicle of newVehicles) {
        newVehiclesById[newVehicle.id] = newVehicle;
        newVehicleIds.push(newVehicle.id);

        const oldVehicle = state.vehiclesById[newVehicle.id];

        if (
          !oldVehicle ||
          oldVehicle.currentPosition.latitude !==
            newVehicle.currentPosition.latitude ||
          oldVehicle.currentPosition.longitude !==
            newVehicle.currentPosition.longitude ||
          oldVehicle.currentPosition.heading !==
            newVehicle.currentPosition.heading ||
          oldVehicle.status !== newVehicle.status
        ) {
          hasChanges = true;
        }
      }

      // Only update if there are actual changes
      if (hasChanges) {
        const timestamp = Date.now();
        return {
          vehiclesById: newVehiclesById,
          vehicleIds: newVehicleIds,
          lastUpdate: timestamp,
          _vehiclesArray: newVehicles,
          _vehiclesArrayVersion: timestamp,
        };
      }

      return state; // No changes, return current state
    });
  },

  updateVehicle: (vehicleId: string, update: Partial<Vehicle>) => {
    set((state: VehicleManagerState & Record<string, unknown>) => {
      const existingVehicle = state.vehiclesById[vehicleId];
      if (!existingVehicle) return state;

      const timestamp = Date.now();
      return {
        vehiclesById: {
          ...state.vehiclesById,
          [vehicleId]: { ...existingVehicle, ...update },
        },
        lastUpdate: timestamp,
        // Invalidate cache since data changed
        _vehiclesArray: undefined,
        _vehiclesArrayVersion: undefined,
      };
    });
  },

  applyVehicleUpdates: (
    updates: Array<{ vehicleId: string; update: Partial<Vehicle> }>
  ) => {
    set((state: VehicleManagerState & Record<string, unknown>) => {
      const updatedVehiclesById = { ...state.vehiclesById };
      let hasChanges = false;

      for (const { vehicleId, update } of updates) {
        const vehicle = updatedVehiclesById[vehicleId];
        if (vehicle) {
          updatedVehiclesById[vehicleId] = { ...vehicle, ...update };
          hasChanges = true;
        }
      }

      if (!hasChanges) return state;

      const timestamp = Date.now();
      return {
        vehiclesById: updatedVehiclesById,
        lastUpdate: timestamp,
        // Invalidate cache since data changed
        _vehiclesArray: undefined,
        _vehiclesArrayVersion: undefined,
      };
    });
  },

  selectVehicle: (vehicleId: string | null) => {
    set({ selectedVehicleId: vehicleId });

    if (vehicleId) {
      const vehicle = get().vehiclesById[vehicleId];
      if (vehicle) {
        set((state: VehicleManagerState & Record<string, unknown>) => ({
          viewport: {
            ...state.viewport,
            latitude: vehicle.currentPosition.latitude,
            longitude: vehicle.currentPosition.longitude,
            zoom: Math.max(state.viewport.zoom, 15),
          },
        }));
      }
    }
  },
});
