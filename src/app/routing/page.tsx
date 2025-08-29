'use client';

import { useState } from 'react';
import { useFleetStore } from '@/stores/fleetStore';
import RoutingStatus from '@/components/routing/RoutingStatus';
import RoutingConfigGuide from '@/components/routing/RoutingConfigGuide';
import { getRoutingService, RoutingUtils } from '@/lib/routing';
import { fakeDataGenerator } from '@/lib/demo/fakeDataGenerator';
import type { Vehicle } from '@/types/fleet';

export default function RoutingPage() {
  const {
    getVehicles,
    routingEnabled,
    enableRouting,
    snapVehicleToRoad,
    updateVehicleWithRoadSnapping,
    getRoutingServiceHealth,
  } = useFleetStore();

  const vehicles = getVehicles();

  const [testCoords, setTestCoords] = useState({
    latitude: 53.3498,
    longitude: -6.2603,
  });
  const [snapResult, setSnapResult] = useState<{
    success: boolean;
    original?: [number, number];
    snapped?: [number, number];
    distance?: number;
    roadName?: string;
    confidence?: number;
    heading?: number;
    error?: string;
  } | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isDemoSnapping, setIsDemoSnapping] = useState(false);

  const routingService = getRoutingService();

  // Test road snapping with coordinates
  const testRoadSnapping = async () => {
    if (
      !RoutingUtils.isValidCoordinates(
        testCoords.latitude,
        testCoords.longitude
      )
    ) {
      alert('Please enter valid coordinates');
      return;
    }

    setIsSnapping(true);
    setSnapResult(null);

    try {
      const result = await routingService.snapToRoad(
        testCoords.latitude,
        testCoords.longitude,
        { radiusMeters: 100 }
      );

      setSnapResult({
        success: true,
        original: [testCoords.longitude, testCoords.latitude],
        snapped: result.location,
        distance: result.distance,
        roadName: result.roadName,
        confidence: result.confidence,
        heading: result.heading,
      });
    } catch (error) {
      setSnapResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSnapping(false);
    }
  };

  // Snap selected vehicle to road
  const snapVehicle = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle');
      return;
    }

    const success = await snapVehicleToRoad(selectedVehicle);

    if (success) {
      alert('Vehicle snapped to road successfully!');
    } else {
      alert('Failed to snap vehicle to road');
    }
  };

  // Update vehicle with road snapping
  const updateVehicleDemo = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle');
      return;
    }

    // Use test coordinates for demo
    await updateVehicleWithRoadSnapping(
      selectedVehicle,
      testCoords.latitude,
      testCoords.longitude,
      0
    );

    alert('Vehicle position updated with road snapping!');
  };

  // Snap all demo vehicles to Mapbox roads (disabled for static vehicles)
  const snapAllDemoVehicles = async () => {
    setIsDemoSnapping(true);
    try {
      // Static vehicles don't need road snapping
      alert('Demo vehicles are now static and don\'t require road snapping!');
    } catch (error) {
      alert(
        'Failed to snap demo vehicles: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    } finally {
      setIsDemoSnapping(false);
    }
  };

  const serviceHealth = getRoutingServiceHealth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Routing System</h1>
          <p className="mt-2 text-gray-600">
            Hybrid routing with Mapbox integration and local fallback for
            accurate fleet positioning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration and Status */}
          <div className="lg:col-span-1 space-y-6">
            <RoutingStatus />

            {/* Routing toggle */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Fleet Routing
              </h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={routingEnabled}
                  onChange={(e) => enableRouting(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable road snapping for vehicles
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-500">
                When enabled, vehicle positions will be automatically snapped to
                nearby roads for increased accuracy.
              </p>
            </div>

            {/* Service health details */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Service Health
              </h3>
              <div className="space-y-2">
                {Object.entries(serviceHealth).map(([service, healthy]) => (
                  <div key={service} className="flex justify-between text-xs">
                    <span className="text-gray-600 capitalize">{service}</span>
                    <span
                      className={healthy ? 'text-green-600' : 'text-red-500'}
                    >
                      {healthy ? '✓ Healthy' : '✗ Unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testing and Demo */}
          <div className="lg:col-span-2 space-y-6">
            {/* Road snapping test */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Road Snapping Test
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={testCoords.latitude}
                    onChange={(e) =>
                      setTestCoords((prev) => ({
                        ...prev,
                        latitude: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="53.3498"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={testCoords.longitude}
                    onChange={(e) =>
                      setTestCoords((prev) => ({
                        ...prev,
                        longitude: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="-6.2603"
                  />
                </div>
              </div>

              <button
                onClick={testRoadSnapping}
                disabled={isSnapping}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSnapping ? 'Snapping to Road...' : 'Test Road Snapping'}
              </button>

              {/* Results */}
              {snapResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Results
                  </h4>
                  {snapResult.success ? (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Original:</span>
                          <br />
                          <code className="text-xs bg-white px-1 rounded">
                            {snapResult.original &&
                              RoutingUtils.formatCoordinates(
                                snapResult.original[1],
                                snapResult.original[0]
                              )}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Snapped:</span>
                          <br />
                          <code className="text-xs bg-white px-1 rounded">
                            {snapResult.snapped &&
                              RoutingUtils.formatCoordinates(
                                snapResult.snapped[1],
                                snapResult.snapped[0]
                              )}
                          </code>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Distance:</span>{' '}
                          {snapResult.distance !== undefined &&
                            RoutingUtils.formatDistance(snapResult.distance)}
                        </div>
                        {snapResult.confidence && (
                          <div>
                            <span className="font-medium">Confidence:</span>{' '}
                            {(snapResult.confidence * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>

                      {snapResult.roadName && (
                        <div>
                          <span className="font-medium">Road:</span>{' '}
                          {snapResult.roadName}
                        </div>
                      )}

                      {snapResult.heading && (
                        <div>
                          <span className="font-medium">Heading:</span>{' '}
                          {snapResult.heading.toFixed(1)}°
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm">
                      <span className="font-medium">Error:</span>{' '}
                      {snapResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Vehicle demos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vehicle Operations
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Vehicle
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.slice(0, 5).map((vehicle: Vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={snapVehicle}
                  disabled={!selectedVehicle}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Snap to Road
                </button>
                <button
                  onClick={updateVehicleDemo}
                  disabled={!selectedVehicle}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Position
                </button>
                <button
                  onClick={snapAllDemoVehicles}
                  disabled={isDemoSnapping}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDemoSnapping ? 'Snapping All...' : 'Snap All Demo'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Demo Vehicle Fix:</strong> Click &ldquo;Snap All
                  Demo&rdquo; to snap the current demo vehicles to Mapbox roads.
                  Future vehicle movements will automatically use road snapping.
                </p>
              </div>

              <div className="mt-4 text-xs text-gray-600">
                These operations demonstrate the routing service integration
                with the fleet store. Vehicle positions will be updated both in
                the store and reflected on the map.
              </div>
            </div>
          </div>
        </div>

        {/* Configuration guide */}
        <div className="mt-8">
          <RoutingConfigGuide />
        </div>
      </div>
    </div>
  );
}
