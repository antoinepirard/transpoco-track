'use client';

import { useState } from 'react';
import { FleetMap } from '@/components/fleet/FleetMap';
import { SearchInput } from '@/components/search/VehicleSearch';
import type { Location } from '@/types/fleet';

export default function Home() {
  const [mapCenter, setMapCenter] = useState<{latitude: number, longitude: number, zoom?: number} | null>(null);

  const handleLocationSelect = (location: Location | null) => {
    if (location) {
      // Center map on selected location with appropriate zoom
      setMapCenter({
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        zoom: 15 // Good zoom level for viewing a specific location
      });
    }
    console.log('Selected location:', location?.name);
  };

  return (
    <div className="relative h-full min-h-0">
      {/* Gradient overlay for better content separation */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/20 via-black/10 to-transparent z-10 pointer-events-none" />

      {/* Search Input - positioned on the left side of the map */}
      <div className="absolute top-4 left-4 z-30 w-80">
        <SearchInput
          className="w-full"
          onVehicleSelect={(vehicle) => {
            console.log('Selected vehicle:', vehicle?.name);
          }}
          onLocationSelect={handleLocationSelect}
          onReportSelect={(vehicle, reportType) => {
            console.log(
              'Selected report:',
              reportType,
              'for vehicle:',
              vehicle.name
            );
            // TODO: Implement report navigation logic
          }}
        />
      </div>

      <FleetMap
        organizationId="demo-org"
        websocketUrl="ws://localhost:8080"
        showTrails={false}
        autoConnect={false}
        demoMode={true}
        showSidebar={false}
        centerOnLocation={mapCenter}
      />
    </div>
  );
}
