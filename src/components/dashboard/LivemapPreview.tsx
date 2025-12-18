'use client';

import { memo } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Activity } from 'lucide-react';
import { FleetMap } from '@/components/fleet/FleetMap';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFleetStore } from '@/stores/fleetStore';

interface LivemapPreviewProps {
  className?: string;
}

export const LivemapPreview = memo(function LivemapPreview({
  className,
}: LivemapPreviewProps) {
  const vehicles = useFleetStore((state) => state.getVehicles());
  const activeVehicles = vehicles.filter((v) => v.status === 'active').length;
  const inactiveVehicles = vehicles.filter(
    (v) => v.status === 'inactive'
  ).length;

  return (
    <Card className={`pb-0 overflow-hidden ${className ?? ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Live Fleet Map
            </CardTitle>
            <CardDescription>Real-time vehicle positions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {vehicles.length > 0 && (
              <>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  <Activity className="h-3 w-3 mr-1" />
                  {activeVehicles} active
                </Badge>
                {inactiveVehicles > 0 && (
                  <Badge variant="outline" className="text-muted-foreground">
                    {inactiveVehicles} inactive
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Map container with overlay */}
        <div className="relative h-[280px] overflow-hidden rounded-b-xl">
          {/* The actual map */}
          <div className="absolute inset-0">
            <FleetMap
              organizationId="demo-org"
              websocketUrl="ws://localhost:8080"
              showTrails={false}
              autoConnect={false}
              demoMode={true}
            />
          </div>

          {/* Clickable overlay */}
          <Link
            href="/livemap"
            className="absolute inset-0 z-20 cursor-pointer group"
            aria-label="Open full livemap"
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

            {/* Bottom gradient for readability */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Bottom action bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {vehicles.length} vehicles tracked
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                Open Map
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </Link>

          {/* Hide map controls in preview mode */}
          <style jsx global>{`
            .livemap-preview .maplibregl-ctrl-top-right,
            .livemap-preview .maplibregl-ctrl-bottom-left,
            .livemap-preview .maplibregl-ctrl-bottom-right {
              display: none !important;
            }
          `}</style>
        </div>
      </CardContent>
    </Card>
  );
});

LivemapPreview.displayName = 'LivemapPreview';

export default LivemapPreview;
