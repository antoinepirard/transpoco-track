'use client';

import { useCallback, useRef } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

interface MapLayerFeatures {
  traffic: boolean;
  locations: boolean;
  routes: boolean;
  heatmap: boolean;
}

export function useMapLayers() {
  const layerStatesRef = useRef<MapLayerFeatures>({
    traffic: false,
    locations: false,
    routes: false,
    heatmap: false,
  });

  const toggleTrafficLayer = useCallback(
    (map: MapLibreMap, enabled: boolean) => {
      if (!map) return;

      const TRAFFIC_LAYER_ID = 'traffic-layer';
      const TRAFFIC_SOURCE_ID = 'traffic-source';

      if (enabled) {
        // Create sample traffic data for demonstration
        const sampleTrafficData = {
          type: 'FeatureCollection' as const,
          features: [
            {
              type: 'Feature' as const,
              properties: { congestion: 'heavy' },
              geometry: {
                type: 'LineString' as const,
                coordinates: [
                  [-122.4194, 37.7749],
                  [-122.4094, 37.7849],
                ],
              },
            },
            {
              type: 'Feature' as const,
              properties: { congestion: 'moderate' },
              geometry: {
                type: 'LineString' as const,
                coordinates: [
                  [-122.4094, 37.7849],
                  [-122.3994, 37.7949],
                ],
              },
            },
            {
              type: 'Feature' as const,
              properties: { congestion: 'low' },
              geometry: {
                type: 'LineString' as const,
                coordinates: [
                  [-122.4294, 37.7649],
                  [-122.4194, 37.7749],
                ],
              },
            },
          ],
        };

        if (!map.getSource(TRAFFIC_SOURCE_ID)) {
          map.addSource(TRAFFIC_SOURCE_ID, {
            type: 'geojson',
            data: sampleTrafficData,
          });
        }

        if (!map.getLayer(TRAFFIC_LAYER_ID)) {
          map.addLayer({
            id: TRAFFIC_LAYER_ID,
            type: 'line',
            source: TRAFFIC_SOURCE_ID,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'congestion'], 'low'],
                '#00FF00',
                ['==', ['get', 'congestion'], 'moderate'],
                '#FFFF00',
                ['==', ['get', 'congestion'], 'heavy'],
                '#FF8000',
                ['==', ['get', 'congestion'], 'severe'],
                '#FF0000',
                '#808080',
              ],
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                4,
                15,
                8,
                20,
                16,
              ],
              'line-opacity': 0.8,
            },
          });
        }
      } else {
        // Remove traffic layer
        if (map.getLayer(TRAFFIC_LAYER_ID)) {
          map.removeLayer(TRAFFIC_LAYER_ID);
        }
        if (map.getSource(TRAFFIC_SOURCE_ID)) {
          map.removeSource(TRAFFIC_SOURCE_ID);
        }
      }

      layerStatesRef.current.traffic = enabled;
    },
    []
  );

  const toggleLocationsLayer = useCallback(
    (map: MapLibreMap, enabled: boolean) => {
      if (!map) return;

      const LOCATIONS_LAYER_ID = 'locations-layer';
      const LOCATIONS_SOURCE_ID = 'locations-source';

      if (enabled) {
        // Create sample location/POI data for demonstration
        const sampleLocationsData = {
          type: 'FeatureCollection' as const,
          features: [
            {
              type: 'Feature' as const,
              properties: { 
                type: 'restaurant', 
                name: 'Sample Restaurant',
                color: '#FF6B6B'
              },
              geometry: {
                type: 'Point' as const,
                coordinates: [-122.4194, 37.7749],
              },
            },
            {
              type: 'Feature' as const,
              properties: { 
                type: 'fuel', 
                name: 'Gas Station',
                color: '#4ECDC4'
              },
              geometry: {
                type: 'Point' as const,
                coordinates: [-122.4094, 37.7849],
              },
            },
            {
              type: 'Feature' as const,
              properties: { 
                type: 'hospital', 
                name: 'Medical Center',
                color: '#45B7D1'
              },
              geometry: {
                type: 'Point' as const,
                coordinates: [-122.3994, 37.7949],
              },
            },
            {
              type: 'Feature' as const,
              properties: { 
                type: 'shop', 
                name: 'Shopping Center',
                color: '#96CEB4'
              },
              geometry: {
                type: 'Point' as const,
                coordinates: [-122.4294, 37.7649],
              },
            },
          ],
        };

        if (!map.getSource(LOCATIONS_SOURCE_ID)) {
          map.addSource(LOCATIONS_SOURCE_ID, {
            type: 'geojson',
            data: sampleLocationsData,
          });
        }

        if (!map.getLayer(LOCATIONS_LAYER_ID)) {
          map.addLayer({
            id: LOCATIONS_LAYER_ID,
            type: 'circle',
            source: LOCATIONS_SOURCE_ID,
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 6,
                15, 12,
                20, 20
              ],
              'circle-color': ['get', 'color'],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
              'circle-opacity': 0.8,
            },
            minzoom: 12,
          });

          // Add labels for locations
          map.addLayer({
            id: `${LOCATIONS_LAYER_ID}-labels`,
            type: 'symbol',
            source: LOCATIONS_SOURCE_ID,
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
              'text-offset': [0, 2],
              'text-anchor': 'top',
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                12, 10,
                16, 14
              ],
            },
            paint: {
              'text-color': '#333333',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
            },
            minzoom: 14,
          });
        }
      } else {
        // Remove locations layers
        if (map.getLayer(`${LOCATIONS_LAYER_ID}-labels`)) {
          map.removeLayer(`${LOCATIONS_LAYER_ID}-labels`);
        }
        if (map.getLayer(LOCATIONS_LAYER_ID)) {
          map.removeLayer(LOCATIONS_LAYER_ID);
        }
        if (map.getSource(LOCATIONS_SOURCE_ID)) {
          map.removeSource(LOCATIONS_SOURCE_ID);
        }
      }

      layerStatesRef.current.locations = enabled;
    },
    []
  );

  const toggleRoutesLayer = useCallback(
    (map: MapLibreMap, enabled: boolean) => {
      if (!map) return;

      const ROUTES_LAYER_ID = 'routes-layer';
      const ROUTES_SOURCE_ID = 'routes-source';

      if (enabled) {
        // Add sample route data - in a real app, this would come from your routing service
        const sampleRouteData = {
          type: 'FeatureCollection' as const,
          features: [
            {
              type: 'Feature' as const,
              properties: {
                route_name: 'Main Route',
                route_type: 'primary',
              },
              geometry: {
                type: 'LineString' as const,
                coordinates: [
                  [-122.4194, 37.7749],
                  [-122.4094, 37.7849],
                  [-122.3994, 37.7949],
                  [-122.3894, 37.8049],
                ],
              },
            },
            {
              type: 'Feature' as const,
              properties: {
                route_name: 'Secondary Route',
                route_type: 'secondary',
              },
              geometry: {
                type: 'LineString' as const,
                coordinates: [
                  [-122.4294, 37.7649],
                  [-122.4194, 37.7749],
                  [-122.4094, 37.7849],
                ],
              },
            },
          ],
        };

        if (!map.getSource(ROUTES_SOURCE_ID)) {
          map.addSource(ROUTES_SOURCE_ID, {
            type: 'geojson',
            data: sampleRouteData,
          });
        }

        if (!map.getLayer(ROUTES_LAYER_ID)) {
          map.addLayer({
            id: ROUTES_LAYER_ID,
            type: 'line',
            source: ROUTES_SOURCE_ID,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'route_type'], 'primary'],
                '#0066CC',
                ['==', ['get', 'route_type'], 'secondary'],
                '#66B2FF',
                '#0099FF',
              ],
              'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                3,
                15,
                6,
                20,
                12,
              ],
              'line-opacity': 0.9,
              'line-dasharray': [2, 2],
            },
          });
        }
      } else {
        // Remove routes layer
        if (map.getLayer(ROUTES_LAYER_ID)) {
          map.removeLayer(ROUTES_LAYER_ID);
        }
        if (map.getSource(ROUTES_SOURCE_ID)) {
          map.removeSource(ROUTES_SOURCE_ID);
        }
      }

      layerStatesRef.current.routes = enabled;
    },
    []
  );

  const toggleHeatmapLayer = useCallback(
    (map: MapLibreMap, enabled: boolean) => {
      if (!map) return;

      const HEATMAP_LAYER_ID = 'heatmap-layer';
      const HEATMAP_SOURCE_ID = 'heatmap-source';

      if (enabled) {
        // Create sample heatmap data based on vehicle activity
        const sampleHeatmapData = {
          type: 'FeatureCollection' as const,
          features: Array.from({ length: 50 }, () => ({
            type: 'Feature' as const,
            properties: {
              activity: Math.floor(Math.random() * 100) + 1, // Activity intensity
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [
                -122.4194 + (Math.random() - 0.5) * 0.1,
                37.7749 + (Math.random() - 0.5) * 0.1,
              ],
            },
          })),
        };

        if (!map.getSource(HEATMAP_SOURCE_ID)) {
          map.addSource(HEATMAP_SOURCE_ID, {
            type: 'geojson',
            data: sampleHeatmapData,
          });
        }

        if (!map.getLayer(HEATMAP_LAYER_ID)) {
          map.addLayer({
            id: HEATMAP_LAYER_ID,
            type: 'heatmap',
            source: HEATMAP_SOURCE_ID,
            maxzoom: 15,
            paint: {
              // Increase the heatmap weight based on activity property
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'activity'],
                0,
                0,
                100,
                1,
              ],
              // Increase the heatmap color weight weight by zoom level
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                1,
                15,
                3,
              ],
              // Color ramp for heatmap
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)',
              ],
              // Adjust the heatmap radius by zoom level
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                2,
                15,
                20,
              ],
              'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                7,
                1,
                15,
                0,
              ],
            },
          });

          // Add circle layer for higher zoom levels
          map.addLayer({
            id: `${HEATMAP_LAYER_ID}-circle`,
            type: 'circle',
            source: HEATMAP_SOURCE_ID,
            minzoom: 14,
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'activity'],
                1,
                4,
                100,
                20,
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'activity'],
                0,
                'rgba(33,102,172,0.2)',
                50,
                'rgba(239,138,98,0.6)',
                100,
                'rgba(178,24,43,0.8)',
              ],
              'circle-stroke-color': 'white',
              'circle-stroke-width': 1,
              'circle-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                0,
                15,
                1,
              ],
            },
          });
        }
      } else {
        // Remove heatmap layers
        if (map.getLayer(`${HEATMAP_LAYER_ID}-circle`)) {
          map.removeLayer(`${HEATMAP_LAYER_ID}-circle`);
        }
        if (map.getLayer(HEATMAP_LAYER_ID)) {
          map.removeLayer(HEATMAP_LAYER_ID);
        }
        if (map.getSource(HEATMAP_SOURCE_ID)) {
          map.removeSource(HEATMAP_SOURCE_ID);
        }
      }

      layerStatesRef.current.heatmap = enabled;
    },
    []
  );

  const toggleMapLayer = useCallback(
    (map: MapLibreMap, featureId: string, enabled: boolean) => {
      if (!map) {
        console.warn('Map instance not available for layer toggle');
        return;
      }

      try {
        switch (featureId) {
          case 'traffic':
            toggleTrafficLayer(map, enabled);
            break;
          case 'locations':
            toggleLocationsLayer(map, enabled);
            break;
          case 'routes':
            toggleRoutesLayer(map, enabled);
            break;
          case 'heatmap':
            toggleHeatmapLayer(map, enabled);
            break;
          default:
            console.warn(`Unknown map feature: ${featureId}`);
        }
      } catch (error) {
        console.error(`Error toggling ${featureId} layer:`, error);
        // Reset the layer state if there was an error
        if (layerStatesRef.current[featureId as keyof MapLayerFeatures] !== undefined) {
          layerStatesRef.current[featureId as keyof MapLayerFeatures] = !enabled;
        }
      }
    },
    [
      toggleTrafficLayer,
      toggleLocationsLayer,
      toggleRoutesLayer,
      toggleHeatmapLayer,
    ]
  );

  const getLayerStates = useCallback(() => {
    return { ...layerStatesRef.current };
  }, []);

  return {
    toggleMapLayer,
    getLayerStates,
  };
}
