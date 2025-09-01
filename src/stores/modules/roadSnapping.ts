/**
 * Road snapping functionality with throttling and caching
 */

import type { VehiclePosition } from '@/types/fleet';
import { RoutingUtils, type RoutingService } from '@/lib/routing';

export interface RoadSnappingState {
  routingService: RoutingService;
  routingEnabled: boolean;
  [key: string]: unknown;
}

export interface RoadSnappingActions {
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

import type { Vehicle } from '@/types/fleet';
import type { SnapCacheEntry } from './cacheManager';


interface FleetState {
  vehiclesById: Record<string, Vehicle>;
  vehicleIds: string[];
  trails: Record<string, VehiclePosition[]>;
  lastSnapTimes: Record<string, number>;
  _pendingSnaps: Set<string>;
  lastUpdate: number | null;
  routingEnabled: boolean;
  isVehiclePending?: (vehicleId: string) => boolean;
  getSnapCache?: (latitude: number, longitude: number) => SnapCacheEntry | undefined;
  addPendingSnap?: (vehicleId: string) => void;
  removePendingSnap?: (vehicleId: string) => void;
  addSnapCache: (latitude: number, longitude: number, entry: Omit<SnapCacheEntry, 'timestamp'>) => void;
}

export const createRoadSnappingSlice = (set: (updates: Partial<FleetState> | ((state: RoadSnappingState & FleetState) => Partial<FleetState>)) => void, get: () => RoadSnappingState & FleetState) => ({
  // Actions
  snapVehicleToRoad: async (vehicleId: string): Promise<boolean> => {
    const state = get();
    if (!state.routingEnabled) return false;

    const vehicle = state.vehiclesById[vehicleId];
    if (!vehicle) return false;

    try {
      const snapResult = await state.routingService.snapToRoad(
        vehicle.currentPosition.latitude,
        vehicle.currentPosition.longitude,
        { radiusMeters: 100 }
      );

      // Update vehicle with snapped coordinates
      const updatedPosition: VehiclePosition = {
        ...vehicle.currentPosition,
        latitude: snapResult.location[1], // latitude is at index 1
        longitude: snapResult.location[0], // longitude is at index 0
        heading: snapResult.heading || vehicle.currentPosition.heading,
        timestamp: Date.now(),
        accuracy: Math.min(
          vehicle.currentPosition.accuracy || 10,
          snapResult.distance
        ),
      };

      set((state: FleetState) => ({
        vehiclesById: {
          ...state.vehiclesById,
          [vehicleId]: {
            ...state.vehiclesById[vehicleId],
            currentPosition: updatedPosition,
            lastUpdate: Date.now(),
          },
        },
        lastUpdate: Date.now(),
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
      console.warn(`Invalid coordinates for vehicle ${vehicleId}:`, {
        latitude,
        longitude,
      });
      return;
    }

    // Throttle road snapping: only snap once every 3 seconds per vehicle
    const now = Date.now();
    const lastSnapTime = state.lastSnapTimes?.[vehicleId] || 0;
    const SNAP_THROTTLE_MS = 3000;

    const shouldThrottle = now - lastSnapTime < SNAP_THROTTLE_MS;

    // Check if there's already a pending snap for this vehicle (prevent race conditions)
    if (state.isVehiclePending?.(vehicleId)) {
      // Just update with raw position and return
      const rawPosition: VehiclePosition = {
        id: `pos-${vehicleId}-${Date.now()}`,
        vehicleId,
        latitude,
        longitude,
        heading: heading || 0,
        timestamp: Date.now(),
        speed: 0,
        ignition: true,
      };

      set((currentState: FleetState) => {
        const isNewVehicle = !currentState.vehiclesById[vehicleId];
        const updatedVehicleIds = isNewVehicle 
          ? [...currentState.vehicleIds, vehicleId]
          : currentState.vehicleIds;
        
        return {
          vehiclesById: {
            ...currentState.vehiclesById,
            [vehicleId]: {
              ...currentState.vehiclesById[vehicleId],
              id: vehicleId, // Ensure ID is set
              currentPosition: rawPosition,
              lastUpdate: Date.now(),
            },
          },
          vehicleIds: updatedVehicleIds,
          lastUpdate: Date.now(),
        };
      });
      return;
    }

    // Check for potential coordinate swap (especially for Ireland)
    const swapCheck = RoutingUtils.detectCoordinateSwap(latitude, longitude);
    if (swapCheck.isSwapped) {
      console.warn(
        `Detected coordinate swap for vehicle ${vehicleId}, correcting`,
        {
          original: { latitude, longitude },
          corrected: {
            latitude: swapCheck.correctedLatitude,
            longitude: swapCheck.correctedLongitude,
          },
        }
      );
      latitude = swapCheck.correctedLatitude;
      longitude = swapCheck.correctedLongitude;
    }

    // Get previous position for two-point map matching
    const previousVehicle = state.vehiclesById[vehicleId];
    const previousPosition = previousVehicle?.currentPosition;

    // Use cached snap result if available and throttled
    const cachedSnap = state.getSnapCache?.(latitude, longitude);
    if (cachedSnap && shouldThrottle) {
      const snappedPosition: VehiclePosition = {
        id: `pos-${vehicleId}-${Date.now()}`,
        vehicleId,
        latitude: cachedSnap.location[1],
        longitude: cachedSnap.location[0],
        heading: cachedSnap.heading || heading || 0,
        timestamp: Date.now(),
        speed: 0,
        ignition: true,
      };

      set((currentState: FleetState) => {
        const isNewVehicle = !currentState.vehiclesById[vehicleId];
        const updatedVehicleIds = isNewVehicle 
          ? [...currentState.vehicleIds, vehicleId]
          : currentState.vehicleIds;
        
        return {
          vehiclesById: {
            ...currentState.vehiclesById,
            [vehicleId]: {
              ...currentState.vehiclesById[vehicleId],
              id: vehicleId, // Ensure ID is set
              currentPosition: snappedPosition,
              lastUpdate: Date.now(),
            },
          },
          vehicleIds: updatedVehicleIds,
          trails: {
            ...currentState.trails,
            [vehicleId]: [
              ...(currentState.trails?.[vehicleId] || []),
              snappedPosition,
            ].slice(-100),
          },
          lastUpdate: Date.now(),
        };
      });
      return;
    }

    // If throttled but no cache, just use raw coordinates
    if (shouldThrottle) {
      const rawPosition: VehiclePosition = {
        id: `pos-${vehicleId}-${Date.now()}`,
        vehicleId,
        latitude,
        longitude,
        heading: heading || 0,
        timestamp: Date.now(),
        speed: 0,
        ignition: true,
      };

      set((currentState: FleetState) => {
        const isNewVehicle = !currentState.vehiclesById[vehicleId];
        const updatedVehicleIds = isNewVehicle 
          ? [...currentState.vehicleIds, vehicleId]
          : currentState.vehicleIds;
        
        return {
          vehiclesById: {
            ...currentState.vehiclesById,
            [vehicleId]: {
              ...currentState.vehiclesById[vehicleId],
              id: vehicleId, // Ensure ID is set
              currentPosition: rawPosition,
              lastUpdate: Date.now(),
            },
          },
          vehicleIds: updatedVehicleIds,
          trails: {
            ...currentState.trails,
            [vehicleId]: [
              ...(currentState.trails?.[vehicleId] || []),
              rawPosition,
            ].slice(-100),
          },
          lastUpdate: Date.now(),
        };
      });
      return;
    }

    // Proceed with road snapping (not throttled)
    const rawPosition: VehiclePosition = {
      id: `pos-${vehicleId}-${Date.now()}`,
      vehicleId,
      latitude,
      longitude,
      heading: heading || 0,
      timestamp: Date.now(),
      speed: 0,
      ignition: true,
    };

    // Update vehicle with raw position first
    set((currentState: FleetState) => {
      const currentVehicle = currentState.vehiclesById[vehicleId] || {} as Vehicle;
      const isNewVehicle = !currentState.vehiclesById[vehicleId];
      const updatedVehicleIds = isNewVehicle 
        ? [...currentState.vehicleIds, vehicleId]
        : currentState.vehicleIds;
      
      return {
        vehiclesById: {
          ...currentState.vehiclesById,
          [vehicleId]: {
            ...currentVehicle,
            id: vehicleId, // Ensure ID is set
            currentPosition: rawPosition,
            lastUpdate: Date.now(),
          },
        },
        vehicleIds: updatedVehicleIds,
        lastUpdate: Date.now(),
      };
    });

    // Then try to snap to road if routing is enabled
    if (state.routingEnabled) {
      // Mark this vehicle as having a pending snap operation
      state.addPendingSnap?.(vehicleId);

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

            snappedLng = lastPoint[0];
            snappedLat = lastPoint[1];
            snappedHeading = RoutingUtils.calculateBearing(
              prevPoint[1], // previous latitude
              prevPoint[0], // previous longitude
              snappedLat, // current latitude
              snappedLng // current longitude
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
            snappedLng = snapResult.location[0];
            snappedLat = snapResult.location[1];
            snappedHeading = snapResult.heading || heading || 0;
            confidence = snapResult.confidence;
          }
        }

        // Use snapped position if confidence is high enough
        if (confidence > 0.3) {
          const snappedPosition: VehiclePosition = {
            ...rawPosition,
            latitude: snappedLat,
            longitude: snappedLng,
            heading: snappedHeading,
            accuracy: undefined, // Clear accuracy since this is now road-snapped
          };

          set((currentState: FleetState) => {
            const updatedPendingSnaps = new Set(currentState._pendingSnaps || []);
            updatedPendingSnaps.delete(vehicleId);
            const currentVehicle = currentState.vehiclesById[vehicleId] || {} as Vehicle;
            const isNewVehicle = !currentState.vehiclesById[vehicleId];
            const updatedVehicleIds = isNewVehicle 
              ? [...currentState.vehicleIds, vehicleId]
              : currentState.vehicleIds;

            return {
              vehiclesById: {
                ...currentState.vehiclesById,
                [vehicleId]: {
                  ...currentVehicle,
                  id: vehicleId, // Ensure ID is set
                  currentPosition: snappedPosition,
                  lastUpdate: Date.now(),
                },
              },
              vehicleIds: updatedVehicleIds,
              trails: {
                ...currentState.trails,
                [vehicleId]: [
                  ...(currentState.trails?.[vehicleId] || []),
                  snappedPosition,
                ].slice(-100),
              },
              lastSnapTimes: {
                ...currentState.lastSnapTimes,
                [vehicleId]: now,
              },
              _pendingSnaps: updatedPendingSnaps,
              lastUpdate: Date.now(),
            };
          });

          // Cache the snapped result for nearby positions
          state.addSnapCache?.(latitude, longitude, {
            location: [snappedLng, snappedLat],
            heading: snappedHeading,
          });
        } else {
          // Append raw position to the trail if we didn't use snapped
          set((currentState: FleetState) => ({
            trails: {
              ...currentState.trails,
              [vehicleId]: [
                ...(currentState.trails?.[vehicleId] || []),
                rawPosition,
              ].slice(-100),
            },
          }));
        }
      } catch (error) {
        console.debug(
          `Road snapping failed for vehicle ${vehicleId}, using raw coordinates:`,
          error
        );
        // Continue with raw coordinates - this is not a critical error
      } finally {
        // Always clean up pending snaps
        state.removePendingSnap?.(vehicleId);
      }
    }
  },

  enableRouting: (enabled: boolean) => {
    // Road snapping is now always enabled for realistic fleet tracking
    // This method is kept for backwards compatibility but always sets to true
    set({ routingEnabled: true });

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Road snapping is always enabled for realistic fleet tracking (requested: ${enabled ? 'enabled' : 'disabled'})`
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
});
