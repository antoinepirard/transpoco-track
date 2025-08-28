'use client';

import { useState } from 'react';
import type { Vehicle } from '@/types/fleet';

interface SidebarProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isConnected: boolean;
  showTrails: boolean;
  onVehicleSelect: (vehicle: Vehicle | null) => void;
  onToggleTrails?: (show: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  vehicles,
  selectedVehicle,
  isConnected,
  showTrails,
  onVehicleSelect,
  onToggleTrails,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white shadow-lg border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="mt-4 text-xs text-gray-500 writing-mode-vertical-lr">
          {vehicles.length}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">Fleet</h2>
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Collapse sidebar"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Fleet Statistics */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Vehicles</span>
            <div className="text-xl font-semibold text-gray-900">{vehicles.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Active</span>
            <div className="text-xl font-semibold text-green-600">
              {vehicles.filter(v => v.status === 'active').length}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Show Trails</span>
          <button
            onClick={() => onToggleTrails?.(!showTrails)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showTrails ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showTrails ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto">
        {filteredVehicles.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchTerm ? 'No vehicles match your search' : 'No vehicles available'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => onVehicleSelect(vehicle.id === selectedVehicle?.id ? null : vehicle)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{vehicle.name}</h3>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(vehicle.status)}`}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="truncate">{vehicle.registrationNumber}</div>
                  <div className="flex justify-between">
                    <span>Speed: {Math.round(vehicle.currentPosition.speed)} km/h</span>
                    {vehicle.driver && (
                      <span className="truncate ml-2">{vehicle.driver.name}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Selected Vehicle</h3>
            <button
              onClick={() => onVehicleSelect(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{selectedVehicle.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Registration:</span>
              <span className="ml-2 text-gray-900">{selectedVehicle.registrationNumber}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Position:</span>
              <span className="ml-2 text-gray-900">
                {selectedVehicle.currentPosition.latitude.toFixed(4)}, {selectedVehicle.currentPosition.longitude.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Speed:</span>
              <span className="ml-2 text-gray-900">{Math.round(selectedVehicle.currentPosition.speed)} km/h</span>
            </div>
            {selectedVehicle.driver && (
              <div>
                <span className="font-medium text-gray-700">Driver:</span>
                <span className="ml-2 text-gray-900">{selectedVehicle.driver.name}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Last Update:</span>
              <span className="ml-2 text-gray-900">
                {new Date(selectedVehicle.currentPosition.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}