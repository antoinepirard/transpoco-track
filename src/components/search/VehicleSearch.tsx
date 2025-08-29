'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XIcon,
  CaretRightIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';
import { useFleetStore } from '@/stores/fleetStore';
import type { Vehicle } from '@/types/fleet';

interface VehicleSearchProps {
  className?: string;
  placeholder?: string;
  onVehicleSelect?: (vehicle: Vehicle | null) => void;
  onReportSelect?: (vehicle: Vehicle, reportType: string) => void;
}

interface ReportOption {
  id: string;
  label: string;
  description?: string;
}

export function VehicleSearch({
  className = '',
  placeholder = 'Search vehicles...',
  onVehicleSelect,
  onReportSelect,
}: VehicleSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showReports, setShowReports] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { getVehicles, getVehicle, selectedVehicleId, selectVehicle } =
    useFleetStore();
  const vehicles = getVehicles();

  // Get the currently selected vehicle
  const selectedVehicle = useMemo(
    () => (selectedVehicleId ? getVehicle(selectedVehicleId) : undefined),
    [selectedVehicleId, getVehicle]
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
      .filter((vehicle: Vehicle) => {
        return (
          vehicle.name.toLowerCase().includes(lowerQuery) ||
          vehicle.registrationNumber.toLowerCase().includes(lowerQuery) ||
          vehicle.driver?.name.toLowerCase().includes(lowerQuery) ||
          vehicle.type.toLowerCase().includes(lowerQuery)
        );
      })
      .sort((a: Vehicle, b: Vehicle) => {
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

  // Handle clicks outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Close search dropdown
      if (isOpen && inputRef.current && listRef.current) {
        if (
          !inputRef.current.contains(target) &&
          !listRef.current.parentElement?.contains(target)
        ) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      }

      // Close reports dropdown
      if (showReports && reportsRef.current) {
        if (!reportsRef.current.contains(target)) {
          setShowReports(false);
        }
      }
    };

    if (isOpen || showReports) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showReports]);

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
    setShowReports(false);
    selectVehicle(null);
    onVehicleSelect?.(null);
    inputRef.current?.focus();
  };

  // Available reports for selected vehicle
  const availableReports: ReportOption[] = [
    { id: 'last-location-map', label: 'Last Location (Map)' },
    { id: 'last-location-report', label: 'Last Location (Report)' },
    { id: 'summary', label: 'Summary' },
    { id: 'journeys', label: 'Journeys' },
    { id: 'stops', label: 'Stops' },
    { id: 'idling', label: 'Idling' },
    { id: 'stops-idling', label: 'Stops/Idling' },
    { id: 'locations', label: 'Locations' },
    { id: 'operating-summary', label: 'Operating Summary' },
    { id: 'operating-activity', label: 'Operating Activity' },
    { id: 'route-completion', label: 'Route Completion Detail' },
    { id: 'alerts', label: 'Alerts' },
  ];

  const handleReportSelect = (reportType: string) => {
    if (selectedVehicle) {
      if (onReportSelect) {
        onReportSelect(selectedVehicle, reportType);
      }
      setShowReports(false);
      // Navigate to reports page with vehicle pre-selected
      const params = new URLSearchParams({
        driver: selectedVehicle.driver?.name || 'Unknown driver',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
      });
      router.push(`/reports?${params.toString()}`);
    }
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
      <AnimatePresence>
        {selectedVehicle && !isOpen && (
          <motion.div
            className="absolute z-50 mt-2 w-full bg-white ring-1 ring-gray-300/50 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
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

              {/* Reports Section - Full width outside of grid */}
              <div
                className="border-t border-gray-200 mt-4 pt-4 relative"
                ref={reportsRef}
              >
                <button
                  onClick={() => setShowReports(!showReports)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <span>View Reports</span>
                  <motion.div
                    animate={{ rotate: showReports ? 180 : 0 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CaretDownIcon className="h-4 w-4 text-gray-500" />
                  </motion.div>
                </button>

                {/* Reports Dropdown */}
                <AnimatePresence>
                  {showReports && (
                    <motion.div
                      className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-full w-80"
                      initial={{ opacity: 0, y: -3, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -3, scale: 0.99 }}
                      transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="py-1">
                        {availableReports.map((report) => (
                          <button
                            key={report.id}
                            onClick={() => handleReportSelect(report.id)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors group"
                          >
                            <span className="text-gray-700 group-hover:text-gray-900">
                              {report.label}
                            </span>
                            <CaretRightIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown Results - only shown when searching and no vehicle selected */}
      <AnimatePresence>
        {isOpen && !selectedVehicle && filteredVehicles.length > 0 && (
          <motion.div
            className="absolute z-50 mt-1 w-full bg-white ring-1 ring-gray-300/50 rounded-lg shadow-lg max-h-64 overflow-auto"
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul
              ref={listRef}
              role="listbox"
              className="py-1"
              aria-label="Vehicle search results"
              id="vehicle-search-results"
            >
              {filteredVehicles.map((vehicle: Vehicle, index: number) => (
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {isOpen &&
          !selectedVehicle &&
          query.trim() &&
          filteredVehicles.length === 0 && (
            <motion.div
              className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: -4, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No vehicles found matching &quot;{query}&quot;
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
