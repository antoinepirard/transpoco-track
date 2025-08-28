'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapView } from '@/components/map/MapView';
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
}

export function FleetMap({
  organizationId,
  websocketUrl = 'ws://localhost:8080',
  apiKey,
  mapStyle,
  showTrails = false,
  autoConnect = true,
  demoMode = false,
}: FleetMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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

  const handleVehicleClick = (vehicle: Vehicle) => {
    selectVehicle(vehicle.id);
    setSelectedVehicle(vehicle);
  };

  const handleVehicleHover = (vehicle: Vehicle | null) => {};

  const layers = useMemo(() => {
    const deckLayers: any[] = [];

    if (showTrails && Object.keys(trails).length > 0) {
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
  }, [vehicles, trails, showTrails, selectedVehicleId, handleVehicleClick, handleVehicleHover]);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehicleId, vehicles]);

  return (
    <div className="relative w-full h-full">
      <MapView
        viewport={viewport}
        onViewportChange={setViewport}
        layers={layers}
        {...(mapStyle ? { mapStyle } : {})}
        {...(apiKey ? { apiKey } : {})}
        className="w-full h-full"
      />

      {/* Connection Status */}
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

      {/* Vehicle Count */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white px-3 py-2 rounded-md shadow-md text-sm font-medium text-gray-800">
          {vehicles.length} Vehicle{vehicles.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Selected Vehicle Info */}
      {selectedVehicle && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedVehicle.name}
              </h3>
              <button
                onClick={() => selectVehicle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Registration:</span>{' '}
                {selectedVehicle.registrationNumber}
              </p>
              <p>
                <span className="font-medium">Status:</span>{' '}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs ${
                    selectedVehicle.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : selectedVehicle.status === 'offline'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedVehicle.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Speed:</span>{' '}
                {Math.round(selectedVehicle.currentPosition.speed)} km/h
              </p>
              {selectedVehicle.driver && (
                <p>
                  <span className="font-medium">Driver:</span>{' '}
                  {selectedVehicle.driver.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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
  );
}
