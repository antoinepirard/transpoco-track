'use client';

import { useState } from 'react';
import { FleetMap } from '@/components/fleet/FleetMap';
import { NavigationSidebar } from '@/components/navigation/NavigationSidebar';

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
        {/* Header - positioned absolutely over the content */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 decorative">
          <h1 className="text-2xl font-semibold text-white bg-black bg-opacity-50 px-4 py-2 rounded-md backdrop-blur-sm">
            Transpoco Track
          </h1>
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
