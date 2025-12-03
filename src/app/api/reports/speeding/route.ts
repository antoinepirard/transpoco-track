import { NextRequest } from 'next/server';
import { speedingDataGenerator } from '@/lib/demo/speedingDataGenerator';
import type { SpeedingStatsResponse } from '@/types/speeding';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = searchParams.get('endDate') || new Date().toISOString().slice(0, 10);
  const groupBy = (searchParams.get('groupBy') || 'vehicle') as 'vehicle' | 'driver';

  // Generate mock speeding data based on groupBy parameter
  const data = groupBy === 'vehicle'
    ? speedingDataGenerator.generateVehicleSpeedingData()
    : speedingDataGenerator.generateDriverSpeedingData();

  // Calculate fleet average
  const fleetAverage = speedingDataGenerator.calculateFleetAverage(data);

  const response: SpeedingStatsResponse = {
    data,
    fleetAverage,
    dateRange: {
      startDate,
      endDate,
    },
    groupBy,
  };

  return Response.json(response);
}
