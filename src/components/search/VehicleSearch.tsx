'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XIcon,
  CaretRightIcon,
  CaretDownIcon,
  FunnelIcon,
  MapPinIcon,
  TruckIcon,
  GlobeIcon,
} from '@phosphor-icons/react';
import { useFleetStore } from '@/stores/fleetStore';
import { geocodingService, createDebouncedSearch } from '@/lib/geocoding/maptiler';
import type { Vehicle, Location } from '@/types/fleet';

type SearchMode = 'vehicles' | 'locations';

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  onVehicleSelect?: (vehicle: Vehicle | null) => void;
  onLocationSelect?: (location: Location | null) => void;
  onReportSelect?: (vehicle: Vehicle, reportType: string) => void;
  defaultMode?: SearchMode;
}

interface ReportOption {
  id: string;
  label: string;
  description?: string;
}

export function SearchInput({
  className = '',
  placeholder,
  onVehicleSelect,
  onLocationSelect,
  onReportSelect,
  defaultMode = 'vehicles',
}: SearchInputProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>(defaultMode);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showReports, setShowReports] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<Location[]>([]);

  // Load recent places from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recent-places');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentPlaces(parsed.slice(0, 5)); // Keep only 5 most recent
      }
    } catch (error) {
      console.warn('Failed to load recent places from localStorage:', error);
    }
  }, []);

  // Save recent places to localStorage whenever it changes
  useEffect(() => {
    if (recentPlaces.length > 0) {
      try {
        localStorage.setItem('recent-places', JSON.stringify(recentPlaces));
      } catch (error) {
        console.warn('Failed to save recent places to localStorage:', error);
      }
    }
  }, [recentPlaces]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { getVehicles, getVehicle, selectedVehicleId, selectVehicle } = useFleetStore();
  const vehicles = getVehicles();

  // Create debounced search function for geocoding
  const debouncedGeocode = useMemo(() => createDebouncedSearch(400), []);

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

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location: Location) => {
      setQuery(location.name);
      setIsOpen(false);
      setHighlightedIndex(-1);
      
      // Add to recent places (avoid duplicates)
      setRecentPlaces(prev => {
        const filtered = prev.filter(place => place.id !== location.id);
        return [location, ...filtered].slice(0, 5); // Keep only 5 recent places
      });
      
      onLocationSelect?.(location);
      inputRef.current?.blur();
    },
    [onLocationSelect]
  );

  // Map vehicle status to filter labels
  const mapVehicleStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'offline':
      case 'inactive':
        return 'Inactive';
      case 'maintenance':
      case 'delayed':
        return 'Delayed';
      case 'accident':
      case 'emergency':
        return 'Emergency';
      default:
        return 'Inactive';
    }
  };


  // Filter and sort vehicles based on query and status filters
  const filteredVehicles = useMemo(() => {
    if (searchMode !== 'vehicles') return [];

    let filtered = vehicles;

    // Apply status filtering
    if (statusFilters.length > 0) {
      filtered = filtered.filter((vehicle: Vehicle) => {
        const vehicleStatus = mapVehicleStatus(vehicle.status);
        return statusFilters.includes(vehicleStatus);
      });
    }

    // Apply text search filtering
    if (query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      filtered = filtered.filter((vehicle: Vehicle) => {
        return (
          vehicle.name.toLowerCase().includes(lowerQuery) ||
          vehicle.registrationNumber.toLowerCase().includes(lowerQuery) ||
          vehicle.driver?.name.toLowerCase().includes(lowerQuery) ||
          vehicle.type.toLowerCase().includes(lowerQuery)
        );
      });
    }

    return filtered
      .sort((a: Vehicle, b: Vehicle) => {
        if (!query.trim()) return a.name.localeCompare(b.name);
        // Prioritize exact matches and name matches
        const lowerQuery = query.toLowerCase().trim();
        const aNameMatch = a.name.toLowerCase().startsWith(lowerQuery);
        const bNameMatch = b.name.toLowerCase().startsWith(lowerQuery);
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 20);
  }, [query, vehicles, statusFilters, searchMode]);

  // Search locations using geocoding API
  useEffect(() => {
    if (searchMode !== 'locations') return;

    // If no query, show recent places
    if (!query.trim()) {
      setLocationResults(recentPlaces);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    // Start search
    setIsSearching(true);
    setSearchError(null);

    // Perform debounced geocoding search
    debouncedGeocode(query, { limit: 8 })
      .then(response => {
        const locations = response.features.map(feature => 
          geocodingService.convertToLocation(feature)
        );
        setLocationResults(locations);
        setIsSearching(false);
      })
      .catch(error => {
        console.error('Geocoding search failed:', error);
        setSearchError('Failed to search locations. Please try again.');
        setLocationResults([]);
        setIsSearching(false);
      });
  }, [query, searchMode, recentPlaces, debouncedGeocode]);

  // Get current location results
  const filteredLocations = useMemo(() => {
    if (searchMode !== 'locations') return [];
    return locationResults;
  }, [searchMode, locationResults]);

  // Available status filters for vehicles
  const availableStatusFilters = ['Active', 'Inactive', 'Delayed', 'Accident'];

  // Toggle status filter
  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilters([]);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const currentResults = searchMode === 'vehicles' ? filteredVehicles : filteredLocations;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < currentResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && currentResults[highlightedIndex]) {
            if (searchMode === 'vehicles') {
              handleVehicleSelect(currentResults[highlightedIndex] as Vehicle);
            } else {
              handleLocationSelect(currentResults[highlightedIndex] as Location);
            }
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
  }, [isOpen, highlightedIndex, filteredVehicles, filteredLocations, handleVehicleSelect, handleLocationSelect, searchMode]);

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
    if (searchMode === 'vehicles') {
      selectVehicle(null);
      onVehicleSelect?.(null);
    } else {
      onLocationSelect?.(null);
    }
    inputRef.current?.focus();
  };

  const handleClearSelection = () => {
    setQuery('');
    setShowReports(false);
    if (searchMode === 'vehicles') {
      selectVehicle(null);
      onVehicleSelect?.(null);
    } else {
      onLocationSelect?.(null);
    }
    inputRef.current?.focus();
  };

  // Handle search mode toggle
  const handleModeToggle = (mode: SearchMode) => {
    setSearchMode(mode);
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    setShowReports(false);
    clearFilters();
    
    // Clear selections
    if (mode === 'vehicles') {
      onLocationSelect?.(null);
    } else {
      selectVehicle(null);
      onVehicleSelect?.(null);
    }
    
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

  const currentPlaceholder = placeholder || 
    (searchMode === 'vehicles' 
      ? 'Search vehicles by name, plate, or driver...' 
      : 'Search locations by name, address, or type...'
    );

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
        
        {/* Search Mode Toggle - positioned on right side, hidden when searching */}
        {!query.trim() && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <button
              onClick={() => handleModeToggle(searchMode === 'vehicles' ? 'locations' : 'vehicles')}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
              title={`Switch to ${searchMode === 'vehicles' ? 'locations' : 'vehicles'} search`}
            >
              {searchMode === 'vehicles' ? (
                <TruckIcon className="h-4 w-4 text-gray-500" />
              ) : (
                <GlobeIcon className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
        )}
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
          className="block w-full pl-10 pr-16 py-3 ring-1 ring-gray-300/20 rounded-4xl bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent shadow-md"
          placeholder={currentPlaceholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="search-results"
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
        {searchMode === 'vehicles' && selectedVehicle && !isOpen && (
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

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (searchMode === 'vehicles' ? !selectedVehicle : true) && (
          <motion.div
            className="absolute z-50 mt-1 w-full bg-white ring-1 ring-gray-300/50 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Filters - only show for vehicle mode */}
            {searchMode === 'vehicles' && (
              <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Filter by status
                    </span>
                  </div>
                  {statusFilters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableStatusFilters.map((status) => {
                    const isSelected = statusFilters.includes(status);
                    return (
                      <button
                        key={status}
                        onClick={() => toggleStatusFilter(status)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-blue-100 border-blue-200 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Places Header - only show for location mode when no query */}
            {searchMode === 'locations' && !query.trim() && recentPlaces.length > 0 && (
              <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Recent Places
                  </span>
                </div>
              </div>
            )}

            {/* Results List */}
            {(searchMode === 'vehicles' ? filteredVehicles : filteredLocations).length > 0 ? (
              <ul
                ref={listRef}
                role="listbox"
                className="py-1 overflow-auto flex-1"
                aria-label={`${searchMode} search results`}
                id="search-results"
              >
                {searchMode === 'vehicles' 
                  ? filteredVehicles.map((vehicle: Vehicle, index: number) => {
                      const vehicleStatus = mapVehicleStatus(vehicle.status);
                      return (
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
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              vehicleStatus === 'Active'
                                ? 'bg-green-100 text-green-700'
                                : vehicleStatus === 'Delayed'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : vehicleStatus === 'Accident'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}>
                              {vehicleStatus}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                vehicleStatus === 'Active'
                                  ? 'bg-green-500'
                                  : vehicleStatus === 'Delayed'
                                    ? 'bg-yellow-500'
                                    : vehicleStatus === 'Accident'
                                      ? 'bg-red-500'
                                      : 'bg-gray-400'
                              }`}
                              title={`Status: ${vehicleStatus}`}
                            />
                          </div>
                        </li>
                      );
                    })
                  : filteredLocations.map((location: Location, index: number) => {
                      return (
                        <li
                          key={location.id}
                          role="option"
                          aria-selected={false}
                          className={`px-3 py-2 cursor-pointer transition-colors ${
                            index === highlightedIndex
                              ? 'bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleLocationSelect(location)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          <div className="flex items-center">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {location.name}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-1">
                                {location.address}
                              </div>
                              {location.description && (
                                <div className="text-xs text-gray-400 truncate">
                                  {location.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })
                }
              </ul>
            ) : (
              <div className="px-3 py-8 text-sm text-gray-500 text-center">
                {searchMode === 'vehicles'
                  ? query.trim() && statusFilters.length === 0
                    ? `No vehicles found matching "${query}"`
                    : statusFilters.length > 0 && !query.trim()
                      ? `No vehicles found with status: ${statusFilters.join(', ')}`
                      : `No vehicles found matching "${query}" with status: ${statusFilters.join(', ')}`
                  : isSearching
                    ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        <span>Searching locations...</span>
                      </div>
                    )
                    : searchError
                      ? (
                        <div className="text-red-600">
                          <div className="font-medium">Search Error</div>
                          <div className="text-xs mt-1">{searchError}</div>
                        </div>
                      )
                      : query.trim()
                        ? `No locations found matching "${query}"`
                        : 'No recent places yet. Search for a location to get started.'
                }
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
