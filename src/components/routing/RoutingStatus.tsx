'use client';

import { useState, useEffect } from 'react';
import { getRoutingService, type RoutingService } from '@/lib/routing';

interface RoutingStatusProps {
  className?: string;
}

export function RoutingStatus({ className = '' }: RoutingStatusProps) {
  const [routingService] = useState<RoutingService>(getRoutingService);
  const [serviceHealth, setServiceHealth] = useState<Record<string, boolean>>(
    {}
  );
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Check service health
  const checkHealth = async () => {
    setIsChecking(true);
    try {
      // Check if service is available
      const isAvailable = await routingService.isAvailable();

      // Get detailed health if available
      let health = { routing: isAvailable };

      if ('getServiceHealth' in routingService) {
        health = {
          ...health,
          ...(routingService as any).getServiceHealth(),
        };
      }

      setServiceHealth(health);
      setLastCheck(new Date());
    } catch (error) {
      console.warn('Health check failed:', error);
      setServiceHealth({ routing: false });
    } finally {
      setIsChecking(false);
    }
  };

  // Initial health check
  useEffect(() => {
    checkHealth();

    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Get status color based on health
  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600' : 'text-red-500';
  };

  // Get status icon
  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? '●' : '●';
  };

  const formatLastCheck = (date: Date | null) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  const hasMapboxKey = !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Routing Services</h3>
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-2">
        {/* Local routing status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Local Network</span>
          <div className="flex items-center gap-1">
            <span
              className={`text-xs ${getStatusColor(serviceHealth.local !== false)}`}
            >
              {getStatusIcon(serviceHealth.local !== false)}
            </span>
            <span className="text-xs text-gray-500">
              {serviceHealth.local !== false ? 'Active' : 'Error'}
            </span>
          </div>
        </div>

        {/* Mapbox routing status */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Mapbox API</span>
          <div className="flex items-center gap-1">
            <span
              className={`text-xs ${getStatusColor(serviceHealth.mapbox === true)}`}
            >
              {getStatusIcon(serviceHealth.mapbox === true)}
            </span>
            <span className="text-xs text-gray-500">
              {!hasMapboxKey
                ? 'No API Key'
                : serviceHealth.mapbox
                  ? 'Connected'
                  : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Overall routing status */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-700">
            Overall Status
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`text-xs ${getStatusColor(serviceHealth.routing !== false)}`}
            >
              {getStatusIcon(serviceHealth.routing !== false)}
            </span>
            <span className="text-xs text-gray-600">
              {serviceHealth.routing !== false ? 'Operational' : 'Degraded'}
            </span>
          </div>
        </div>
      </div>

      {/* Last check info */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Last checked: {formatLastCheck(lastCheck)}
        </span>
      </div>

      {/* Configuration hints */}
      {!hasMapboxKey && (
        <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-700">
            💡 Add{' '}
            <code className="bg-yellow-100 px-1 rounded">
              NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
            </code>{' '}
            to your environment for enhanced routing accuracy.
          </p>
        </div>
      )}
    </div>
  );
}

export default RoutingStatus;
