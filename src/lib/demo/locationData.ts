import type { Location } from '@/types/fleet';

export const sampleLocations: Location[] = [
  {
    id: 'loc-001',
    name: 'Main Depot Dublin',
    address: '123 Industrial Estate, Dublin 12, Ireland',
    type: 'depot',
    coordinates: {
      latitude: 53.3498,
      longitude: -6.2603,
    },
    description: 'Primary vehicle depot and maintenance facility',
    operatingHours: {
      open: '06:00',
      close: '22:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    contactInfo: {
      phone: '+353 1 234 5678',
      email: 'depot@transpoco.com',
    },
    isActive: true,
  },
  {
    id: 'loc-002',
    name: 'Cork Distribution Center',
    address: '456 Commerce Park, Cork, Ireland',
    type: 'warehouse',
    coordinates: {
      latitude: 51.8985,
      longitude: -8.4756,
    },
    description: 'Southern region distribution hub',
    operatingHours: {
      open: '07:00',
      close: '19:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    contactInfo: {
      phone: '+353 21 987 6543',
      email: 'cork@transpoco.com',
    },
    isActive: true,
  },
  {
    id: 'loc-003',
    name: 'Galway Service Center',
    address: '789 West End, Galway, Ireland',
    type: 'service_center',
    coordinates: {
      latitude: 53.2707,
      longitude: -9.0568,
    },
    description: 'Vehicle maintenance and repair facility',
    operatingHours: {
      open: '08:00',
      close: '17:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    contactInfo: {
      phone: '+353 91 456 789',
      email: 'galway@transpoco.com',
    },
    isActive: true,
  },
  {
    id: 'loc-004',
    name: 'Applegreen Fuel Station M50',
    address: 'M50 Motorway Services, Dublin, Ireland',
    type: 'fuel_station',
    coordinates: {
      latitude: 53.3844,
      longitude: -6.3844,
    },
    description: 'Preferred fuel station for Dublin fleet',
    operatingHours: {
      open: '00:00',
      close: '23:59',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    contactInfo: {
      phone: '+353 1 789 1234',
    },
    isActive: true,
  },
  {
    id: 'loc-005',
    name: 'IKEA Customer Delivery',
    address: 'IKEA Dublin, Ballymun Road, Dublin 11, Ireland',
    type: 'customer',
    coordinates: {
      latitude: 53.3954,
      longitude: -6.2514,
    },
    description: 'Regular customer delivery location',
    operatingHours: {
      open: '10:00',
      close: '21:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    contactInfo: {
      phone: '+353 1 567 8901',
    },
    isActive: true,
  },
  {
    id: 'loc-006',
    name: 'Waterford Overnight Parking',
    address: 'Secure Truck Park, Waterford Industrial Estate, Ireland',
    type: 'parking',
    coordinates: {
      latitude: 52.2593,
      longitude: -7.1101,
    },
    description: 'Secure overnight parking for long-haul vehicles',
    operatingHours: {
      open: '18:00',
      close: '08:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    contactInfo: {
      phone: '+353 51 234 567',
    },
    isActive: true,
  },
  {
    id: 'loc-007',
    name: 'Limerick Warehouse',
    address: '321 Industrial Road, Limerick, Ireland',
    type: 'warehouse',
    coordinates: {
      latitude: 52.6638,
      longitude: -8.6267,
    },
    description: 'Regional storage and distribution facility',
    operatingHours: {
      open: '06:30',
      close: '18:30',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    contactInfo: {
      phone: '+353 61 345 678',
      email: 'limerick@transpoco.com',
    },
    isActive: true,
  },
  {
    id: 'loc-008',
    name: 'Tesco Distribution Hub',
    address: 'Tesco Ireland, Donabate, Co. Dublin, Ireland',
    type: 'customer',
    coordinates: {
      latitude: 53.4881,
      longitude: -6.1525,
    },
    description: 'Major retail customer distribution point',
    operatingHours: {
      open: '05:00',
      close: '23:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    contactInfo: {
      phone: '+353 1 890 1234',
    },
    isActive: true,
  },
];

export function getLocations(): Location[] {
  return sampleLocations;
}

export function getLocationById(id: string): Location | undefined {
  return sampleLocations.find(location => location.id === id);
}

export function getLocationsByType(type: Location['type']): Location[] {
  return sampleLocations.filter(location => location.type === type && location.isActive);
}

export function searchLocations(query: string): Location[] {
  if (!query.trim()) return sampleLocations.filter(loc => loc.isActive);
  
  const lowerQuery = query.toLowerCase().trim();
  return sampleLocations.filter(location => {
    if (!location.isActive) return false;
    
    return (
      location.name.toLowerCase().includes(lowerQuery) ||
      location.address.toLowerCase().includes(lowerQuery) ||
      location.type.toLowerCase().includes(lowerQuery) ||
      location.description?.toLowerCase().includes(lowerQuery)
    );
  });
}
