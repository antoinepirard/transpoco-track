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
  updateVehicle: (vehicleId: string, update: Partial<Vehicle>) => void;
  selectVehicle: (vehicleId: string | null) => void;
  setViewport: (viewport: MapViewport) => void;
  addTrail: (vehicleId: string, positions: VehiclePosition[]) => void;
  clearTrails: () => void;
  setConnectionStatus: (connected: boolean) => void;
}

export const useFleetStore = create<FleetState>()(
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

    updateVehicle: (vehicleId, update) => {
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, ...update } : vehicle
        ),
        lastUpdate: new Date(),
      }));
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