'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapView } from '@/components/map/MapView';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useFleetStore } from '@/stores/fleet';
import { useWebSocket } from '@/hooks/useWebSocket';
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
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function FleetMap({
  organizationId,
  websocketUrl = 'ws://localhost:8080',
  apiKey,
  mapStyle,
  showTrails = false,
  autoConnect = true,
  demoMode = false,
  showSidebar = true,
  sidebarCollapsed = false,
  onToggleSidebar,
}: FleetMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [internalShowTrails, setInternalShowTrails] = useState(showTrails);

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
    autoConnect: !demoMode,
  });

  // Demo mode setup
  useEffect(() => {
    if (!demoMode) return;

    setConnectionStatus(true);

    const unsubscribeVehicles = fakeDataGenerator.onVehicleUpdate((demoVehicles) => {
      setVehicles(demoVehicles);
    });

    const unsubscribeTrails = fakeDataGenerator.onTrailUpdate((vehicleId, positions) => {
      addTrail(vehicleId, positions);
    });

    fakeDataGenerator.start();

    return () => {
      fakeDataGenerator.stop();
      unsubscribeVehicles();
      unsubscribeTrails();
    };
  }, [demoMode, setVehicles, addTrail, setConnectionStatus]);

  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    selectVehicle(vehicle.id);
    setSelectedVehicle(vehicle);
  }, [selectVehicle]);

  const handleVehicleHover = useCallback((_vehicle: Vehicle | null) => {}, []);

  const layers = useMemo(() => {
    const deckLayers: unknown[] = [];

    if (internalShowTrails && Object.keys(trails).length > 0) {
      const trailLayer = createTrailLayer({
        trails: Object.values(trails),
        selectedVehicleId: selectedVehicleId ?? undefined,
        width: 3,
        opacity: 0.8,
      });
      deckLayers.push(trailLayer);
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
  }, [vehicles, trails, internalShowTrails, selectedVehicleId, handleVehicleClick, handleVehicleHover]);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehicleId, vehicles]);

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      {showSidebar && (
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
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
        />
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapView
          viewport={viewport}
          onViewportChange={setViewport}
          layers={layers}
          {...(mapStyle ? { mapStyle } : {})}
          {...(apiKey ? { apiKey } : {})}
          className="w-full h-full"
        />

        {/* Connection Status - moved to top-right of map area */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
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
