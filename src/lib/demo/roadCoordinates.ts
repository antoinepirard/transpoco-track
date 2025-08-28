// Major road coordinates in Ireland for realistic fleet vehicle positioning
export interface RoadPoint {
  latitude: number;
  longitude: number;
  roadName?: string;
  id?: number;
}

export interface RoadSegment {
  id: number;
  start: RoadPoint;
  end: RoadPoint;
  length: number; // in meters
  roadName: string;
  roadType: 'street' | 'boulevard' | 'avenue' | 'freeway';
  speedLimit: number; // km/h
  connectedSegments: number[]; // IDs of connected segments
}

export const IRELAND_ROAD_COORDINATES: RoadPoint[] = [
  // Dublin City Centre
  {
    id: 0,
    latitude: 53.3498,
    longitude: -6.2603,
    roadName: "O'Connell Street",
  },
  { id: 1, latitude: 53.351, longitude: -6.2603, roadName: "O'Connell Street" },
  {
    id: 2,
    latitude: 53.3522,
    longitude: -6.2603,
    roadName: "O'Connell Street",
  },
  {
    id: 3,
    latitude: 53.3534,
    longitude: -6.2603,
    roadName: "O'Connell Street",
  },

  // Grafton Street
  { id: 4, latitude: 53.3415, longitude: -6.26, roadName: 'Grafton Street' },
  { id: 5, latitude: 53.3425, longitude: -6.26, roadName: 'Grafton Street' },
  { id: 6, latitude: 53.3435, longitude: -6.26, roadName: 'Grafton Street' },
  { id: 7, latitude: 53.3445, longitude: -6.26, roadName: 'Grafton Street' },

  // Dame Street
  { id: 8, latitude: 53.3439, longitude: -6.2674, roadName: 'Dame Street' },
  { id: 9, latitude: 53.3439, longitude: -6.2644, roadName: 'Dame Street' },
  { id: 10, latitude: 53.3439, longitude: -6.2614, roadName: 'Dame Street' },
  { id: 11, latitude: 53.3439, longitude: -6.2584, roadName: 'Dame Street' },

  // Quays (River Liffey)
  { id: 12, latitude: 53.3472, longitude: -6.2693, roadName: 'North Quays' },
  { id: 13, latitude: 53.3472, longitude: -6.2663, roadName: 'North Quays' },
  { id: 14, latitude: 53.3472, longitude: -6.2633, roadName: 'North Quays' },
  { id: 15, latitude: 53.3472, longitude: -6.2603, roadName: 'North Quays' },

  // M50 Motorway (Dublin Ring Road)
  { latitude: 53.3867, longitude: -6.4429, roadName: 'M50' },
  { latitude: 53.3667, longitude: -6.4229, roadName: 'M50' },
  { latitude: 53.3467, longitude: -6.4029, roadName: 'M50' },
  { latitude: 53.3267, longitude: -6.3829, roadName: 'M50' },
  { latitude: 53.3067, longitude: -6.3629, roadName: 'M50' },
  { latitude: 53.2867, longitude: -6.3429, roadName: 'M50' },
  { latitude: 53.2667, longitude: -6.3229, roadName: 'M50' },
  { latitude: 53.2567, longitude: -6.3029, roadName: 'M50' },

  // N1 - Dublin to Belfast
  { latitude: 53.3598, longitude: -6.2503, roadName: 'N1' },
  { latitude: 53.3898, longitude: -6.2403, roadName: 'N1' },
  { latitude: 53.4198, longitude: -6.2303, roadName: 'N1' },
  { latitude: 53.4498, longitude: -6.2203, roadName: 'N1' },
  { latitude: 53.4798, longitude: -6.2103, roadName: 'N1' },

  // N2 - Dublin to Derry
  { latitude: 53.3598, longitude: -6.2703, roadName: 'N2' },
  { latitude: 53.3898, longitude: -6.2803, roadName: 'N2' },
  { latitude: 53.4198, longitude: -6.2903, roadName: 'N2' },
  { latitude: 53.4498, longitude: -6.3003, roadName: 'N2' },

  // N3 - Dublin to Cavan/Sligo
  { latitude: 53.3598, longitude: -6.2903, roadName: 'N3' },
  { latitude: 53.3798, longitude: -6.3203, roadName: 'N3' },
  { latitude: 53.3998, longitude: -6.3503, roadName: 'N3' },
  { latitude: 53.4198, longitude: -6.3803, roadName: 'N3' },

  // N4 - Dublin to Galway
  { latitude: 53.3398, longitude: -6.2903, roadName: 'N4' },
  { latitude: 53.3298, longitude: -6.3203, roadName: 'N4' },
  { latitude: 53.3198, longitude: -6.3503, roadName: 'N4' },
  { latitude: 53.3098, longitude: -6.3803, roadName: 'N4' },
  { latitude: 53.2998, longitude: -6.4103, roadName: 'N4' },

  // N7 - Dublin to Limerick
  { latitude: 53.3298, longitude: -6.2503, roadName: 'N7' },
  { latitude: 53.3098, longitude: -6.2703, roadName: 'N7' },
  { latitude: 53.2898, longitude: -6.2903, roadName: 'N7' },
  { latitude: 53.2698, longitude: -6.3103, roadName: 'N7' },
  { latitude: 53.2498, longitude: -6.3303, roadName: 'N7' },

  // N11 - Dublin to Wexford
  { latitude: 53.3398, longitude: -6.2403, roadName: 'N11' },
  { latitude: 53.3198, longitude: -6.2203, roadName: 'N11' },
  { latitude: 53.2998, longitude: -6.2003, roadName: 'N11' },
  { latitude: 53.2798, longitude: -6.1803, roadName: 'N11' },
  { latitude: 53.2598, longitude: -6.1603, roadName: 'N11' },

  // Cork routes (M8/N8)
  { latitude: 51.8985, longitude: -8.4756, roadName: 'Patrick Street' },
  { latitude: 51.8995, longitude: -8.4766, roadName: 'Patrick Street' },
  { latitude: 51.9005, longitude: -8.4776, roadName: 'Patrick Street' },
  { latitude: 51.9015, longitude: -8.4786, roadName: 'Patrick Street' },

  // Cork to Dublin M8
  { latitude: 52.1985, longitude: -8.1756, roadName: 'M8' },
  { latitude: 52.4985, longitude: -7.8756, roadName: 'M8' },
  { latitude: 52.7985, longitude: -7.5756, roadName: 'M8' },
  { latitude: 53.0985, longitude: -7.2756, roadName: 'M8' },

  // Galway routes
  { latitude: 53.2744, longitude: -9.0492, roadName: 'Shop Street' },
  { latitude: 53.2754, longitude: -9.0502, roadName: 'Shop Street' },
  { latitude: 53.2764, longitude: -9.0512, roadName: 'Shop Street' },
  { latitude: 53.2774, longitude: -9.0522, roadName: 'Shop Street' },

  // Limerick routes
  { latitude: 52.6638, longitude: -8.6267, roadName: "O'Connell Street" },
  { latitude: 52.6648, longitude: -8.6277, roadName: "O'Connell Street" },
  { latitude: 52.6658, longitude: -8.6287, roadName: "O'Connell Street" },
  { latitude: 52.6668, longitude: -8.6297, roadName: "O'Connell Street" },

  // M1 Motorway - Dublin to Belfast
  { latitude: 53.5598, longitude: -6.2103, roadName: 'M1' },
  { latitude: 53.8598, longitude: -6.1703, roadName: 'M1' },
  { latitude: 54.1598, longitude: -6.1303, roadName: 'M1' },
  { latitude: 54.4598, longitude: -6.0903, roadName: 'M1' },

  // Regional roads around Dublin
  { latitude: 53.4098, longitude: -6.1803, roadName: 'R132' }, // Swords Road
  { latitude: 53.4298, longitude: -6.1603, roadName: 'R132' },
  { latitude: 53.4498, longitude: -6.1403, roadName: 'R132' },

  { latitude: 53.2798, longitude: -6.1203, roadName: 'R118' }, // Blackrock
  { latitude: 53.2598, longitude: -6.1003, roadName: 'R118' },
  { latitude: 53.2398, longitude: -6.0803, roadName: 'R118' },

  // Airport routes
  { latitude: 53.4213, longitude: -6.2701, roadName: 'Airport Road' },
  { latitude: 53.4313, longitude: -6.2601, roadName: 'Airport Road' },
  { latitude: 53.4413, longitude: -6.2501, roadName: 'Airport Road' },

  // Port routes (Dublin Port)
  { latitude: 53.3498, longitude: -6.2103, roadName: 'East Wall Road' },
  { latitude: 53.3598, longitude: -6.2003, roadName: 'East Wall Road' },
  { latitude: 53.3698, longitude: -6.1903, roadName: 'East Wall Road' },
];

export function getRandomRoadCoordinate(): RoadPoint {
  return IRELAND_ROAD_COORDINATES[
    Math.floor(Math.random() * IRELAND_ROAD_COORDINATES.length)
  ]!;
}

export function getNearbyRoadCoordinates(
  point: RoadPoint,
  radiusKm: number = 2
): RoadPoint[] {
  return IRELAND_ROAD_COORDINATES.filter((road) => {
    const distance = calculateDistance(
      point.latitude,
      point.longitude,
      road.latitude,
      road.longitude
    );
    return distance <= radiusKm;
  });
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Road segments for realistic path following in Ireland
export const IRELAND_ROAD_SEGMENTS: RoadSegment[] = [
  // O'Connell Street segments (Dublin City Centre)
  {
    id: 0,
    start: {
      id: 0,
      latitude: 53.3498,
      longitude: -6.2603,
      roadName: "O'Connell Street",
    },
    end: {
      id: 1,
      latitude: 53.351,
      longitude: -6.2603,
      roadName: "O'Connell Street",
    },
    length: 130,
    roadName: "O'Connell Street",
    roadType: 'boulevard',
    speedLimit: 30,
    connectedSegments: [1, 4], // connects to next O'Connell segment and Dame Street
  },
  {
    id: 1,
    start: {
      id: 1,
      latitude: 53.351,
      longitude: -6.2603,
      roadName: "O'Connell Street",
    },
    end: {
      id: 2,
      latitude: 53.3522,
      longitude: -6.2603,
      roadName: "O'Connell Street",
    },
    length: 130,
    roadName: "O'Connell Street",
    roadType: 'boulevard',
    speedLimit: 30,
    connectedSegments: [0, 2, 5], // previous O'Connell, next O'Connell, Dame
  },
  {
    id: 2,
    start: {
      id: 2,
      latitude: 53.3522,
      longitude: -6.2603,
      roadName: "O'Connell Street",
    },
    end: {
      id: 3,
      latitude: 53.3534,
      longitude: -6.2603,
      roadName: "O'Connell Street",
    },
    length: 130,
    roadName: "O'Connell Street",
    roadType: 'boulevard',
    speedLimit: 30,
    connectedSegments: [1, 6], // previous O'Connell, Quays
  },

  // Dame Street segments
  {
    id: 3,
    start: {
      id: 8,
      latitude: 53.3439,
      longitude: -6.2674,
      roadName: 'Dame Street',
    },
    end: {
      id: 9,
      latitude: 53.3439,
      longitude: -6.2644,
      roadName: 'Dame Street',
    },
    length: 220,
    roadName: 'Dame Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [4, 8], // next Dame, Grafton
  },
  {
    id: 4,
    start: {
      id: 9,
      latitude: 53.3439,
      longitude: -6.2644,
      roadName: 'Dame Street',
    },
    end: {
      id: 10,
      latitude: 53.3439,
      longitude: -6.2614,
      roadName: 'Dame Street',
    },
    length: 220,
    roadName: 'Dame Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [0, 3, 5, 9], // O'Connell, prev Dame, next Dame, Grafton
  },
  {
    id: 5,
    start: {
      id: 10,
      latitude: 53.3439,
      longitude: -6.2614,
      roadName: 'Dame Street',
    },
    end: {
      id: 11,
      latitude: 53.3439,
      longitude: -6.2584,
      roadName: 'Dame Street',
    },
    length: 220,
    roadName: 'Dame Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [1, 4, 10], // O'Connell, prev Dame, Grafton
  },

  // Quays segments (North-South along River Liffey)
  {
    id: 6,
    start: {
      id: 12,
      latitude: 53.3472,
      longitude: -6.2693,
      roadName: 'North Quays',
    },
    end: {
      id: 13,
      latitude: 53.3472,
      longitude: -6.2663,
      roadName: 'North Quays',
    },
    length: 220,
    roadName: 'North Quays',
    roadType: 'avenue',
    speedLimit: 50,
    connectedSegments: [7],
  },
  {
    id: 7,
    start: {
      id: 13,
      latitude: 53.3472,
      longitude: -6.2663,
      roadName: 'North Quays',
    },
    end: {
      id: 14,
      latitude: 53.3472,
      longitude: -6.2633,
      roadName: 'North Quays',
    },
    length: 220,
    roadName: 'North Quays',
    roadType: 'avenue',
    speedLimit: 50,
    connectedSegments: [6, 8],
  },
  {
    id: 8,
    start: {
      id: 14,
      latitude: 53.3472,
      longitude: -6.2633,
      roadName: 'North Quays',
    },
    end: {
      id: 15,
      latitude: 53.3472,
      longitude: -6.2603,
      roadName: 'North Quays',
    },
    length: 220,
    roadName: 'North Quays',
    roadType: 'avenue',
    speedLimit: 50,
    connectedSegments: [7, 2], // connects to O'Connell
  },

  // M50 Motorway segments (Dublin Ring Road)
  {
    id: 9,
    start: { latitude: 53.3867, longitude: -6.4429, roadName: 'M50' },
    end: { latitude: 53.3667, longitude: -6.4229, roadName: 'M50' },
    length: 2800,
    roadName: 'M50',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [10, 15],
  },
  {
    id: 10,
    start: { latitude: 53.3667, longitude: -6.4229, roadName: 'M50' },
    end: { latitude: 53.3467, longitude: -6.4029, roadName: 'M50' },
    length: 2800,
    roadName: 'M50',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [9, 11, 16],
  },
  {
    id: 11,
    start: { latitude: 53.3467, longitude: -6.4029, roadName: 'M50' },
    end: { latitude: 53.3267, longitude: -6.3829, roadName: 'M50' },
    length: 2800,
    roadName: 'M50',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [10, 12, 17],
  },

  // N1 segments (Dublin to Belfast)
  {
    id: 12,
    start: { latitude: 53.3598, longitude: -6.2503, roadName: 'N1' },
    end: { latitude: 53.3898, longitude: -6.2403, roadName: 'N1' },
    length: 3500,
    roadName: 'N1',
    roadType: 'freeway',
    speedLimit: 100,
    connectedSegments: [13, 0],
  },
  {
    id: 13,
    start: { latitude: 53.3898, longitude: -6.2403, roadName: 'N1' },
    end: { latitude: 53.4198, longitude: -6.2303, roadName: 'N1' },
    length: 3500,
    roadName: 'N1',
    roadType: 'freeway',
    speedLimit: 100,
    connectedSegments: [12, 14],
  },

  // Cross-connections between streets
  {
    id: 14,
    start: {
      id: 5,
      latitude: 53.3425,
      longitude: -6.26,
      roadName: 'Grafton Street',
    },
    end: {
      id: 9,
      latitude: 53.3439,
      longitude: -6.2644,
      roadName: 'Dame Street',
    },
    length: 180,
    roadName: 'Nassau Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [4, 15],
  },
  {
    id: 15,
    start: {
      id: 6,
      latitude: 53.3435,
      longitude: -6.26,
      roadName: 'Grafton Street',
    },
    end: {
      id: 10,
      latitude: 53.3439,
      longitude: -6.2614,
      roadName: 'Dame Street',
    },
    length: 180,
    roadName: 'Dawson Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [5, 14],
  },
];

// Helper function to get segment by ID
export function getSegmentById(id: number): RoadSegment | undefined {
  return IRELAND_ROAD_SEGMENTS.find((segment) => segment.id === id);
}

// Get all segments connected to a given segment
export function getConnectedSegments(segmentId: number): RoadSegment[] {
  const segment = getSegmentById(segmentId);
  if (!segment) return [];

  return segment.connectedSegments
    .map((id) => getSegmentById(id))
    .filter((s): s is RoadSegment => s !== undefined);
}
