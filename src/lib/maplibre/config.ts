import type { MapConfiguration } from '@/types/map';

// Fallback map style that doesn't require API key
export const FALLBACK_MAP_STYLE = 'https://demotiles.maplibre.org/style.json';

// Professional map style with high contrast roads for fleet management
export const DEFAULT_MAP_STYLE =
  'https://api.maptiler.com/maps/bright-v2/style.json';

export const DEFAULT_MAP_CONFIG: MapConfiguration = {
  style: DEFAULT_MAP_STYLE,
  maxZoom: 22,
  minZoom: 1,
  attributionControl: true,
  logoControl: false,
};

export const MAP_STYLES = {
  // Professional fleet management styles (ordered by road contrast)
  bright: 'https://api.maptiler.com/maps/bright-v2/style.json', // High contrast roads - BEST for fleet tracking
  dataviz: 'https://api.maptiler.com/maps/dataviz/style.json', // Clean, data-focused style with good road visibility
  basic: 'https://api.maptiler.com/maps/basic-v2/style.json', // Minimal, business-focused style

  // Alternative professional options
  streets: 'https://api.maptiler.com/maps/streets-v2/style.json', // Traditional street map
  satellite: 'https://api.maptiler.com/maps/satellite/style.json', // Satellite imagery
  hybrid: 'https://api.maptiler.com/maps/hybrid/style.json', // Satellite with labels

  // Specialized views
  topo: 'https://api.maptiler.com/maps/topo-v2/style.json', // Topographic for terrain analysis
  dark: 'https://api.maptiler.com/maps/streets-dark/style.json', // Dark theme for night operations

  // High contrast options for better vehicle visibility
  landscape: 'https://api.maptiler.com/maps/landscape/style.json', // Clean landscape view
  positron: 'https://api.maptiler.com/maps/positron/style.json', // Light, minimal style from CartoDB
} as const;

// Center on Dublin, Ireland for Transpoco fleet operations
export const INITIAL_VIEWPORT = {
  latitude: 53.3498,
  longitude: -6.2603,
  zoom: 10,
  bearing: 0,
  pitch: 0,
};

export const MAP_CONTROLS = {
  showZoom: true,
  showCompass: true,
  showScale: true,
  showFullscreen: true,
  showGeolocate: true,
  showNavigation: true,
};
