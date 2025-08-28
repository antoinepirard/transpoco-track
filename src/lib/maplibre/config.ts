import type { MapConfiguration } from '@/types/map';

export const DEFAULT_MAP_STYLE = 'https://api.maptiler.com/maps/streets-v2/style.json';

export const DEFAULT_MAP_CONFIG: MapConfiguration = {
  style: DEFAULT_MAP_STYLE,
  maxZoom: 22,
  minZoom: 1,
  attributionControl: true,
  logoControl: false,
};

export const MAP_STYLES = {
  streets: 'https://api.maptiler.com/maps/streets-v2/style.json',
  satellite: 'https://api.maptiler.com/maps/satellite/style.json',
  hybrid: 'https://api.maptiler.com/maps/hybrid/style.json',
  topo: 'https://api.maptiler.com/maps/topo-v2/style.json',
  dark: 'https://api.maptiler.com/maps/streets-dark/style.json',
} as const;

export const INITIAL_VIEWPORT = {
  latitude: 37.7749,
  longitude: -122.4194,
  zoom: 12,
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