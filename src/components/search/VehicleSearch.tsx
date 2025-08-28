'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useFleetStore } from '@/stores/fleet';
import type { Vehicle } from '@/types/fleet';

interface VehicleSearchProps {
  className?: string;
  placeholder?: string;
  onVehicleSelect?: (vehicle: Vehicle | null) => void;
}

export function VehicleSearch({
  className = '',
  placeholder = 'Search vehicles...',
  onVehicleSelect,
}: VehicleSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { vehicles, selectedVehicleId, selectVehicle } = useFleetStore();

  // Get the currently selected vehicle
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId),
    [vehicles, selectedVehicleId]
  );

  // Handle vehicle selection
  const handleVehicleSelect = useCallback(
    (vehicle: Vehicle) => {
      setQuery(vehicle.name);
      setIsOpen(false);
      setHighlightedIndex(-1);
      selectVehicle(vehicle.id);
      onVehicleSelect?.(vehicle);
      inputRef.current?.blur();
    },
    [selectVehicle, onVehicleSelect]
  );

  // Filter and sort vehicles based on query
  const filteredVehicles = useMemo(() => {
    if (!query.trim()) {
      return vehicles.slice(0, 10); // Show first 10 vehicles when no query
    }

    const lowerQuery = query.toLowerCase().trim();
    return vehicles
      .filter((vehicle) => {
        return (
          vehicle.name.toLowerCase().includes(lowerQuery) ||
          vehicle.registrationNumber.toLowerCase().includes(lowerQuery) ||
          vehicle.driver?.name.toLowerCase().includes(lowerQuery) ||
          vehicle.type.toLowerCase().includes(lowerQuery)
        );
      })
      .sort((a, b) => {
        // Prioritize exact matches and name matches
        const aNameMatch = a.name.toLowerCase().startsWith(lowerQuery);
        const bNameMatch = b.name.toLowerCase().startsWith(lowerQuery);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8); // Limit to 8 results
  }, [query, vehicles]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredVehicles.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredVehicles[highlightedIndex]) {
            handleVehicleSelect(filteredVehicles[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredVehicles, handleVehicleSelect]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && inputRef.current && listRef.current) {
        const target = event.target as Node;
        if (
          !inputRef.current.contains(target) &&
          !listRef.current.parentElement?.contains(target)
        ) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    selectVehicle(null);
    onVehicleSelect?.(null);
    inputRef.current?.focus();
  };

  const handleClearSelection = () => {
    setQuery('');
    selectVehicle(null);
    onVehicleSelect?.(null);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
            // Clear selection when user starts typing
            if (selectedVehicle) {
              selectVehicle(null);
              onVehicleSelect?.(null);
            }
          }}
          onFocus={() => {
            if (selectedVehicle) {
              handleClearSelection();
            } else {
              setIsOpen(true);
            }
          }}
          className="block w-full pl-10 pr-10 py-3 ring-1 ring-gray-300/20 rounded-4xl bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent shadow-md"
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="vehicle-search-results"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
            type="button"
            aria-label="Clear search"
          >
            <XIcon className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Vehicle Details Card - shown when vehicle is selected */}
      {selectedVehicle && !isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedVehicle.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedVehicle.registrationNumber}
                </p>
              </div>
              <button
                onClick={handleClearSelection}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Clear selection"
              >
                <XIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <div className="flex items-center mt-1">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      selectedVehicle.status === 'active'
                        ? 'bg-green-500'
                        : selectedVehicle.status === 'maintenance'
                          ? 'bg-yellow-500'
                          : selectedVehicle.status === 'offline'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                    }`}
                  />
                  <span className="capitalize font-medium">
                    {selectedVehicle.status}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500">Type:</span>
                <p className="capitalize font-medium mt-1">
                  {selectedVehicle.type}
                </p>
              </div>

              {selectedVehicle.driver && (
                <div className="col-span-2">
                  <span className="text-gray-500">Driver:</span>
                  <p className="font-medium mt-1">
                    {selectedVehicle.driver.name}
                  </p>
                </div>
              )}

              <div>
                <span className="text-gray-500">Speed:</span>
                <p className="font-medium mt-1">
                  {Math.round(selectedVehicle.currentPosition.speed)} km/h
                </p>
              </div>

              <div>
                <span className="text-gray-500">Last Update:</span>
                <p className="font-medium mt-1">
                  {new Date(selectedVehicle.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Results - only shown when searching and no vehicle selected */}
      {isOpen && !selectedVehicle && filteredVehicles.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          <ul
            ref={listRef}
            role="listbox"
            className="py-1"
            aria-label="Vehicle search results"
            id="vehicle-search-results"
          >
            {filteredVehicles.map((vehicle, index) => (
              <li
                key={vehicle.id}
                role="option"
                aria-selected={vehicle.id === selectedVehicleId}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                  index === highlightedIndex
                    ? 'bg-blue-50'
                    : vehicle.id === selectedVehicleId
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-50'
                }`}
                onClick={() => handleVehicleSelect(vehicle)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {vehicle.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {vehicle.registrationNumber}
                      </span>
                    </div>
                    {vehicle.driver && (
                      <div className="text-xs text-gray-500 truncate">
                        Driver: {vehicle.driver.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      vehicle.status === 'active'
                        ? 'bg-green-500'
                        : vehicle.status === 'maintenance'
                          ? 'bg-yellow-500'
                          : vehicle.status === 'offline'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                    }`}
                    title={`Status: ${vehicle.status}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results */}
      {isOpen &&
        !selectedVehicle &&
        query.trim() &&
        filteredVehicles.length === 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No vehicles found matching &quot;{query}&quot;
            </div>
          </div>
        )}
    </div>
  );
}
