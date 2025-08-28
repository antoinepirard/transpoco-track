'use client';

import { useState, useRef, useEffect } from 'react';
import { Gear, Car, MapPin, Path, Fire } from '@phosphor-icons/react';

interface MapFeature {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: string }>;
  enabled: boolean;
}

interface MapFeatureControlsProps {
  onFeatureToggle?: (featureId: string, enabled: boolean) => void;
  className?: string;
}

export function MapFeatureControls({
  onFeatureToggle,
  className = '',
}: MapFeatureControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [features, setFeatures] = useState<MapFeature[]>([
    { id: 'traffic', label: 'Traffic', icon: Car, enabled: false },
    { id: 'locations', label: 'Locations', icon: MapPin, enabled: false },
    { id: 'routes', label: 'Routes', icon: Path, enabled: false },
    { id: 'heatmap', label: 'Heatmap', icon: Fire, enabled: false },
  ]);

  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFeatureToggle = (featureId: string) => {
    setFeatures((prev) =>
      prev.map((feature) =>
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled }
          : feature
      )
    );

    const feature = features.find((f) => f.id === featureId);
    if (feature && onFeatureToggle) {
      onFeatureToggle(featureId, !feature.enabled);
    }
  };

  const activeCount = features.filter((f) => f.enabled).length;

  return (
    <div className={`relative ${className}`} ref={panelRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-3 rounded-lg transition-all duration-200
          border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm
          hover:bg-gray-50 hover:border-gray-300 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          ${isOpen ? 'bg-gray-100 border-gray-300' : ''}
        `}
        title="Map layer settings"
        aria-label="Toggle map layer settings"
      >
        <div className="relative">
          <Gear
            size={18}
            weight="regular"
            className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          />
          {activeCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-[8px] text-white font-medium leading-none">
                {activeCount}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Feature Panel */}
      {isOpen && (
        <div
          className={`
            absolute top-full right-0 mt-2 
            bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200
            min-w-[200px] overflow-hidden
            animate-in slide-in-from-top-2 fade-in-0 duration-200
          `}
        >
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">
              Map Layers
            </div>
            <div className="space-y-1">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureToggle(feature.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md 
                      transition-all duration-150 group
                      ${
                        feature.enabled
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent
                      size={16}
                      weight="regular"
                      className={`mr-3 transition-colors ${
                        feature.enabled
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    />
                    <span className="flex-1 text-left">{feature.label}</span>
                    {feature.enabled && (
                      <div className="w-2 h-2 bg-white rounded-full ml-2 opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
