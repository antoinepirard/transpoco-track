'use client';

import { useMemo } from 'react';
import type { VehiclePosition } from '@/types/fleet';
import { createTrailLayer } from '@/lib/deckgl/layers';

interface TrailLayerProps {
  trails: VehiclePosition[][];
  selectedVehicleId?: string;
  colors?: string[];
  width?: number;
  opacity?: number;
}

export function TrailLayer({
  trails,
  selectedVehicleId,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  width = 3,
  opacity = 0.8,
}: TrailLayerProps) {
  const layer = useMemo(() => {
    if (!trails.length) return null;

    return createTrailLayer({
      trails,
      selectedVehicleId,
      colors,
      width,
      opacity,
    });
  }, [trails, selectedVehicleId, colors, width, opacity]);

  return layer;
}