'use client';

import { useMemo } from 'react';
import type { Vehicle } from '@/types/fleet';
import { createVehicleLayer } from '@/lib/deckgl/layers';

interface VehicleLayerProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  clusterVehicles?: boolean;
  zoom?: number;
}

export function VehicleLayer({
  vehicles,
  selectedVehicleId,
  onVehicleClick,
  onVehicleHover,
  clusterVehicles = false,
  zoom,
}: VehicleLayerProps) {
  const layer = useMemo(() => {
    if (!vehicles.length) return null;

    return createVehicleLayer({
      vehicles,
      ...(selectedVehicleId !== undefined ? { selectedVehicleId } : {}),
      ...(onVehicleClick ? { onVehicleClick } : {}),
      ...(onVehicleHover ? { onVehicleHover } : {}),
      clusterVehicles,
      zoom,
    });
  }, [
    vehicles,
    selectedVehicleId,
    onVehicleClick,
    onVehicleHover,
    clusterVehicles,
    zoom,
  ]);

  return layer;
}