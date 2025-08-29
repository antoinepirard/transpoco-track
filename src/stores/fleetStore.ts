/**
 * Main fleet store combining all modules
 */

import { create } from 'zustand';
import { getRoutingService } from '@/lib/routing';

// Import all modules
import {
  createCacheManagerSlice,
  initializeCacheCleanup,
  type CacheManagerState,
  type CacheManagerActions,
} from './modules/cacheManager';
import {
  createVehicleManagerSlice,
  type VehicleManagerState,
  type VehicleManagerActions,
} from './modules/vehicleManager';
import {
  createRoadSnappingSlice,
  type RoadSnappingState,
  type RoadSnappingActions,
} from './modules/roadSnapping';
import {
  createMapManagerSlice,
  type MapManagerState,
  type MapManagerActions,
} from './modules/mapManager';

// Combined state interface
interface FleetState
  extends CacheManagerState,
    VehicleManagerState,
    RoadSnappingState,
    MapManagerState,
    CacheManagerActions,
    VehicleManagerActions,
    RoadSnappingActions,
    MapManagerActions {
  [key: string]: unknown;
}

export const useFleetStore = create<FleetState>()((set, get) => ({
  // Initialize routing service
  routingService: getRoutingService(),
  routingEnabled: true,

  // Combine all slices
  ...createCacheManagerSlice(set, get),
  ...createVehicleManagerSlice(set, get),
  ...createRoadSnappingSlice(set, get),
  ...createMapManagerSlice(set, get),
}));

// Initialize cache cleanup
initializeCacheCleanup(() => useFleetStore.getState());
