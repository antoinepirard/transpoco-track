'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { MapView } from '@/components/map/MapView';
import { MapFeatureControls } from '@/components/map/MapFeatureControls';
import { MapStyleSwitcher } from '@/components/map/MapStyleSwitcher';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useFleetStore } from '@/stores/fleet';
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
  showSidebar?: boolean;
}

export function FleetMap({
  organizationId,
  websocketUrl = 'ws://localhost:8080',
  apiKey,
  mapStyle: initialMapStyle,
  showTrails = false,
  autoConnect = true,
  demoMode = false,
  showSidebar = false,
}: FleetMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [internalShowTrails, setInternalShowTrails] = useState(showTrails);
  const [currentMapStyle, setCurrentMapStyle] = useState(initialMapStyle);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const hasAutocenteredRef = useRef(false);
  const { toggleMapLayer } = useMapLayers();

  const {
    vehicles,
    selectedVehicleId,
    viewport,
    trails,
    isConnected,
    selectVehicle,
    setViewport,
    setVehicles,
    addTrail,
    setConnectionStatus,
  } = useFleetStore();

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

    const unsubscribeVehicles = fakeDataGenerator.onVehicleUpdate(
      (demoVehicles) => {
        setVehicles(demoVehicles);
      }
    );

    const unsubscribeTrails = fakeDataGenerator.onTrailUpdate(
      (vehicleId, positions) => {
        addTrail(vehicleId, positions);
      }
    );

    fakeDataGenerator.start();

    return () => {
      fakeDataGenerator.stop();
      unsubscribeVehicles();
      unsubscribeTrails();
    };
  }, [demoMode, setVehicles, addTrail, setConnectionStatus]);

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
    console.log('Map loaded and ready for layers');

    // Wait a brief moment to ensure map is fully initialized
    setTimeout(() => {
      console.log('Map initialization complete, layer toggles enabled');
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

    if (vehicles.length > 0) {
      const vehicleLayer = createVehicleLayer({
        vehicles,
        selectedVehicleId: selectedVehicleId ?? undefined,
        onVehicleClick: handleVehicleClick,
        onVehicleHover: handleVehicleHover,
      });
      deckLayers.push(vehicleLayer);
    }

    return deckLayers;
  }, [
    vehicles,
    trails,
    internalShowTrails,
    selectedVehicleId,
    handleVehicleClick,
    handleVehicleHover,
  ]);

  // Calculate fleet bounds and auto-center map
  const calculateFleetBounds = useCallback(() => {
    if (vehicles.length === 0) return null;

    const bounds = vehicles.reduce(
      (acc, vehicle) => {
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

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehicleId, vehicles]);

  // Auto-center on fleet when vehicles are first loaded (only once)
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId && !hasAutocenteredRef.current) {
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

  return (
    <div className="w-full h-full relative">
      {/* Sidebar - conditionally render if needed */}
      {showSidebar && (
        <div className="absolute top-0 left-0 z-20 h-full">
          <Sidebar
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            isConnected={isConnected}
            showTrails={internalShowTrails}
            onVehicleSelect={(vehicle) => {
              setSelectedVehicle(vehicle);
              selectVehicle(vehicle?.id || null);
            }}
            onToggleTrails={setInternalShowTrails}
          />
        </div>
      )}

      {/* Map Container */}
      <div className="w-full h-full">
        <MapView
          viewport={viewport}
          onViewportChange={setViewport}
          layers={layers}
          onMapLoad={handleMapLoad}
          {...(currentMapStyle ? { mapStyle: currentMapStyle } : {})}
          {...(apiKey ? { apiKey } : {})}
          className="w-full h-full"
        />

        {/* Map Controls - positioned in top-right of map area */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
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
