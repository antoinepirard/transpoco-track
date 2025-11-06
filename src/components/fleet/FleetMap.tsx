'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { MapView } from '@/components/map/MapView';
import { MapFeatureControls } from '@/components/map/MapFeatureControls';
import { MapStyleSwitcher } from '@/components/map/MapStyleSwitcher';
import { MapErrorBoundary } from '@/components/map/MapErrorBoundary';
import { useFleetStore } from '@/stores/fleetStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMapLayers } from '@/hooks/useMapLayers';
import { createVehicleLayer, createTrailLayer } from '@/lib/deckgl/layers';
import { fakeDataGenerator } from '@/lib/demo/fakeDataGenerator';
import type { Vehicle } from '@/types/fleet';

interface FleetMapProps {
  organizationId: string;
  websocketUrl?: string;
  apiKey?: string;
  mapStyle?: string;
  showTrails?: boolean;
  autoConnect?: boolean;
  demoMode?: boolean;
  centerOnLocation?: {latitude: number, longitude: number, zoom?: number} | null;
}

export function FleetMap({
  organizationId,
  websocketUrl = 'ws://localhost:8080',
  apiKey,
  mapStyle: initialMapStyle,
  showTrails = false,
  autoConnect = true,
  demoMode = false,
  centerOnLocation = null,
}: FleetMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [internalShowTrails, setInternalShowTrails] = useState(showTrails);
  const [currentMapStyle, setCurrentMapStyle] = useState(initialMapStyle);
  const [isFleetLoaded, setIsFleetLoaded] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const hasAutocenteredRef = useRef(false);
  const { toggleMapLayer } = useMapLayers();

  const {
    getVehicles,
    selectedVehicleId,
    viewport,
    trails,
    isConnected,
    selectVehicle,
    setViewport,
    updateVehiclesIfChanged,
    setConnectionStatus,
  } = useFleetStore();

  const vehicles = getVehicles();

  const { error: wsError } = useWebSocket({
    url: websocketUrl,
    organizationId,
    ...(apiKey ? { apiKey } : {}),
    autoConnect: autoConnect && !demoMode,
  });

  // Demo mode setup
  useEffect(() => {
    if (!demoMode) return;

    setConnectionStatus(true);

    // Initialize with current static vehicles (one-time load)
    const initialVehicles = fakeDataGenerator.getVehicles();
    if (initialVehicles.length > 0) {
      updateVehiclesIfChanged(initialVehicles);
    }

    fakeDataGenerator.start();

    return () => {
      fakeDataGenerator.stop();
    };
  }, [demoMode, updateVehiclesIfChanged, setConnectionStatus]);

  const handleVehicleClick = useCallback(
    (vehicle: Vehicle) => {
      if (selectedVehicleId === vehicle.id) {
        // Deselect if clicking the same vehicle
        selectVehicle(null);
        setSelectedVehicle(null);
      } else {
        selectVehicle(vehicle.id);
        setSelectedVehicle(vehicle);
      }
    },
    [selectVehicle, selectedVehicleId]
  );

  const handleVehicleHover = useCallback(() => {}, []);


  const handleMapLoad = useCallback((map: MapLibreMap) => {
    mapInstanceRef.current = map;
    console.log('🗺️ Map loaded and ready for layers');

    // Wait a brief moment to ensure map is fully initialized
    setTimeout(() => {
      console.log('🗺️ Map initialization complete, setting isMapLoaded=true');
      setIsMapLoaded(true);
    }, 100);
  }, []);

  const handleFeatureToggle = useCallback(
    (featureId: string, enabled: boolean) => {
      if (mapInstanceRef.current) {
        try {
          toggleMapLayer(mapInstanceRef.current, featureId, enabled);
          console.log(
            `Feature ${featureId} ${enabled ? 'enabled' : 'disabled'}`
          );
        } catch (error) {
          console.error(`Failed to toggle ${featureId}:`, error);
        }
      } else {
        console.warn('Map not yet loaded, cannot toggle feature:', featureId);
      }
    },
    [toggleMapLayer]
  );

  // Create vehicle layer - always shows individual vehicles
  const vehicleLayer = useMemo(() => {
    if (vehicles.length === 0) return null;
    
    return createVehicleLayer({
      vehicles,
      selectedVehicleId: selectedVehicleId ?? undefined,
      onVehicleClick: handleVehicleClick,
      onVehicleHover: handleVehicleHover,
    });
  }, [
    vehicles, // Recalculate when vehicles change
    selectedVehicleId,
    handleVehicleClick,
    handleVehicleHover,
  ]);

  const layers = useMemo(() => {
    const deckLayers: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Show trails only for selected vehicle, or all trails if showTrails is enabled
    if (
      Object.keys(trails).length > 0 &&
      (selectedVehicleId || internalShowTrails)
    ) {
      const selectedTrails =
        selectedVehicleId && !internalShowTrails
          ? trails[selectedVehicleId]
            ? [trails[selectedVehicleId]]
            : []
          : Object.values(trails);

      if (selectedTrails.length > 0) {
        const trailLayer = createTrailLayer({
          trails: selectedTrails,
          selectedVehicleId: selectedVehicleId ?? undefined,
          width: 3,
          opacity: 0.8,
        });
        deckLayers.push(trailLayer);
      }
    }

    // Add vehicle layer
    if (vehicleLayer) {
      deckLayers.push(vehicleLayer);
    }

    return deckLayers;
  }, [
    trails,
    internalShowTrails,
    selectedVehicleId,
    vehicleLayer, // Simple vehicle layer dependency
  ]);

  // Calculate fleet bounds and auto-center map
  const calculateFleetBounds = useCallback(() => {
    if (vehicles.length === 0) return null;

    const bounds = vehicles.reduce(
      (
        acc: { north: number; south: number; east: number; west: number },
        vehicle: Vehicle
      ) => {
        const lat = vehicle.currentPosition.latitude;
        const lng = vehicle.currentPosition.longitude;

        return {
          north: Math.max(acc.north, lat),
          south: Math.min(acc.south, lat),
          east: Math.max(acc.east, lng),
          west: Math.min(acc.west, lng),
        };
      },
      {
        north: -90,
        south: 90,
        east: -180,
        west: 180,
      }
    );

    // Calculate center and zoom level
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;

    // Calculate zoom based on bounds size
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 10; // Default zoom for Ireland
    if (maxDiff > 0.5) zoom = 8;
    else if (maxDiff > 0.2) zoom = 9;
    else if (maxDiff > 0.1) zoom = 10;
    else if (maxDiff > 0.05) zoom = 11;
    else zoom = 12;

    return {
      latitude: centerLat,
      longitude: centerLng,
      zoom,
      bearing: 0,
      pitch: 0,
    };
  }, [vehicles]);

  const getVehicle = useFleetStore((state) => state.getVehicle);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = getVehicle(selectedVehicleId);
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehicleId, getVehicle]);


  // Track fleet loading state - wait for map to be loaded
  useEffect(() => {
    // Fleet is considered loaded when map is ready, regardless of vehicles
    // This prevents permanent "Loading fleet..." when no vehicles are available
    if (isMapLoaded) {
      // Small delay to ensure map is fully initialized
      const renderTimeout = setTimeout(() => {
        setIsFleetLoaded(true);
      }, 500);

      return () => {
        clearTimeout(renderTimeout);
      };
    }
    setIsFleetLoaded(false);
    return undefined;
  }, [isMapLoaded]);

  // Auto-center on fleet when vehicles are first loaded (only once)
  useEffect(() => {
    if (
      vehicles.length > 0 &&
      !selectedVehicleId &&
      !hasAutocenteredRef.current
    ) {
      const fleetBounds = calculateFleetBounds();
      if (fleetBounds) {
        setViewport(fleetBounds);
        hasAutocenteredRef.current = true;
      }
    }

    // Reset flag when vehicles become empty (e.g., connection lost)
    if (vehicles.length === 0) {
      hasAutocenteredRef.current = false;
    }
  }, [vehicles.length, selectedVehicleId, calculateFleetBounds, setViewport]);

  // Center map on external location (Google Maps-like behavior)
  useEffect(() => {
    if (centerOnLocation) {
      setViewport({
        latitude: centerOnLocation.latitude,
        longitude: centerOnLocation.longitude,
        zoom: centerOnLocation.zoom || 15,
        bearing: 0,
        pitch: 0,
      });
    }
  }, [centerOnLocation, setViewport]);

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div className="w-full h-full">
        <MapErrorBoundary>
          <MapView
            viewport={viewport}
            onViewportChange={setViewport}
            layers={layers}
            onMapLoad={handleMapLoad}
            isFleetLoaded={isFleetLoaded}
            {...(currentMapStyle ? { mapStyle: currentMapStyle } : {})}
            {...(apiKey ? { apiKey } : {})}
            className="w-full h-full"
          />
        </MapErrorBoundary>

        {/* Map Controls - positioned in top-right of map area */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <MapStyleSwitcher
            currentStyle={currentMapStyle || ''}
            onStyleChange={setCurrentMapStyle}
          />
          <MapFeatureControls onFeatureToggle={handleFeatureToggle} />
        </div>


        {/* WebSocket Error */}
        {wsError && (
          <div className="absolute bottom-4 right-4 z-10 max-w-sm">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="text-red-800 text-sm">
                  Connection Error: {wsError.message}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
