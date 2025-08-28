// Major road coordinates in San Francisco for realistic vehicle positioning
export interface RoadPoint {
  latitude: number;
  longitude: number;
  roadName?: string;
}

export const SF_ROAD_COORDINATES: RoadPoint[] = [
  // Downtown Financial District
  { latitude: 37.7949, longitude: -122.4094, roadName: 'Market St' },
  { latitude: 37.7956, longitude: -122.4058, roadName: 'Market St' },
  { latitude: 37.7963, longitude: -122.4024, roadName: 'Market St' },
  { latitude: 37.7970, longitude: -122.3992, roadName: 'Market St' },
  
  // Mission St
  { latitude: 37.7879, longitude: -122.4074, roadName: 'Mission St' },
  { latitude: 37.7899, longitude: -122.4084, roadName: 'Mission St' },
  { latitude: 37.7919, longitude: -122.4094, roadName: 'Mission St' },
  { latitude: 37.7939, longitude: -122.4104, roadName: 'Mission St' },
  
  // Folsom St
  { latitude: 37.7869, longitude: -122.4089, roadName: 'Folsom St' },
  { latitude: 37.7889, longitude: -122.4099, roadName: 'Folsom St' },
  { latitude: 37.7909, longitude: -122.4109, roadName: 'Folsom St' },
  { latitude: 37.7929, longitude: -122.4119, roadName: 'Folsom St' },
  
  // Van Ness Ave (North-South)
  { latitude: 37.7749, longitude: -122.4194, roadName: 'Van Ness Ave' },
  { latitude: 37.7789, longitude: -122.4194, roadName: 'Van Ness Ave' },
  { latitude: 37.7829, longitude: -122.4194, roadName: 'Van Ness Ave' },
  { latitude: 37.7869, longitude: -122.4194, roadName: 'Van Ness Ave' },
  
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
  return SF_ROAD_COORDINATES[Math.floor(Math.random() * SF_ROAD_COORDINATES.length)];
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