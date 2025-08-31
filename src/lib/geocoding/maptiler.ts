// MapTiler Geocoding API integration for global place search

export interface GeocodingFeature {
  id: string;
  type: 'Feature';
  place_name: string;
  properties: {
    name: string;
    place_formatted?: string;
    context?: Array<{
      id: string;
      text: string;
      wikidata?: string;
      short_code?: string;
    }>;
    category?: string;
    maki?: string;
    landmark?: boolean;
    address?: string;
    place_type?: string[];
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  bbox?: [number, number, number, number]; // [west, south, east, north]
  center?: [number, number]; // [longitude, latitude]
  place_type?: string[];
  relevance?: number;
}

export interface GeocodingResponse {
  type: 'FeatureCollection';
  query: string[];
  features: GeocodingFeature[];
  attribution: string;
}

export interface GeocodingOptions {
  limit?: number; // Max 10, default 5
  proximity?: [number, number]; // [longitude, latitude] for biasing results
  bbox?: [number, number, number, number]; // Bounding box filter
  country?: string; // ISO 3166 country code
  language?: string; // Language code for results
  types?: string[]; // Filter by place types
  excludeTypes?: boolean;
  fuzzyMatch?: boolean;
  autocomplete?: boolean;
}

class MapTilerGeocodingService {
  private readonly baseUrl = 'https://api.maptiler.com/geocoding';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('MapTiler API key not found. Set NEXT_PUBLIC_MAPTILER_API_KEY environment variable.');
    }
  }

  private buildSearchUrl(query: string, options: GeocodingOptions = {}): string {
    const params = new URLSearchParams({
      key: this.apiKey,
      limit: (options.limit || 5).toString(),
      fuzzyMatch: (options.fuzzyMatch !== false).toString(),
      autocomplete: (options.autocomplete !== false).toString(),
    });

    if (options.proximity) {
      params.set('proximity', options.proximity.join(','));
    }

    if (options.bbox) {
      params.set('bbox', options.bbox.join(','));
    }

    if (options.country) {
      params.set('country', options.country);
    }

    if (options.language) {
      params.set('language', options.language);
    }

    if (options.types && options.types.length > 0) {
      params.set('types', options.types.join(','));
    }

    if (options.excludeTypes) {
      params.set('excludeTypes', 'true');
    }

    // Encode the query properly
    const encodedQuery = encodeURIComponent(query.trim());
    return `${this.baseUrl}/${encodedQuery}.json?${params.toString()}`;
  }

  async search(query: string, options: GeocodingOptions = {}): Promise<GeocodingResponse> {
    if (!this.apiKey) {
      throw new Error('MapTiler API key is required for geocoding');
    }

    if (!query.trim()) {
      return {
        type: 'FeatureCollection',
        query: [query],
        features: [],
        attribution: 'MapTiler'
      };
    }

    const url = this.buildSearchUrl(query, options);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.status} ${response.statusText}`);
      }

      const data: GeocodingResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Geocoding search failed:', error);
      throw error;
    }
  }

  /**
   * Convert MapTiler geocoding result to our Location interface
   */
  convertToLocation(feature: GeocodingFeature): import('@/types/fleet').Location {
    const [longitude, latitude] = feature.geometry.coordinates;

    return {
      id: `geocoded-${feature.id}`,
      name: feature.properties.name || feature.place_name,
      address: feature.properties.place_formatted || feature.place_name,
      type: 'customer', // Generic type for all geocoded locations
      coordinates: {
        latitude,
        longitude,
      },
      description: feature.properties.context ? 
        feature.properties.context.map(c => c.text).join(', ') : 
        undefined,
      isActive: true,
    };
  }
}

// Export singleton instance
export const geocodingService = new MapTilerGeocodingService();

// Utility function for debounced search
export function createDebouncedSearch(delay: number = 300) {
  let timeoutId: NodeJS.Timeout;
  let abortController: AbortController | null = null;

  return async (query: string, options: GeocodingOptions = {}): Promise<GeocodingResponse> => {
    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          abortController = new AbortController();
          const result = await geocodingService.search(query, options);
          resolve(result);
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            reject(error);
          }
        }
      }, delay);
    });
  };
}
