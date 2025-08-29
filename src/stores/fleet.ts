import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Vehicle, VehiclePosition, MapViewport } from '@/types/fleet';

interface FleetState {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  viewport: MapViewport;
  trails: Record<string, VehiclePosition[]>;
  isConnected: boolean;
  lastUpdate: Date | null;

  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehiclesIfChanged: (vehicles: Vehicle[]) => void;
  updateVehicle: (vehicleId: string, update: Partial<Vehicle>) => void;
  applyVehicleUpdates: (
    updates: Array<{ vehicleId: string; update: Partial<Vehicle> }>
  ) => void;
  selectVehicle: (vehicleId: string | null) => void;
  setViewport: (viewport: MapViewport) => void;
  addTrail: (vehicleId: string, positions: VehiclePosition[]) => void;
  clearTrails: () => void;
  setConnectionStatus: (connected: boolean) => void;
}

export const useFleetStore = create<FleetState, [["zustand/subscribeWithSelector", never]]>()(
  subscribeWithSelector((set, get) => ({
    vehicles: [],
    selectedVehicleId: null,
    viewport: {
      latitude: 37.7749,
      longitude: -122.4194,
      zoom: 12,
      bearing: 0,
      pitch: 0,
    },
    trails: {},
    isConnected: false,
    lastUpdate: null,

    setVehicles: (vehicles) => {
      set({
        vehicles,
        lastUpdate: new Date(),
      });
    },

    // Smart update that only changes vehicles if their data actually changed
    updateVehiclesIfChanged: (newVehicles: Vehicle[]) => {
      set((state) => {
        // Quick reference check first
        if (state.vehicles === newVehicles) return state;
        
        // If different lengths, definitely changed
        if (state.vehicles.length !== newVehicles.length) {
          return {
            vehicles: newVehicles,
            lastUpdate: new Date(),
          };
        }

        // Check if any vehicle actually changed by comparing position data
        let hasChanges = false;
        for (let i = 0; i < newVehicles.length; i++) {
          const oldVehicle = state.vehicles[i];
          const newVehicle = newVehicles[i];
          
          if (
            !oldVehicle ||
            oldVehicle.id !== newVehicle.id ||
            oldVehicle.currentPosition.latitude !== newVehicle.currentPosition.latitude ||
            oldVehicle.currentPosition.longitude !== newVehicle.currentPosition.longitude ||
            oldVehicle.currentPosition.heading !== newVehicle.currentPosition.heading ||
            oldVehicle.status !== newVehicle.status
          ) {
            hasChanges = true;
            break;
          }
        }

        // Only update if there are actual changes
        if (hasChanges) {
          return {
            vehicles: newVehicles,
            lastUpdate: new Date(),
          };
        }

        return state; // No changes, return current state
      });
    },

    updateVehicle: (vehicleId, update) => {
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, ...update } : vehicle
        ),
        lastUpdate: new Date(),
      }));
    },

    applyVehicleUpdates: (updates) => {
      set((state) => {
        const vehicleMap = new Map(state.vehicles.map((v) => [v.id, v]));

        for (const { vehicleId, update } of updates) {
          const vehicle = vehicleMap.get(vehicleId);
          if (vehicle) {
            vehicleMap.set(vehicleId, { ...vehicle, ...update });
          }
        }

        return {
          vehicles: Array.from(vehicleMap.values()),
          lastUpdate: new Date(),
        };
      });
    },

    selectVehicle: (vehicleId) => {
      set({ selectedVehicleId: vehicleId });

      if (vehicleId) {
        const vehicle = get().vehicles.find((v) => v.id === vehicleId);
        if (vehicle) {
          set({
            viewport: {
              ...get().viewport,
              latitude: vehicle.currentPosition.latitude,
              longitude: vehicle.currentPosition.longitude,
              zoom: Math.max(get().viewport.zoom, 15),
            },
          });
        }
      }
    },

    setViewport: (viewport) => {
      set({ viewport });
    },

    addTrail: (vehicleId, positions) => {
      set((state) => ({
        trails: {
          ...state.trails,
          [vehicleId]: [...(state.trails[vehicleId] || []), ...positions],
        },
      }));
    },

    clearTrails: () => {
      set({ trails: {} });
    },

    setConnectionStatus: (connected) => {
      set({ isConnected: connected });
    },
  }))
);
