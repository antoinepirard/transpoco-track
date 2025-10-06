import { NextRequest } from 'next/server';

export type ReportRow = {
  id: string;
  driver: string;
  startTime: string;
  startLocation: string;
  stopTime: string | null;
  stopLocation: string | null;
  journeyTimeSec: number;
  idleTimeSec: number;
  distanceKm: number;
  privateDistanceKm: number;
  status: 'in-progress' | 'completed';
  journeyType: 'journey' | 'idle' | 'stop';
};

// Mock data generator for demo purposes
function generateMockReports(filters: {
  startDate: string;
  endDate: string;
  driver: string;
  journeyType: string;
}): ReportRow[] {
  const drivers = [
    'Unknown driver',
    'Silvio pathway [SILVIOWD]',
    'Antoine Pirard',
    'John Smith',
    'Sarah Connor',
    'Mike Johnson',
  ];

  const locations = [
    'Ballymaloe, County Tipperary, Ireland',
    '[P] Eastern RBD | Drogheda Station, Saint Mary\'s Villas, County Louth, A92, Ireland',
    'Circle K, Foxford Road, Achamore, County Mayo, F26, Ireland',
    'Dublin CC Boundary | Collies Avenue East, Dublin, D05, Ireland',
    'Platform 4, L4013, County Tipperary, E34, Ireland',
    'Mallow Bypass, Mallow, County Cork, P51, Ireland',
    'R446, County Galway, H62, Ireland',
    'R380, County Galway, H62, Ireland',
  ];

  const reports: ReportRow[] = [];
  
  // Generate reports for Friday 29th Aug 25 to match the screenshot
  const baseDate = new Date('2025-08-29');
  
  for (let i = 0; i < 50; i++) {
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const startHour = 6 + Math.floor(Math.random() * 12); // 6AM to 6PM
    const startMinute = Math.floor(Math.random() * 60);
    const startTime = new Date(baseDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const journeyDuration = 300 + Math.floor(Math.random() * 7200); // 5 minutes to 2 hours
    const idleDuration = Math.floor(Math.random() * 600); // 0 to 10 minutes
    const distance = Math.random() * 200; // 0 to 200 km
    const privateDistance = Math.random() * distance * 0.1; // up to 10% private
    
    const isInProgress = Math.random() < 0.2; // 20% in progress
    const stopTime = isInProgress ? null : new Date(startTime.getTime() + journeyDuration * 1000);
    
    const journeyTypes: ('journey' | 'idle' | 'stop')[] = ['journey', 'idle', 'stop'];
    const journeyType = journeyTypes[Math.floor(Math.random() * journeyTypes.length)];
    
    reports.push({
      id: `report_${i + 1}`,
      driver,
      startTime: startTime.toISOString(),
      startLocation: locations[Math.floor(Math.random() * locations.length)],
      stopTime: stopTime?.toISOString() || null,
      stopLocation: isInProgress ? null : locations[Math.floor(Math.random() * locations.length)],
      journeyTimeSec: journeyDuration,
      idleTimeSec: idleDuration,
      distanceKm: parseFloat(distance.toFixed(3)),
      privateDistanceKm: parseFloat(privateDistance.toFixed(3)),
      status: isInProgress ? 'in-progress' : 'completed',
      journeyType,
    });
  }

  // Apply filters
  let filteredReports = reports;

  if (filters.driver !== 'all') {
    filteredReports = filteredReports.filter(r => r.driver === filters.driver);
  }

  if (filters.journeyType !== 'all') {
    filteredReports = filteredReports.filter(r => r.journeyType === filters.journeyType);
  }

  return filteredReports.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const filters = {
    startDate: searchParams.get('startDate') || new Date().toISOString().slice(0, 10),
    endDate: searchParams.get('endDate') || new Date().toISOString().slice(0, 10),
    driver: searchParams.get('driver') || 'all',
    journeyType: searchParams.get('journeyType') || 'all',
  };

  const reports = generateMockReports(filters);

  return Response.json(reports);
}