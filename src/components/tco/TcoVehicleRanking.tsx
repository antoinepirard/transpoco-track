'use client';

import { memo, useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Car,
  Truck,
  Bike,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VehicleTco } from '@/types/cost';
import { formatTcoCurrency } from '@/lib/demo/tcoMockData';
import { cn } from '@/lib/utils';

interface TcoVehicleRankingProps {
  vehicles: VehicleTco[];
  currency?: string;
  isLoading?: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

const VEHICLE_ICONS: Record<VehicleTco['vehicleType'], typeof Car> = {
  car: Car,
  van: Car,
  truck: Truck,
  motorcycle: Bike,
};

function VehicleRow({
  vehicle,
  rank,
  currency,
  onVehicleClick,
}: {
  vehicle: VehicleTco;
  rank: number;
  currency: string;
  onVehicleClick?: (vehicleId: string) => void;
}) {
  const isHighCost = vehicle.peerGroupMultiple >= 1.5;
  const isCritical = vehicle.peerGroupMultiple >= 2;
  const VehicleIcon = VEHICLE_ICONS[vehicle.vehicleType];
  const trendPositive = vehicle.tcoTrend <= 0;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 py-3 px-3 -mx-3 rounded-lg transition-colors cursor-pointer',
        'hover:bg-muted/50',
        isCritical && 'bg-rose-50/50 hover:bg-rose-50'
      )}
      onClick={() => onVehicleClick?.(vehicle.vehicleId)}
    >
      {/* Rank */}
      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
          rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'
        )}
      >
        {rank}
      </div>

      {/* Vehicle Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <VehicleIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium text-sm truncate">
            {vehicle.vehicleLabel}
          </span>
          {isCritical && (
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {vehicle.registrationNumber}
          </span>
          {vehicle.driver && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground truncate">
                {vehicle.driver.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* TCO / km */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <span className="font-semibold text-sm tabular-nums">
            €{vehicle.tcoPerKm.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">/km</span>
        </div>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          {trendPositive ? (
            <TrendingDown className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingUp className="h-3 w-3 text-rose-500" />
          )}
          <span
            className={cn(
              'text-xs tabular-nums',
              trendPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {Math.abs(vehicle.tcoTrend).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Monthly TCO */}
      <div className="flex-shrink-0 w-24 text-right">
        <div className="font-semibold text-sm tabular-nums">
          {formatTcoCurrency(vehicle.monthlyTco, currency)}
        </div>
        <div className="text-xs text-muted-foreground">/month</div>
      </div>

      {/* Peer Comparison Badge */}
      <div className="flex-shrink-0 w-20">
        <Badge
          variant={isCritical ? 'destructive' : isHighCost ? 'outline' : 'secondary'}
          className={cn(
            'text-xs font-medium',
            !isCritical && isHighCost && 'border-amber-300 text-amber-700 bg-amber-50'
          )}
        >
          {vehicle.peerGroupMultiple.toFixed(1)}x avg
        </Badge>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-7 w-7 bg-muted rounded-full" />
              <div className="flex-1 h-10 bg-muted rounded" />
              <div className="h-6 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const TcoVehicleRanking = memo(function TcoVehicleRanking({
  vehicles,
  currency = 'EUR',
  isLoading,
  onVehicleClick,
}: TcoVehicleRankingProps) {
  const [showAll, setShowAll] = useState(false);

  // Sort by monthly TCO descending and take top vehicles
  const sortedVehicles = [...vehicles].sort((a, b) => b.monthlyTco - a.monthlyTco);
  const displayedVehicles = showAll ? sortedVehicles.slice(0, 20) : sortedVehicles.slice(0, 10);

  // Calculate summary stats
  const top10Total = sortedVehicles.slice(0, 10).reduce((sum, v) => sum + v.monthlyTco, 0);
  const fleetTotal = sortedVehicles.reduce((sum, v) => sum + v.monthlyTco, 0);
  const top10Percentage = ((top10Total / fleetTotal) * 100).toFixed(0);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Top 10 Most Expensive Vehicles
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              These {Math.min(10, sortedVehicles.length)} vehicles represent{' '}
              <span className="font-semibold text-foreground">{top10Percentage}%</span>{' '}
              of your total fleet TCO
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold tabular-nums">
              {formatTcoCurrency(top10Total, currency)}
            </div>
            <div className="text-xs text-muted-foreground">top 10 combined</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="flex items-center gap-3 py-2 px-3 -mx-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b">
          <div className="w-7" />
          <div className="flex-1">Vehicle</div>
          <div className="w-20 text-right">TCO/km</div>
          <div className="w-24 text-right">Monthly TCO</div>
          <div className="w-20 text-center">vs Peers</div>
        </div>

        {/* Vehicle Rows */}
        <div className="divide-y divide-border/50">
          {displayedVehicles.map((vehicle, index) => (
            <VehicleRow
              key={vehicle.vehicleId}
              vehicle={vehicle}
              rank={index + 1}
              currency={currency}
              onVehicleClick={onVehicleClick}
            />
          ))}
        </div>

        {/* Show More / Less */}
        {sortedVehicles.length > 10 && (
          <div className="mt-4 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show more ({Math.min(20, sortedVehicles.length) - 10} more)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

TcoVehicleRanking.displayName = 'TcoVehicleRanking';

export default TcoVehicleRanking;

