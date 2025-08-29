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

  // BELFAST (Northern Ireland)
  { latitude: 54.5973, longitude: -5.9301, roadName: 'Royal Avenue' },
  { latitude: 54.5983, longitude: -5.9311, roadName: 'Royal Avenue' },
  { latitude: 54.5993, longitude: -5.9321, roadName: 'Royal Avenue' },
  { latitude: 54.6003, longitude: -5.9331, roadName: 'Royal Avenue' },
  { latitude: 54.5923, longitude: -5.9351, roadName: 'Donegall Place' },
  { latitude: 54.5933, longitude: -5.9361, roadName: 'Donegall Place' },
  { latitude: 54.5943, longitude: -5.9371, roadName: 'Donegall Place' },

  // M1 Belfast - Dublin Motorway (Northern section)
  { latitude: 54.4973, longitude: -5.9501, roadName: 'M1' },
  { latitude: 54.3973, longitude: -6.0001, roadName: 'M1' },
  { latitude: 54.2973, longitude: -6.0501, roadName: 'M1' },
  { latitude: 54.1973, longitude: -6.1001, roadName: 'M1' },
  { latitude: 54.0973, longitude: -6.1501, roadName: 'M1' },
  { latitude: 53.9973, longitude: -6.2001, roadName: 'M1' },
  { latitude: 53.8973, longitude: -6.2201, roadName: 'M1' },
  { latitude: 53.7973, longitude: -6.2301, roadName: 'M1' },
  { latitude: 53.6973, longitude: -6.2401, roadName: 'M1' },

  // DERRY/LONDONDERRY
  { latitude: 54.9958, longitude: -7.3074, roadName: 'Strand Road' },
  { latitude: 54.9968, longitude: -7.3084, roadName: 'Strand Road' },
  { latitude: 54.9978, longitude: -7.3094, roadName: 'Strand Road' },
  { latitude: 54.9938, longitude: -7.3164, roadName: 'Guildhall Square' },
  { latitude: 54.9948, longitude: -7.3174, roadName: 'Guildhall Square' },

  // SLIGO  
  { latitude: 54.2766, longitude: -8.4761, roadName: 'Wine Street' },
  { latitude: 54.2776, longitude: -8.4771, roadName: 'Wine Street' },
  { latitude: 54.2786, longitude: -8.4781, roadName: 'Wine Street' },
  { latitude: 54.2696, longitude: -8.4851, roadName: 'O\'Connell Street' },
  { latitude: 54.2706, longitude: -8.4861, roadName: 'O\'Connell Street' },

  // WATERFORD
  { latitude: 52.2593, longitude: -7.1101, roadName: 'The Quay' },
  { latitude: 52.2603, longitude: -7.1111, roadName: 'The Quay' },
  { latitude: 52.2613, longitude: -7.1121, roadName: 'The Quay' },
  { latitude: 52.2543, longitude: -7.1051, roadName: 'Barronstrand Street' },
  { latitude: 52.2553, longitude: -7.1061, roadName: 'Barronstrand Street' },

  // KILKENNY
  { latitude: 52.6541, longitude: -7.2448, roadName: 'High Street' },
  { latitude: 52.6551, longitude: -7.2458, roadName: 'High Street' },
  { latitude: 52.6561, longitude: -7.2468, roadName: 'High Street' },
  { latitude: 52.6491, longitude: -7.2518, roadName: 'Patrick Street' },
  { latitude: 52.6501, longitude: -7.2528, roadName: 'Patrick Street' },

  // TRALEE (Kerry)
  { latitude: 52.2713, longitude: -9.7016, roadName: 'The Mall' },
  { latitude: 52.2723, longitude: -9.7026, roadName: 'The Mall' },
  { latitude: 52.2733, longitude: -9.7036, roadName: 'The Mall' },
  { latitude: 52.2663, longitude: -9.7086, roadName: 'Castle Street' },
  { latitude: 52.2673, longitude: -9.7096, roadName: 'Castle Street' },

  // LETTERKENNY (Donegal)
  { latitude: 54.9503, longitude: -7.7348, roadName: 'Main Street' },
  { latitude: 54.9513, longitude: -7.7358, roadName: 'Main Street' },
  { latitude: 54.9523, longitude: -7.7368, roadName: 'Main Street' },
  { latitude: 54.9453, longitude: -7.7418, roadName: 'Upper Main Street' },
  { latitude: 54.9463, longitude: -7.7428, roadName: 'Upper Main Street' },

  // M4 Dublin - Galway Motorway
  { latitude: 53.3298, longitude: -6.4203, roadName: 'M4' },
  { latitude: 53.3298, longitude: -6.5203, roadName: 'M4' },
  { latitude: 53.3298, longitude: -6.6203, roadName: 'M4' }, // Lucan
  { latitude: 53.3398, longitude: -6.7203, roadName: 'M4' }, // Leixlip
  { latitude: 53.3498, longitude: -6.8203, roadName: 'M4' }, // Maynooth
  { latitude: 53.3698, longitude: -7.0203, roadName: 'M4' }, // Kilcock
  { latitude: 53.3898, longitude: -7.2203, roadName: 'M4' }, // Kinnegad
  { latitude: 53.4098, longitude: -7.4203, roadName: 'M4' }, // Mullingar area
  { latitude: 53.4398, longitude: -7.6203, roadName: 'M4' },
  { latitude: 53.4698, longitude: -7.8203, roadName: 'M4' }, // Athlone area
  { latitude: 53.4398, longitude: -8.0203, roadName: 'M4' },
  { latitude: 53.3898, longitude: -8.2203, roadName: 'M4' },
  { latitude: 53.3398, longitude: -8.4203, roadName: 'M4' },
  { latitude: 53.2998, longitude: -8.6203, roadName: 'M4' },
  { latitude: 53.2798, longitude: -8.8203, roadName: 'M4' },
  { latitude: 53.2698, longitude: -9.0203, roadName: 'M4' }, // Approaching Galway

  // M9 Dublin - Waterford Motorway  
  { latitude: 53.2298, longitude: -6.1803, roadName: 'M9' }, // Leaving Dublin
  { latitude: 53.1298, longitude: -6.1703, roadName: 'M9' },
  { latitude: 53.0298, longitude: -6.1603, roadName: 'M9' },
  { latitude: 52.9298, longitude: -6.2503, roadName: 'M9' },
  { latitude: 52.8298, longitude: -6.3403, roadName: 'M9' }, // Carlow area
  { latitude: 52.7298, longitude: -6.5403, roadName: 'M9' },
  { latitude: 52.6298, longitude: -6.7403, roadName: 'M9' }, // Kilkenny area
  { latitude: 52.5298, longitude: -6.8403, roadName: 'M9' },
  { latitude: 52.4298, longitude: -6.9403, roadName: 'M9' },
  { latitude: 52.3298, longitude: -7.0403, roadName: 'M9' }, // Approaching Waterford

  // N15 Sligo - Donegal  
  { latitude: 54.3766, longitude: -8.3761, roadName: 'N15' },
  { latitude: 54.4766, longitude: -8.2761, roadName: 'N15' },
  { latitude: 54.5766, longitude: -8.1761, roadName: 'N15' },
  { latitude: 54.6766, longitude: -8.0761, roadName: 'N15' },
  { latitude: 54.7766, longitude: -7.9761, roadName: 'N15' },
  { latitude: 54.8766, longitude: -7.8761, roadName: 'N15' },

  // N22 Cork - Tralee
  { latitude: 51.8985, longitude: -8.5756, roadName: 'N22' }, // Leaving Cork
  { latitude: 51.9085, longitude: -8.6756, roadName: 'N22' },
  { latitude: 51.9185, longitude: -8.7756, roadName: 'N22' },
  { latitude: 51.9285, longitude: -8.8756, roadName: 'N22' }, // Macroom area
  { latitude: 51.9385, longitude: -8.9756, roadName: 'N22' },
  { latitude: 51.9985, longitude: -9.0756, roadName: 'N22' },
  { latitude: 52.0585, longitude: -9.1756, roadName: 'N22' },
  { latitude: 52.1185, longitude: -9.2756, roadName: 'N22' },
  { latitude: 52.1785, longitude: -9.3756, roadName: 'N22' },
  { latitude: 52.2385, longitude: -9.4756, roadName: 'N22' },
  { latitude: 52.2585, longitude: -9.5756, roadName: 'N22' }, // Approaching Tralee

  // Additional Regional Routes
  // N6 Dublin - Galway (alternative/local route)
  { latitude: 53.3398, longitude: -6.3503, roadName: 'N6' },
  { latitude: 53.3498, longitude: -6.4503, roadName: 'N6' },
  { latitude: 53.3598, longitude: -6.5503, roadName: 'N6' },
  { latitude: 53.3798, longitude: -6.7503, roadName: 'N6' },
  { latitude: 53.3998, longitude: -7.0503, roadName: 'N6' },
  { latitude: 53.4198, longitude: -7.3503, roadName: 'N6' },
  { latitude: 53.4398, longitude: -7.6503, roadName: 'N6' },
  { latitude: 53.3898, longitude: -7.9503, roadName: 'N6' },
  { latitude: 53.3398, longitude: -8.2503, roadName: 'N6' },
  { latitude: 53.2998, longitude: -8.5503, roadName: 'N6' },
  { latitude: 53.2798, longitude: -8.8503, roadName: 'N6' },

  // West Coast Routes
  // Wild Atlantic Way segments
  { latitude: 55.3766, longitude: -7.2761, roadName: 'Wild Atlantic Way' }, // Donegal
  { latitude: 54.9766, longitude: -7.7761, roadName: 'Wild Atlantic Way' },
  { latitude: 54.6766, longitude: -8.2761, roadName: 'Wild Atlantic Way' }, // Sligo
  { latitude: 54.2766, longitude: -8.6761, roadName: 'Wild Atlantic Way' },
  { latitude: 53.7766, longitude: -9.1761, roadName: 'Wild Atlantic Way' }, // Mayo
  { latitude: 53.4766, longitude: -9.4761, roadName: 'Wild Atlantic Way' },
  { latitude: 53.2766, longitude: -9.6761, roadName: 'Wild Atlantic Way' }, // Galway
  { latitude: 52.9766, longitude: -9.7761, roadName: 'Wild Atlantic Way' },
  { latitude: 52.6766, longitude: -9.8761, roadName: 'Wild Atlantic Way' }, // Clare
  { latitude: 52.3766, longitude: -9.9761, roadName: 'Wild Atlantic Way' },
  { latitude: 52.0766, longitude: -10.0761, roadName: 'Wild Atlantic Way' }, // Kerry
  { latitude: 51.7766, longitude: -10.1761, roadName: 'Wild Atlantic Way' },
  { latitude: 51.4766, longitude: -9.9761, roadName: 'Wild Atlantic Way' }, // West Cork
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

  // BELFAST SEGMENTS
  {
    id: 16,
    start: { id: 100, latitude: 54.5973, longitude: -5.9301, roadName: 'Royal Avenue' },
    end: { id: 101, latitude: 54.5983, longitude: -5.9311, roadName: 'Royal Avenue' },
    length: 120,
    roadName: 'Royal Avenue',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [17],
  },
  {
    id: 17,
    start: { id: 101, latitude: 54.5983, longitude: -5.9311, roadName: 'Royal Avenue' },
    end: { id: 102, latitude: 54.5993, longitude: -5.9321, roadName: 'Royal Avenue' },
    length: 120,
    roadName: 'Royal Avenue',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [16, 18],
  },
  {
    id: 18,
    start: { id: 102, latitude: 54.5993, longitude: -5.9321, roadName: 'Royal Avenue' },
    end: { id: 103, latitude: 54.6003, longitude: -5.9331, roadName: 'Royal Avenue' },
    length: 120,
    roadName: 'Royal Avenue',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [17, 19],
  },
  {
    id: 19,
    start: { id: 103, latitude: 54.6003, longitude: -5.9331, roadName: 'Royal Avenue' },
    end: { id: 104, latitude: 54.5923, longitude: -5.9351, roadName: 'Donegall Place' },
    length: 950,
    roadName: 'Belfast City Centre',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [18, 20],
  },

  // M1 MOTORWAY SEGMENTS (Belfast - Dublin)
  {
    id: 20,
    start: { id: 110, latitude: 54.4973, longitude: -5.9501, roadName: 'M1' },
    end: { id: 111, latitude: 54.3973, longitude: -6.0001, roadName: 'M1' },
    length: 12000,
    roadName: 'M1',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [19, 21],
  },
  {
    id: 21,
    start: { id: 111, latitude: 54.3973, longitude: -6.0001, roadName: 'M1' },
    end: { id: 112, latitude: 54.2973, longitude: -6.0501, roadName: 'M1' },
    length: 12000,
    roadName: 'M1',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [20, 22],
  },
  {
    id: 22,
    start: { id: 112, latitude: 54.2973, longitude: -6.0501, roadName: 'M1' },
    end: { id: 113, latitude: 54.1973, longitude: -6.1001, roadName: 'M1' },
    length: 12000,
    roadName: 'M1',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [21, 23],
  },

  // CORK SEGMENTS
  {
    id: 23,
    start: { id: 120, latitude: 51.8985, longitude: -8.4756, roadName: 'Patrick Street' },
    end: { id: 121, latitude: 51.8995, longitude: -8.4766, roadName: 'Patrick Street' },
    length: 120,
    roadName: 'Patrick Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [24],
  },
  {
    id: 24,
    start: { id: 121, latitude: 51.8995, longitude: -8.4766, roadName: 'Patrick Street' },
    end: { id: 122, latitude: 51.9005, longitude: -8.4776, roadName: 'Patrick Street' },
    length: 120,
    roadName: 'Patrick Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [23, 25],
  },

  // GALWAY SEGMENTS
  {
    id: 25,
    start: { id: 130, latitude: 53.2744, longitude: -9.0492, roadName: 'Shop Street' },
    end: { id: 131, latitude: 53.2754, longitude: -9.0502, roadName: 'Shop Street' },
    length: 120,
    roadName: 'Shop Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [26],
  },
  {
    id: 26,
    start: { id: 131, latitude: 53.2754, longitude: -9.0502, roadName: 'Shop Street' },
    end: { id: 132, latitude: 53.2764, longitude: -9.0512, roadName: 'Shop Street' },
    length: 120,
    roadName: 'Shop Street',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [25, 27],
  },

  // M4 DUBLIN-GALWAY MOTORWAY SEGMENTS
  {
    id: 27,
    start: { id: 140, latitude: 53.3298, longitude: -6.4203, roadName: 'M4' },
    end: { id: 141, latitude: 53.3298, longitude: -6.5203, roadName: 'M4' },
    length: 8000,
    roadName: 'M4',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [28],
  },
  {
    id: 28,
    start: { id: 141, latitude: 53.3298, longitude: -6.5203, roadName: 'M4' },
    end: { id: 142, latitude: 53.3398, longitude: -6.7203, roadName: 'M4' },
    length: 15000,
    roadName: 'M4',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [27, 29],
  },
  {
    id: 29,
    start: { id: 142, latitude: 53.3398, longitude: -6.7203, roadName: 'M4' },
    end: { id: 143, latitude: 53.4098, longitude: -7.4203, roadName: 'M4' },
    length: 45000,
    roadName: 'M4',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [28, 30],
  },
  {
    id: 30,
    start: { id: 143, latitude: 53.4098, longitude: -7.4203, roadName: 'M4' },
    end: { id: 144, latitude: 53.2698, longitude: -9.0203, roadName: 'M4' },
    length: 95000,
    roadName: 'M4',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [29, 25],
  },

  // WATERFORD SEGMENTS
  {
    id: 31,
    start: { id: 150, latitude: 52.2593, longitude: -7.1101, roadName: 'The Quay' },
    end: { id: 151, latitude: 52.2603, longitude: -7.1111, roadName: 'The Quay' },
    length: 120,
    roadName: 'The Quay',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [32],
  },
  {
    id: 32,
    start: { id: 151, latitude: 52.2603, longitude: -7.1111, roadName: 'The Quay' },
    end: { id: 152, latitude: 52.2613, longitude: -7.1121, roadName: 'The Quay' },
    length: 120,
    roadName: 'The Quay',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [31, 33],
  },

  // M9 DUBLIN-WATERFORD SEGMENTS
  {
    id: 33,
    start: { id: 160, latitude: 53.2298, longitude: -6.1803, roadName: 'M9' },
    end: { id: 161, latitude: 52.8298, longitude: -6.3403, roadName: 'M9' },
    length: 55000,
    roadName: 'M9',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [34],
  },
  {
    id: 34,
    start: { id: 161, latitude: 52.8298, longitude: -6.3403, roadName: 'M9' },
    end: { id: 162, latitude: 52.3298, longitude: -7.0403, roadName: 'M9' },
    length: 75000,
    roadName: 'M9',
    roadType: 'freeway',
    speedLimit: 120,
    connectedSegments: [33, 31],
  },

  // WILD ATLANTIC WAY SEGMENTS
  {
    id: 35,
    start: { id: 170, latitude: 55.3766, longitude: -7.2761, roadName: 'Wild Atlantic Way' },
    end: { id: 171, latitude: 54.6766, longitude: -8.2761, roadName: 'Wild Atlantic Way' },
    length: 85000,
    roadName: 'Wild Atlantic Way',
    roadType: 'avenue',
    speedLimit: 80,
    connectedSegments: [36],
  },
  {
    id: 36,
    start: { id: 171, latitude: 54.6766, longitude: -8.2761, roadName: 'Wild Atlantic Way' },
    end: { id: 172, latitude: 53.2766, longitude: -9.6761, roadName: 'Wild Atlantic Way' },
    length: 165000,
    roadName: 'Wild Atlantic Way',
    roadType: 'avenue',
    speedLimit: 80,
    connectedSegments: [35, 37, 25],
  },
  {
    id: 37,
    start: { id: 172, latitude: 53.2766, longitude: -9.6761, roadName: 'Wild Atlantic Way' },
    end: { id: 173, latitude: 51.4766, longitude: -9.9761, roadName: 'Wild Atlantic Way' },
    length: 205000,
    roadName: 'Wild Atlantic Way',
    roadType: 'avenue',
    speedLimit: 80,
    connectedSegments: [36, 23],
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
