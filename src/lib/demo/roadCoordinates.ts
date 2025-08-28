// Major road coordinates in San Francisco for realistic vehicle positioning
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

export const SF_ROAD_COORDINATES: RoadPoint[] = [
  // Downtown Financial District - Market St
  { id: 0, latitude: 37.7949, longitude: -122.4094, roadName: 'Market St' },
  { id: 1, latitude: 37.7956, longitude: -122.4058, roadName: 'Market St' },
  { id: 2, latitude: 37.7963, longitude: -122.4024, roadName: 'Market St' },
  { id: 3, latitude: 37.7970, longitude: -122.3992, roadName: 'Market St' },
  
  // Mission St
  { id: 4, latitude: 37.7879, longitude: -122.4074, roadName: 'Mission St' },
  { id: 5, latitude: 37.7899, longitude: -122.4084, roadName: 'Mission St' },
  { id: 6, latitude: 37.7919, longitude: -122.4094, roadName: 'Mission St' },
  { id: 7, latitude: 37.7939, longitude: -122.4104, roadName: 'Mission St' },
  
  // Folsom St
  { id: 8, latitude: 37.7869, longitude: -122.4089, roadName: 'Folsom St' },
  { id: 9, latitude: 37.7889, longitude: -122.4099, roadName: 'Folsom St' },
  { id: 10, latitude: 37.7909, longitude: -122.4109, roadName: 'Folsom St' },
  { id: 11, latitude: 37.7929, longitude: -122.4119, roadName: 'Folsom St' },
  
  // Van Ness Ave (North-South)
  { id: 12, latitude: 37.7749, longitude: -122.4194, roadName: 'Van Ness Ave' },
  { id: 13, latitude: 37.7789, longitude: -122.4194, roadName: 'Van Ness Ave' },
  { id: 14, latitude: 37.7829, longitude: -122.4194, roadName: 'Van Ness Ave' },
  { id: 15, latitude: 37.7869, longitude: -122.4194, roadName: 'Van Ness Ave' },
  
  // Geary Blvd (East-West)
  { latitude: 37.7817, longitude: -122.4089, roadName: 'Geary Blvd' },
  { latitude: 37.7817, longitude: -122.4149, roadName: 'Geary Blvd' },
  { latitude: 37.7817, longitude: -122.4209, roadName: 'Geary Blvd' },
  { latitude: 37.7817, longitude: -122.4269, roadName: 'Geary Blvd' },
  
  // California St
  { latitude: 37.7919, longitude: -122.4089, roadName: 'California St' },
  { latitude: 37.7919, longitude: -122.4149, roadName: 'California St' },
  { latitude: 37.7919, longitude: -122.4209, roadName: 'California St' },
  { latitude: 37.7919, longitude: -122.4269, roadName: 'California St' },
  
  // Pine St
  { latitude: 37.7887, longitude: -122.4089, roadName: 'Pine St' },
  { latitude: 37.7887, longitude: -122.4149, roadName: 'Pine St' },
  { latitude: 37.7887, longitude: -122.4209, roadName: 'Pine St' },
  { latitude: 37.7887, longitude: -122.4269, roadName: 'Pine St' },
  
  // Bush St
  { latitude: 37.7907, longitude: -122.4089, roadName: 'Bush St' },
  { latitude: 37.7907, longitude: -122.4149, roadName: 'Bush St' },
  { latitude: 37.7907, longitude: -122.4209, roadName: 'Bush St' },
  { latitude: 37.7907, longitude: -122.4269, roadName: 'Bush St' },
  
  // 19th Ave (North-South)
  { latitude: 37.7549, longitude: -122.4749, roadName: '19th Ave' },
  { latitude: 37.7649, longitude: -122.4749, roadName: '19th Ave' },
  { latitude: 37.7749, longitude: -122.4749, roadName: '19th Ave' },
  { latitude: 37.7849, longitude: -122.4749, roadName: '19th Ave' },
  
  // Irving St (Sunset District)
  { latitude: 37.7639, longitude: -122.4539, roadName: 'Irving St' },
  { latitude: 37.7639, longitude: -122.4639, roadName: 'Irving St' },
  { latitude: 37.7639, longitude: -122.4739, roadName: 'Irving St' },
  { latitude: 37.7639, longitude: -122.4839, roadName: 'Irving St' },
  
  // Judah St
  { latitude: 37.7619, longitude: -122.4539, roadName: 'Judah St' },
  { latitude: 37.7619, longitude: -122.4639, roadName: 'Judah St' },
  { latitude: 37.7619, longitude: -122.4739, roadName: 'Judah St' },
  { latitude: 37.7619, longitude: -122.4839, roadName: 'Judah St' },
  
  // Lombard St
  { latitude: 37.8019, longitude: -122.4089, roadName: 'Lombard St' },
  { latitude: 37.8019, longitude: -122.4149, roadName: 'Lombard St' },
  { latitude: 37.8019, longitude: -122.4209, roadName: 'Lombard St' },
  { latitude: 37.8019, longitude: -122.4269, roadName: 'Lombard St' },
  
  // Broadway
  { latitude: 37.7969, longitude: -122.4089, roadName: 'Broadway' },
  { latitude: 37.7969, longitude: -122.4149, roadName: 'Broadway' },
  { latitude: 37.7969, longitude: -122.4209, roadName: 'Broadway' },
  { latitude: 37.7969, longitude: -122.4269, roadName: 'Broadway' },
  
  // Union St
  { latitude: 37.7989, longitude: -122.4089, roadName: 'Union St' },
  { latitude: 37.7989, longitude: -122.4149, roadName: 'Union St' },
  { latitude: 37.7989, longitude: -122.4209, roadName: 'Union St' },
  { latitude: 37.7989, longitude: -122.4269, roadName: 'Union St' },
  
  // Fillmore St (North-South)
  { latitude: 37.7749, longitude: -122.4319, roadName: 'Fillmore St' },
  { latitude: 37.7789, longitude: -122.4319, roadName: 'Fillmore St' },
  { latitude: 37.7829, longitude: -122.4319, roadName: 'Fillmore St' },
  { latitude: 37.7869, longitude: -122.4319, roadName: 'Fillmore St' },
  
  // Divisadero St
  { latitude: 37.7749, longitude: -122.4389, roadName: 'Divisadero St' },
  { latitude: 37.7789, longitude: -122.4389, roadName: 'Divisadero St' },
  { latitude: 37.7829, longitude: -122.4389, roadName: 'Divisadero St' },
  { latitude: 37.7869, longitude: -122.4389, roadName: 'Divisadero St' },
  
  // 3rd St (South of Market)
  { latitude: 37.7709, longitude: -122.3909, roadName: '3rd St' },
  { latitude: 37.7749, longitude: -122.3909, roadName: '3rd St' },
  { latitude: 37.7789, longitude: -122.3909, roadName: '3rd St' },
  { latitude: 37.7829, longitude: -122.3909, roadName: '3rd St' },
  
  // 4th St
  { latitude: 37.7709, longitude: -122.3979, roadName: '4th St' },
  { latitude: 37.7749, longitude: -122.3979, roadName: '4th St' },
  { latitude: 37.7789, longitude: -122.3979, roadName: '4th St' },
  { latitude: 37.7829, longitude: -122.3979, roadName: '4th St' },
  
  // 101 Freeway (US-101)
  { latitude: 37.7569, longitude: -122.4049, roadName: 'US-101' },
  { latitude: 37.7629, longitude: -122.4049, roadName: 'US-101' },
  { latitude: 37.7689, longitude: -122.4049, roadName: 'US-101' },
  { latitude: 37.7749, longitude: -122.4049, roadName: 'US-101' },
  
  // 280 Freeway (I-280)
  { latitude: 37.7409, longitude: -122.4319, roadName: 'I-280' },
  { latitude: 37.7469, longitude: -122.4389, roadName: 'I-280' },
  { latitude: 37.7529, longitude: -122.4459, roadName: 'I-280' },
  { latitude: 37.7589, longitude: -122.4529, roadName: 'I-280' },
];

export function getRandomRoadCoordinate(): RoadPoint {
  return SF_ROAD_COORDINATES[Math.floor(Math.random() * SF_ROAD_COORDINATES.length)]!;
}

export function getNearbyRoadCoordinates(point: RoadPoint, radiusKm: number = 2): RoadPoint[] {
  return SF_ROAD_COORDINATES.filter(road => {
    const distance = calculateDistance(point.latitude, point.longitude, road.latitude, road.longitude);
    return distance <= radiusKm;
  });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Road segments for realistic path following
export const SF_ROAD_SEGMENTS: RoadSegment[] = [
  // Market St segments
  {
    id: 0, 
    start: { id: 0, latitude: 37.7949, longitude: -122.4094, roadName: 'Market St' },
    end: { id: 1, latitude: 37.7956, longitude: -122.4058, roadName: 'Market St' },
    length: 320,
    roadName: 'Market St',
    roadType: 'boulevard',
    speedLimit: 40,
    connectedSegments: [1, 4] // connects to next Market segment and Mission St
  },
  {
    id: 1,
    start: { id: 1, latitude: 37.7956, longitude: -122.4058, roadName: 'Market St' },
    end: { id: 2, latitude: 37.7963, longitude: -122.4024, roadName: 'Market St' },
    length: 300,
    roadName: 'Market St',
    roadType: 'boulevard', 
    speedLimit: 40,
    connectedSegments: [0, 2, 5] // previous Market, next Market, Mission
  },
  {
    id: 2,
    start: { id: 2, latitude: 37.7963, longitude: -122.4024, roadName: 'Market St' },
    end: { id: 3, latitude: 37.7970, longitude: -122.3992, roadName: 'Market St' },
    length: 290,
    roadName: 'Market St',
    roadType: 'boulevard',
    speedLimit: 40,
    connectedSegments: [1, 6] // previous Market, Mission
  },
  
  // Mission St segments
  {
    id: 3,
    start: { id: 4, latitude: 37.7879, longitude: -122.4074, roadName: 'Mission St' },
    end: { id: 5, latitude: 37.7899, longitude: -122.4084, roadName: 'Mission St' },
    length: 220,
    roadName: 'Mission St',
    roadType: 'street',
    speedLimit: 35,
    connectedSegments: [4, 8] // next Mission, Folsom
  },
  {
    id: 4,
    start: { id: 5, latitude: 37.7899, longitude: -122.4084, roadName: 'Mission St' },
    end: { id: 6, latitude: 37.7919, longitude: -122.4094, roadName: 'Mission St' },
    length: 225,
    roadName: 'Mission St', 
    roadType: 'street',
    speedLimit: 35,
    connectedSegments: [0, 3, 5, 9] // Market, prev Mission, next Mission, Folsom
  },
  {
    id: 5,
    start: { id: 6, latitude: 37.7919, longitude: -122.4094, roadName: 'Mission St' },
    end: { id: 7, latitude: 37.7939, longitude: -122.4104, roadName: 'Mission St' },
    length: 225,
    roadName: 'Mission St',
    roadType: 'street',
    speedLimit: 35,
    connectedSegments: [1, 4, 10] // Market, prev Mission, Folsom
  },
  
  // Van Ness Ave segments (North-South)
  {
    id: 6,
    start: { id: 12, latitude: 37.7749, longitude: -122.4194, roadName: 'Van Ness Ave' },
    end: { id: 13, latitude: 37.7789, longitude: -122.4194, roadName: 'Van Ness Ave' },
    length: 440,
    roadName: 'Van Ness Ave',
    roadType: 'avenue',
    speedLimit: 45,
    connectedSegments: [7]
  },
  {
    id: 7,
    start: { id: 13, latitude: 37.7789, longitude: -122.4194, roadName: 'Van Ness Ave' },
    end: { id: 14, latitude: 37.7829, longitude: -122.4194, roadName: 'Van Ness Ave' },
    length: 440,
    roadName: 'Van Ness Ave',
    roadType: 'avenue',
    speedLimit: 45,
    connectedSegments: [6, 8]
  },
  {
    id: 8,
    start: { id: 14, latitude: 37.7829, longitude: -122.4194, roadName: 'Van Ness Ave' },
    end: { id: 15, latitude: 37.7869, longitude: -122.4194, roadName: 'Van Ness Ave' },
    length: 440,
    roadName: 'Van Ness Ave',
    roadType: 'avenue', 
    speedLimit: 45,
    connectedSegments: [7, 3] // connects to Mission
  },
  
  // Cross-connections between streets
  {
    id: 9,
    start: { id: 9, latitude: 37.7889, longitude: -122.4099, roadName: 'Folsom St' },
    end: { id: 5, latitude: 37.7899, longitude: -122.4084, roadName: 'Mission St' },
    length: 180,
    roadName: 'Cross St',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [4, 10]
  },
  {
    id: 10,
    start: { id: 10, latitude: 37.7909, longitude: -122.4109, roadName: 'Folsom St' },
    end: { id: 6, latitude: 37.7919, longitude: -122.4094, roadName: 'Mission St' },
    length: 180,
    roadName: 'Cross St',
    roadType: 'street',
    speedLimit: 30,
    connectedSegments: [5, 9]
  }
];

// Helper function to get segment by ID
export function getSegmentById(id: number): RoadSegment | undefined {
  return SF_ROAD_SEGMENTS.find(segment => segment.id === id);
}

// Get all segments connected to a given segment
export function getConnectedSegments(segmentId: number): RoadSegment[] {
  const segment = getSegmentById(segmentId);
  if (!segment) return [];
  
  return segment.connectedSegments
    .map(id => getSegmentById(id))
    .filter((s): s is RoadSegment => s !== undefined);
}