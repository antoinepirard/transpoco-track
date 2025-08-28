'use client';

import { FleetMap } from '@/components/fleet/FleetMap';

export default function Home() {
  return (
    <div className="w-full h-screen">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-2xl font-bold text-white bg-black bg-opacity-50 px-4 py-2 rounded-md">
          Transpoco Track
        </h1>
      </div>
      
      <FleetMap
        organizationId="demo-org"
        websocketUrl="ws://localhost:8080"
        showTrails={true}
        autoConnect={false}
      />
    </div>
  );
}
