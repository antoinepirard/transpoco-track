/**
 * Simple geohash implementation for spatial caching
 * Precision levels: 5 chars ≈ 2.4km x 4.9km, 6 chars ≈ 0.6km x 1.2km
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

export function encode(
  latitude: number,
  longitude: number,
  precision = 6
): string {
  const lat = latitude;
  const lng = longitude;
  // eslint-disable-next-line prefer-const
  let latRange = [-90, 90];
  // eslint-disable-next-line prefer-const
  let lngRange = [-180, 180];
  let hash = '';
  let bit = 0;
  let ch = 0;
  let even = true;

  while (hash.length < precision) {
    if (even) {
      // longitude
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        lngRange[0] = mid;
      } else {
        lngRange[1] = mid;
      }
    } else {
      // latitude
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    even = !even;
    bit++;

    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

export function decode(hash: string): { latitude: number; longitude: number } {
  // eslint-disable-next-line prefer-const
  let latRange = [-90, 90];
  // eslint-disable-next-line prefer-const
  let lngRange = [-180, 180];
  let even = true;

  for (const char of hash) {
    const cd = BASE32.indexOf(char);
    if (cd === -1) throw new Error(`Invalid geohash character: ${char}`);

    for (let bit = 4; bit >= 0; bit--) {
      const mask = 1 << bit;
      if (even) {
        // longitude
        const mid = (lngRange[0] + lngRange[1]) / 2;
        if (cd & mask) {
          lngRange[0] = mid;
        } else {
          lngRange[1] = mid;
        }
      } else {
        // latitude
        const mid = (latRange[0] + latRange[1]) / 2;
        if (cd & mask) {
          latRange[0] = mid;
        } else {
          latRange[1] = mid;
        }
      }
      even = !even;
    }
  }

  return {
    latitude: (latRange[0] + latRange[1]) / 2,
    longitude: (lngRange[0] + lngRange[1]) / 2,
  };
}

/**
 * Get geohash neighbors for expanding search radius
 */
export function neighbors(hash: string): string[] {
  // Simplified: just return the hash itself for now
  // In production, implement proper neighbor calculation
  return [hash];
}
