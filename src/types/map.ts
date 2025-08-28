import type { Feature, Point, LineString } from 'geojson';
import type { Layer } from '@deck.gl/core';
import type { Vehicle, VehiclePosition } from './fleet';

export interface MapStyle {
  version: 8;
  name: string;
  sources: Record<string, MapSource>;
  layers: MapLayer[];
  glyphs?: string;
  sprite?: string;
}

export interface MapSource {
  type: 'vector' | 'raster' | 'geojson' | 'image' | 'video';
  url?: string;
  tiles?: string[];
  data?: Feature | string;
  minzoom?: number;
  maxzoom?: number;
}

export interface MapLayer {
  id: string;
  type: 'fill' | 'line' | 'symbol' | 'circle' | 'fill-extrusion' | 'raster' | 'background';
  source?: string;
  'source-layer'?: string;
  layout?: Record<string, unknown>;
  paint?: Record<string, unknown>;
  filter?: unknown[];
  minzoom?: number;
  maxzoom?: number;
}

export interface DeckGLLayer {
  id: string;
  type: string;
  data: unknown[];
  visible: boolean;
  pickable: boolean;
  updateTriggers?: Record<string, unknown>;
}

export interface VehicleLayerProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onVehicleHover?: (vehicle: Vehicle | null) => void;
  showTrails?: boolean;
  clusterVehicles?: boolean;
}

export interface TrailLayerProps {
  trails: VehiclePosition[][];
  selectedVehicleId?: string;
  colors?: string[];
  width?: number;
  opacity?: number;
}

export interface HeatmapLayerProps {
  positions: VehiclePosition[];
  radius?: number;
  intensity?: number;
  threshold?: number;
}

export interface MapControls {
  showZoom: boolean;
  showCompass: boolean;
  showScale: boolean;
  showFullscreen: boolean;
  showGeolocate: boolean;
  showNavigation: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ClusterData {
  cluster: boolean;
  cluster_id?: number;
  point_count?: number;
  point_count_abbreviated?: string;
  coordinates: [number, number];
  vehicles?: Vehicle[];
}

export interface MapInteractionState {
  isDragging: boolean;
  isHovering: boolean;
  hoveredObject?: unknown;
  clickedObject?: unknown;
}

export interface MapConfiguration {
  style: string | MapStyle;
  accessToken?: string;
  apiKey?: string;
  maxZoom: number;
  minZoom: number;
  maxBounds?: [[number, number], [number, number]];
  attributionControl: boolean;
  logoControl: boolean;
}