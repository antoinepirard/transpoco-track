'use client';

import { useState } from 'react';
import { FleetMap } from '@/components/fleet/FleetMap';
import { NavigationSidebar } from '@/components/navigation/NavigationSidebar';
import { VehicleSearch } from '@/components/search/VehicleSearch';

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="w-full h-screen flex">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Vehicle Search - positioned on the left side of the map */}
        <div className="absolute top-4 left-4 z-30 w-80">
          <VehicleSearch
            placeholder="Search vehicles by name, plate, or driver..."
            className="w-full"
          />
        </div>

        <FleetMap
          organizationId="demo-org"
          websocketUrl="ws://localhost:8080"
          showTrails={false}
          autoConnect={false}
          demoMode={true}
          showSidebar={false}
        />
      </div>
    </div>
  );
}
