import { create } from 'zustand';
import type { Vehicle, VehiclePosition, MapViewport } from '@/types/fleet';
import {
  getRoutingService,
  type RoutingService,
  RoutingUtils,
} from '@/lib/routing';

interface FleetState {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  viewport: MapViewport;
  trails: Record<string, VehiclePosition[]>;
  isConnected: boolean;
  lastUpdate: Date | null;
  routingService: RoutingService;
  routingEnabled: boolean;

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

  // Enhanced routing methods
  snapVehicleToRoad: (vehicleId: string) => Promise<boolean>;
  updateVehicleWithRoadSnapping: (
    vehicleId: string,
    latitude: number,
    longitude: number,
    heading?: number
  ) => Promise<void>;
  enableRouting: (enabled: boolean) => void;
  getRoutingServiceHealth: () => Record<string, boolean>;
}

export const useFleetStore = create<FleetState>()((set, get) => ({
  vehicles: [],
  selectedVehicleId: null,
  viewport: {
    latitude: 53.3498,
    longitude: -6.2603,
    zoom: 10,
    bearing: 0,
    pitch: 0,
  },
  trails: {},
  isConnected: false,
  lastUpdate: null,
  routingService: getRoutingService(),
  routingEnabled: true,

  setVehicles: (vehicles: Vehicle[]) => {
    set({
      vehicles,
      lastUpdate: new Date(),
    });
  },

  // Smart update that only changes vehicles if their data actually changed
  updateVehiclesIfChanged: (newVehicles: Vehicle[]) => {
    set((state: FleetState) => {
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
          oldVehicle.currentPosition.latitude !==
            newVehicle.currentPosition.latitude ||
          oldVehicle.currentPosition.longitude !==
            newVehicle.currentPosition.longitude ||
          oldVehicle.currentPosition.heading !==
            newVehicle.currentPosition.heading ||
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

  updateVehicle: (vehicleId: string, update: Partial<Vehicle>) => {
    set((state: FleetState) => ({
      vehicles: state.vehicles.map((vehicle: Vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, ...update } : vehicle
      ),
      lastUpdate: new Date(),
    }));
  },

  applyVehicleUpdates: (
    updates: Array<{ vehicleId: string; update: Partial<Vehicle> }>
  ) => {
    set((state: FleetState) => {
      const vehicleMap = new Map(state.vehicles.map((v: Vehicle) => [v.id, v]));

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

  selectVehicle: (vehicleId: string | null) => {
    set({ selectedVehicleId: vehicleId });

    if (vehicleId) {
      const vehicle = get().vehicles.find((v: Vehicle) => v.id === vehicleId);
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
    set((state: FleetState) => ({
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

  // Enhanced routing methods
  snapVehicleToRoad: async (vehicleId: string): Promise<boolean> => {
    const state = get();
    if (!state.routingEnabled) return false;

    const vehicle = state.vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return false;

    try {
      const snapResult = await state.routingService.snapToRoad(
        vehicle.currentPosition.latitude,
        vehicle.currentPosition.longitude,
        { radiusMeters: 100 }
      );

      // Update vehicle with snapped coordinates
      // snapResult.location is [longitude, latitude] from Mapbox format
      const updatedPosition: VehiclePosition = {
        ...vehicle.currentPosition,
        latitude: snapResult.location[1], // latitude is at index 1
        longitude: snapResult.location[0], // longitude is at index 0
        heading: snapResult.heading || vehicle.currentPosition.heading,
        timestamp: new Date(),
        accuracy: Math.min(
          vehicle.currentPosition.accuracy || 10,
          snapResult.distance
        ),
      };

      set((state) => ({
        vehicles: state.vehicles.map((v) =>
          v.id === vehicleId
            ? { ...v, currentPosition: updatedPosition, lastUpdate: new Date() }
            : v
        ),
        lastUpdate: new Date(),
      }));

      return true;
    } catch (error) {
      console.warn(`Failed to snap vehicle ${vehicleId} to road:`, error);
      return false;
    }
  },

  updateVehicleWithRoadSnapping: async (
    vehicleId: string,
    latitude: number,
    longitude: number,
    heading?: number
  ): Promise<void> => {
    const state = get();

    // Validate coordinates before processing
    if (!RoutingUtils.isValidCoordinates(latitude, longitude)) {
      console.warn(`Invalid coordinates for vehicle ${vehicleId}:`, { latitude, longitude });
      return;
    }

    // Check for potential coordinate swap (especially for Ireland)
    const swapCheck = RoutingUtils.detectCoordinateSwap(latitude, longitude);
    if (swapCheck.isSwapped) {
      console.warn(`Detected coordinate swap for vehicle ${vehicleId}, correcting`, {
        original: { latitude, longitude },
        corrected: { latitude: swapCheck.correctedLatitude, longitude: swapCheck.correctedLongitude }
      });
      latitude = swapCheck.correctedLatitude;
      longitude = swapCheck.correctedLongitude;
    }

    // Get previous position for two-point map matching
    const previousVehicle = state.vehicles.find((v) => v.id === vehicleId);
    const previousPosition = previousVehicle?.currentPosition;

    // First update with raw coordinates
    const rawPosition: VehiclePosition = {
      id: `pos-${vehicleId}-${Date.now()}`,
      vehicleId,
      latitude,
      longitude,
      heading: heading || 0,
      timestamp: new Date(),
      speed: 0,
      ignition: true,
    };

    // Update vehicle with raw position first
    set((currentState) => ({
      vehicles: currentState.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, currentPosition: rawPosition, lastUpdate: new Date() }
          : v
      ),
      lastUpdate: new Date(),
    }));

    // Then try to snap to road if routing is enabled
    if (state.routingEnabled) {
      try {
        let snappedLng = longitude;
        let snappedLat = latitude;
        let snappedHeading = heading || 0;
        let confidence = 0;

        // Use two-point map matching if we have a previous position
        if (previousPosition) {
          const matchResult = await state.routingService.matchToRoads(
            [
              [previousPosition.longitude, previousPosition.latitude],
              [longitude, latitude],
            ],
            { radiusMeters: 100, geometries: 'geojson' }
          );

          if (
            matchResult.matchedCoordinates?.length >= 2 &&
            matchResult.confidence > 0.6
          ) {
            const lastPoint =
              matchResult.matchedCoordinates[
                matchResult.matchedCoordinates.length - 1
              ];
            const prevPoint =
              matchResult.matchedCoordinates[
                matchResult.matchedCoordinates.length - 2
              ];

            // lastPoint is [longitude, latitude] from Mapbox format
            snappedLng = lastPoint[0]; // longitude is at index 0
            snappedLat = lastPoint[1]; // latitude is at index 1
            // Calculate heading from the road segment direction
            // prevPoint is also [longitude, latitude]
            snappedHeading = RoutingUtils.calculateBearing(
              prevPoint[1], // previous latitude
              prevPoint[0], // previous longitude
              snappedLat,   // current latitude
              snappedLng    // current longitude
            );
            confidence = matchResult.confidence;
          }
        }

        // Fall back to single-point snapping if two-point matching failed or no previous position
        if (!previousPosition || confidence <= 0.6) {
          const snapResult = await state.routingService.snapToRoad(
            latitude,
            longitude,
            { radiusMeters: 100 }
          );

          if (
            snapResult.confidence &&
            snapResult.confidence > 0.25 &&
            snapResult.distance < 200
          ) {
            // snapResult.location is [longitude, latitude] from Mapbox format
            snappedLng = snapResult.location[0]; // longitude is at index 0
            snappedLat = snapResult.location[1]; // latitude is at index 1
            snappedHeading = snapResult.heading || heading || 0;
            confidence = snapResult.confidence;
          }
        }

        // Debug logging for confidence analysis
        console.log(`🎯 Vehicle ${vehicleId} road snapping result:`, {
          originalCoords: { latitude, longitude },
          snappedCoords: { latitude: snappedLat, longitude: snappedLng },
          confidence,
          confidenceSource: confidence > 0.6 ? 'two-point' : 'single-point',
          willUseSnapped: confidence > 0.3, // Lowered threshold for testing
          distance: RoutingUtils.calculateDistance(longitude, latitude, snappedLng, snappedLat)
        });

        // Lowered confidence threshold for testing - many Dublin roads have low confidence
        if (confidence > 0.3) {
          const snappedPosition: VehiclePosition = {
            ...rawPosition,
            latitude: snappedLat,
            longitude: snappedLng,
            heading: snappedHeading,
            accuracy: undefined, // Clear accuracy since this is now road-snapped
          };

          console.log(`✅ Using road-snapped position for vehicle ${vehicleId}`);

          set((currentState) => ({
            vehicles: currentState.vehicles.map((v) =>
              v.id === vehicleId
                ? {
                    ...v,
                    currentPosition: snappedPosition,
                    lastUpdate: new Date(),
                  }
                : v
            ),
            lastUpdate: new Date(),
          }));
        } else {
          console.warn(`⚠️ Low confidence (${confidence}) for vehicle ${vehicleId}, using raw coordinates`);
        }
      } catch (error) {
        console.debug(
          `Road snapping failed for vehicle ${vehicleId}, using raw coordinates:`,
          error
        );
        // Continue with raw coordinates - this is not a critical error
      }
    }
  },

  enableRouting: (enabled: boolean) => {
    set({ routingEnabled: enabled });

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Routing ${enabled ? 'enabled' : 'disabled'} for fleet tracking`
      );
    }
  },

  getRoutingServiceHealth: () => {
    const state = get();

    // Check if routing service has health check method
    if ('getServiceHealth' in state.routingService) {
      return (
        state.routingService as {
          getServiceHealth: () => Record<string, boolean>;
        }
      ).getServiceHealth();
    }

    // Fallback for services without health check
    return {
      local: true,
      mapbox: false,
      hybrid: state.routingEnabled,
    };
  },
}));
