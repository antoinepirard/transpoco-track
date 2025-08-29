'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { DeckGL } from '@deck.gl/react';
import type { MapViewState, ViewStateChangeParameters } from '@deck.gl/core';
import type { MapViewport } from '@/types/fleet';
import type { MapConfiguration, DeckGLLayer } from '@/types/map';
import { DEFAULT_MAP_CONFIG, INITIAL_VIEWPORT } from '@/lib/maplibre/config';

import 'maplibre-gl/dist/maplibre-gl.css';

interface MapDataAbortEvent {
  sourceId?: string;
  type: string;
}

interface MapViewProps {
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  layers?: DeckGLLayer[];
  mapStyle?: string | MapConfiguration['style'];
  apiKey?: string;
  className?: string;
  children?: React.ReactNode;
  onMapLoad?: (map: maplibregl.Map) => void;
}

export function MapView({
  viewport = INITIAL_VIEWPORT,
  onViewportChange,
  layers = [],
  mapStyle = DEFAULT_MAP_CONFIG.style,
  apiKey,
  className = 'w-full h-full',
  children,
  onMapLoad,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [viewState, setViewState] = useState<MapViewState>({
    ...viewport,
    transitionDuration: 0,
  });
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitializingRef = useRef(false);

  const handleViewStateChange = useCallback(
    (info: ViewStateChangeParameters<MapViewState>) => {
      const vs = info.viewState;

      // 1) Update DeckGL local view state immediately
      setViewState((prev) => ({
        ...prev,
        ...vs,
        transitionDuration: 0,
      }));

      // 2) Keep MapLibre in lockstep (same frame if possible)
      const map = mapInstanceRef.current;
      if (map) {
        try {
          map.jumpTo({
            center: [vs.longitude, vs.latitude],
            zoom: vs.zoom,
            bearing: vs.bearing || 0,
            pitch: vs.pitch || 0,
          });
        } catch {}
      }

      // 3) Persist to store only when drag ends to prevent layer recreation during interaction
      const isDragging = info.interactionState?.isDragging;
      if (isDragging === false) {
        onViewportChange?.({
          latitude: vs.latitude,
          longitude: vs.longitude,
          zoom: vs.zoom,
          bearing: vs.bearing || 0,
          pitch: vs.pitch || 0,
        });
      }
    },
    [onViewportChange]
  );

  const getMapStyle = useCallback(() => {
    if (typeof mapStyle === 'string') {
      const envApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
      const keyToUse = apiKey || envApiKey;
      return keyToUse ? `${mapStyle}?key=${keyToUse}` : mapStyle;
    }
    return mapStyle;
  }, [mapStyle, apiKey]);

  // Initialize MapLibre map (once only, no viewport deps)
  useEffect(() => {
    if (
      mapInstanceRef.current ||
      !mapContainerRef.current ||
      isInitializingRef.current
    )
      return;

    // Cancel any previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    isInitializingRef.current = true;
    setIsLoading(true);
    setMapError(null);

    // Create new abort controller for this initialization
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getMapStyle() as string,
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
      bearing: viewport.bearing || 0,
      pitch: viewport.pitch || 0,
      attributionControl: DEFAULT_MAP_CONFIG.attributionControl ? {} : false,
      interactive: false,
    });

    // Set a timeout for map loading
    const loadTimeout = setTimeout(() => {
      setMapError(
        'Map failed to load within timeout. Please refresh the page.'
      );
      setIsLoading(false);
    }, 10000);

    map.on('load', () => {
      if (abortController.signal.aborted) return;
      clearTimeout(loadTimeout);
      setIsLoading(false);
      retryCountRef.current = 0;
      isInitializingRef.current = false;
      onMapLoad?.(map);
    });

    map.on('error', (e) => {
      if (abortController.signal.aborted) return;
      clearTimeout(loadTimeout);

      // Ignore abort errors as they're expected during cleanup
      if (
        e.error?.name === 'AbortError' ||
        e.error?.message?.includes('aborted')
      ) {
        console.log('Map request aborted (expected during cleanup)');
        return;
      }

      console.warn('MapLibre error:', e.error);
      isInitializingRef.current = false;

      // Implement exponential backoff retry
      const maxRetries = 3;
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        const delay = Math.pow(2, retryCountRef.current - 1) * 1000; // 1s, 2s, 4s

        setMapError(
          `Map loading failed. Retrying in ${delay / 1000}s... (${retryCountRef.current}/${maxRetries})`
        );

        setTimeout(() => {
          if (!abortController.signal.aborted) {
            setRetryTrigger((prev) => prev + 1);
          }
        }, delay);
      } else {
        if (e.error?.message?.includes('sprite')) {
          setMapError(
            'Map sprites failed to load. The map may not display all icons properly.'
          );
        } else {
          setMapError(
            'Map failed to load after multiple attempts. Please refresh the page.'
          );
        }
        setIsLoading(false);
      }
    });

    map.on('styleimagemissing', (e) => {
      console.warn('Missing style image:', e.id);
    });

    map.on('sourcedataabort', (e) => {
      // Only log if not an intentional abort
      if (!abortController.signal.aborted) {
        console.log(
          'Source data loading aborted:',
          e.sourceId,
          '(likely due to style change)'
        );
      }
    });

    map.on('dataabort', (e) => {
      const event = e as MapDataAbortEvent;
      // Only log if not an intentional abort
      if (!abortController.signal.aborted) {
        console.log(
          'Map data loading aborted:',
          event.sourceId || 'unknown source',
          '(likely due to style change)'
        );
      }
    });

    mapInstanceRef.current = map;

    return () => {
      // Signal abort to prevent state updates after cleanup
      abortController.abort();
      isInitializingRef.current = false;

      try {
        map.remove();
      } catch (error: unknown) {
        // Only warn if it's not an abort-related error
        if (error instanceof Error && !error.message.includes('aborted')) {
          console.warn('Error removing map:', error);
        }
      }
      mapInstanceRef.current = null;
      setIsLoading(false);
      setMapError(null);
      retryCountRef.current = 0;
    };
  }, [getMapStyle, retryTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle style changes without re-initializing map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isInitializingRef.current) return;

    const style = getMapStyle();
    if (style) {
      // Add a small delay to prevent rapid style changes
      const timeoutId = setTimeout(() => {
        if (mapInstanceRef.current && !isInitializingRef.current) {
          try {
            map.setStyle(style as string);
          } catch (error) {
            // Ignore abort errors during style changes
            if (
              error instanceof Error &&
              (error.name === 'AbortError' || error.message.includes('aborted'))
            ) {
              console.log('Style change aborted (expected during transitions)');
            } else {
              console.warn('Error setting map style:', error);
            }
          }
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
    return;
  }, [getMapStyle]);

  // Update viewport state when prop changes
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      ...viewport,
      transitionDuration: 0,
    }));
  }, [viewport]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* MapLibre base map */}
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      {/* Loading overlay - non-blocking */}
      {isLoading && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center decorative">
          <div className="bg-white shadow rounded-md px-4 py-3 gap-3 flex items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500 gpu-accelerate" />
            <span className="text-sm text-gray-700">Loading map…</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {mapError && !isLoading && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="text-red-600 mt-0.5">⚠</div>
          <div className="flex-1 text-sm text-red-700">{mapError}</div>
          <button
            className="inline-flex items-center rounded bg-red-600 px-2 py-1 text-white text-xs hover:bg-red-700 focus-ring transition-colors duration-150"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
              }
              retryCountRef.current = 0;
              setMapError(null);
              setRetryTrigger((prev) => prev + 1);
            }}
            aria-label="Retry loading map"
          >
            Retry
          </button>
        </div>
      )}

      {/* DeckGL overlay - always mounted for smooth interaction */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleViewStateChange as any} // eslint-disable-line @typescript-eslint/no-explicit-any
        layers={layers as any[]} // eslint-disable-line @typescript-eslint/no-explicit-any
        useDevicePixels={Math.min(
          2,
          typeof window !== 'undefined' ? window.devicePixelRatio : 1
        )}
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
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: '1',
        }}
      >
        {children}
      </DeckGL>
    </div>
  );
}
