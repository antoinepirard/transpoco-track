/**
 * Cache management for road snapping and performance optimization
 */

import { encode as encodeGeohash } from '@/lib/geo/geohash';

export interface SnapCacheEntry {
  location: [number, number];
  heading?: number;
  timestamp: number;
}

export interface CacheManagerState {
  // Road snapping optimization
  lastSnapTimes: Record<string, number>;
  snapCache: Map<string, SnapCacheEntry>;

  // Memoized vehicles array (using optional to avoid conflict with VehicleManager)
  _vehiclesArrayVersion?: number | null;

  // Synchronization for road snapping
  _pendingSnaps: Set<string>;
  [key: string]: unknown;
}

export interface CacheManagerActions {
  cleanupCaches: () => void;
  addSnapCache: (
    latitude: number,
    longitude: number,
    entry: Omit<SnapCacheEntry, 'timestamp'>
  ) => void;
  getSnapCache: (
    latitude: number,
    longitude: number
  ) => SnapCacheEntry | undefined;
  isVehiclePending: (vehicleId: string) => boolean;
  addPendingSnap: (vehicleId: string) => void;
  removePendingSnap: (vehicleId: string) => void;
  updateLastSnapTime: (vehicleId: string, timestamp: number) => void;
}

export const createCacheManagerSlice = (set: (fn: (state: CacheManagerState) => Partial<CacheManagerState>) => void, get: () => CacheManagerState) => ({
  // Initial state
  lastSnapTimes: {},
  snapCache: new Map<string, SnapCacheEntry>(),
  _vehiclesArray: [],
  _vehiclesArrayVersion: null,
  _pendingSnaps: new Set<string>(),

  // Actions
  cleanupCaches: () => {
    set((state: CacheManagerState) => {
      const now = Date.now();
      const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

      // Clean expired cache entries
      const cleanedCache = new Map(state.snapCache);
      for (const [key, value] of cleanedCache.entries()) {
        if (now - (value as SnapCacheEntry).timestamp > CACHE_TTL_MS) {
          cleanedCache.delete(key);
        }
      }

      // Clean lastSnapTimes for vehicles that no longer exist
      const cleanedSnapTimes: Record<string, number> = {};
      for (const vehicleId of (state as CacheManagerState & { vehicleIds?: string[] }).vehicleIds || []) {
        if (state.lastSnapTimes[vehicleId]) {
          cleanedSnapTimes[vehicleId] = state.lastSnapTimes[vehicleId];
        }
      }

      return {
        snapCache: cleanedCache,
        lastSnapTimes: cleanedSnapTimes,
      };
    });
  },

  addSnapCache: (
    latitude: number,
    longitude: number,
    entry: Omit<SnapCacheEntry, 'timestamp'>
  ) => {
    const geohash = encodeGeohash(latitude, longitude, 6);
    const state = get();
    state.snapCache.set(geohash, {
      ...entry,
      timestamp: Date.now(),
    });
  },

  getSnapCache: (
    latitude: number,
    longitude: number
  ): SnapCacheEntry | undefined => {
    const geohash = encodeGeohash(latitude, longitude, 6);
    const state = get();
    const cached = state.snapCache.get(geohash);
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached;
    }
    return undefined;
  },

  isVehiclePending: (vehicleId: string): boolean => {
    return get()._pendingSnaps.has(vehicleId);
  },

  addPendingSnap: (vehicleId: string) => {
    set((state: CacheManagerState) => ({
      _pendingSnaps: new Set(state._pendingSnaps).add(vehicleId),
    }));
  },

  removePendingSnap: (vehicleId: string) => {
    set((state: CacheManagerState) => {
      const updatedPendingSnaps = new Set(state._pendingSnaps);
      updatedPendingSnaps.delete(vehicleId);
      return { _pendingSnaps: updatedPendingSnaps };
    });
  },

  updateLastSnapTime: (vehicleId: string, timestamp: number) => {
    set((state: CacheManagerState) => ({
      lastSnapTimes: {
        ...state.lastSnapTimes,
        [vehicleId]: timestamp,
      },
    }));
  },
});

// Initialize cleanup interval (only once)
let cleanupInitialized = false;

export const initializeCacheCleanup = (getStore: () => CacheManagerState & CacheManagerActions) => {
  if (cleanupInitialized) return;
  cleanupInitialized = true;

  // Schedule cache cleanup every 5 minutes
  setInterval(
    () => {
      const store = getStore();
      store.cleanupCaches();
    },
    5 * 60 * 1000
  );
};
