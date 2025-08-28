'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { DeckGL } from '@deck.gl/react';
import type { MapRef, ViewState } from '@deck.gl/core';
import type { MapViewport, MapConfiguration, DeckGLLayer } from '@/types/map';
import { DEFAULT_MAP_CONFIG, INITIAL_VIEWPORT } from '@/lib/maplibre/config';

import 'maplibre-gl/dist/maplibre-gl.css';

interface MapViewProps {
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  layers?: DeckGLLayer[];
  mapStyle?: string | MapConfiguration['style'];
  apiKey?: string;
  className?: string;
  children?: React.ReactNode;
}

export function MapView({
  viewport = INITIAL_VIEWPORT,
  onViewportChange,
  layers = [],
  mapStyle = DEFAULT_MAP_CONFIG.style,
  apiKey,
  className = 'w-full h-full',
  children,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    ...viewport,
    transitionDuration: 0,
  });

  const handleViewStateChange = useCallback(
    ({ viewState: newViewState }: { viewState: ViewState }) => {
      setViewState(newViewState);
      onViewportChange?.({
        latitude: newViewState.latitude,
        longitude: newViewState.longitude,
        zoom: newViewState.zoom,
        bearing: newViewState.bearing,
        pitch: newViewState.pitch,
      });
    },
    [onViewportChange]
  );

  const getMapStyle = useCallback(() => {
    if (typeof mapStyle === 'string') {
      return apiKey ? `${mapStyle}?key=${apiKey}` : mapStyle;
    }
    return mapStyle;
  }, [mapStyle, apiKey]);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      ...viewport,
      transitionDuration: 1000,
    }));
  }, [viewport]);

  return (
    <div className={className}>
      <DeckGL
        ref={mapRef}
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        layers={layers}
        controller={{
          dragPan: true,
          dragRotate: true,
          doubleClickZoom: true,
          touchZoom: true,
          touchRotate: true,
          keyboard: true,
        }}
        getCursor={({ isDragging, isHovering }) => {
          if (isDragging) return 'grabbing';
          if (isHovering) return 'pointer';
          return 'grab';
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div
            ref={(ref) => {
              if (ref && !ref.hasChildNodes()) {
                const map = new maplibregl.Map({
                  container: ref,
                  style: getMapStyle(),
                  interactive: false,
                  attributionControl: DEFAULT_MAP_CONFIG.attributionControl,
                });

                map.on('load', () => {
                  mapRef.current?.setProps({
                    layers: layers,
                  });
                });
              }
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        {children}
      </DeckGL>
    </div>
  );
}