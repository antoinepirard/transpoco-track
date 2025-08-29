/**
 * Vehicle state management with normalized storage and memoization
 */

import type { Vehicle } from '@/types/fleet';

export interface VehicleManagerState {
  vehiclesById: Record<string, Vehicle>;
  vehicleIds: string[];
  selectedVehicleId: string | null;
  lastUpdate: number | null;
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

    // Rebuild and cache the array
    const vehiclesArray = state.vehicleIds
      .map((id: string) => state.vehiclesById[id])
      .filter(Boolean);

    // Update cache (use set to update state)
    set((currentState: VehicleManagerState & Record<string, unknown>) => ({
      _vehiclesArray: vehiclesArray,
      _vehiclesArrayVersion: currentState.lastUpdate,
    }));

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

    set({
      vehiclesById,
      vehicleIds,
      lastUpdate: Date.now(),
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

        return {
          vehiclesById,
          vehicleIds,
          lastUpdate: Date.now(),
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
        return {
          vehiclesById: newVehiclesById,
          vehicleIds: newVehicleIds,
          lastUpdate: Date.now(),
        };
      }

      return state; // No changes, return current state
    });
  },

  updateVehicle: (vehicleId: string, update: Partial<Vehicle>) => {
    set((state: VehicleManagerState & Record<string, unknown>) => {
      const existingVehicle = state.vehiclesById[vehicleId];
      if (!existingVehicle) return state;

      return {
        vehiclesById: {
          ...state.vehiclesById,
          [vehicleId]: { ...existingVehicle, ...update },
        },
        lastUpdate: Date.now(),
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

      return {
        vehiclesById: updatedVehiclesById,
        lastUpdate: Date.now(),
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
            ...(state as any).viewport,
            latitude: vehicle.currentPosition.latitude,
            longitude: vehicle.currentPosition.longitude,
            zoom: Math.max((state as any).viewport.zoom, 15),
          },
        }));
      }
    }
  },
});
