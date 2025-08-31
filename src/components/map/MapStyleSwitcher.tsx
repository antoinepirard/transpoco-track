'use client';

import React, { useState } from 'react';
import {
  MapPinIcon,
  SunIcon,
  MoonIcon,
  MountainsIcon,
  EyeIcon,
  GlobeIcon,
  CameraIcon,
} from '@phosphor-icons/react';
import { MAP_STYLES } from '@/lib/maplibre/config';

interface MapStyleSwitcherProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
  className?: string;
}

type StyleKey = keyof typeof MAP_STYLES;

interface StyleOption {
  key: StyleKey;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'professional' | 'satellite' | 'specialized';
  recommended?: boolean;
}

const STYLE_OPTIONS: StyleOption[] = [
  // Professional fleet management styles (ordered by road contrast)
  {
    key: 'bright',
    name: 'High Contrast Roads',
    description: 'Maximum road visibility - ideal for fleet tracking',
    icon: <SunIcon className="w-4 h-4" />,
    category: 'professional',
    recommended: true,
  },
  {
    key: 'dataviz',
    name: 'Data Visualization',
    description: 'Clean, data-focused style with good road visibility',
    icon: <EyeIcon className="w-4 h-4" />,
    category: 'professional',
  },
  {
    key: 'basic',
    name: 'Business Basic',
    description: 'Minimal, business-focused style with clear roads',
    icon: <MapPinIcon className="w-4 h-4" />,
    category: 'professional',
  },
  {
    key: 'positron',
    name: 'Light Professional',
    description: 'Ultra-clean minimal style for focused fleet tracking',
    icon: <SunIcon className="w-4 h-4" />,
    category: 'professional',
  },

  // Satellite and hybrid views
  {
    key: 'satellite',
    name: 'Satellite',
    description: 'High-resolution satellite imagery',
    icon: <CameraIcon className="w-4 h-4" />,
    category: 'satellite',
  },
  {
    key: 'hybrid',
    name: 'Hybrid',
    description: 'Satellite imagery with street labels',
    icon: <GlobeIcon className="w-4 h-4" />,
    category: 'satellite',
  },

  // Specialized views
  {
    key: 'streets',
    name: 'Traditional Streets',
    description: 'Classic street map view',
    icon: <MapPinIcon className="w-4 h-4" />,
    category: 'specialized',
  },
  {
    key: 'dark',
    name: 'Night Mode',
    description: 'Dark theme for night operations',
    icon: <MoonIcon className="w-4 h-4" />,
    category: 'specialized',
  },
  {
    key: 'topo',
    name: 'Topographic',
    description: 'Terrain analysis and elevation data',
    icon: <MountainsIcon className="w-4 h-4" />,
    category: 'specialized',
  },
  {
    key: 'landscape',
    name: 'Landscape',
    description: 'Clean landscape view with natural features',
    icon: <MountainsIcon className="w-4 h-4" />,
    category: 'specialized',
  },
];

export function MapStyleSwitcher({
  currentStyle,
  onStyleChange,
  className = '',
}: MapStyleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCurrentStyleOption = () => {
    const currentKey = Object.entries(MAP_STYLES).find(([, url]) =>
      currentStyle.includes(url.split('/').slice(-2, -1)[0])
    )?.[0] as StyleKey;

    return (
      STYLE_OPTIONS.find((option) => option.key === currentKey) ||
      STYLE_OPTIONS[0]
    );
  };

  const handleStyleSelect = (styleKey: StyleKey) => {
    onStyleChange(MAP_STYLES[styleKey]);
    setIsOpen(false);
  };

  const currentOption = getCurrentStyleOption();

  const groupedOptions = STYLE_OPTIONS.reduce(
    (acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    },
    {} as Record<string, StyleOption[]>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white shadow-sm rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <GlobeIcon className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2">
                Choose Map Style for Fleet Tracking
              </div>

              {/* Professional Styles */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-700 px-2 py-1 mb-1">
                  Professional Fleet Management
                </div>
                {groupedOptions.professional?.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleStyleSelect(option.key)}
                    className={`w-full flex items-start gap-3 px-2 py-2 text-left rounded-md hover:bg-gray-50 transition-colors ${
                      currentOption.key === option.key
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 ${
                        currentOption.key === option.key
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{option.name}</div>
                        {option.recommended && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Satellite Styles */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-700 px-2 py-1 mb-1">
                  Satellite & Aerial Views
                </div>
                {groupedOptions.satellite?.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleStyleSelect(option.key)}
                    className={`w-full flex items-start gap-3 px-2 py-2 text-left rounded-md hover:bg-gray-50 transition-colors ${
                      currentOption.key === option.key
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 ${
                        currentOption.key === option.key
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{option.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Specialized Styles */}
              <div>
                <div className="text-xs font-medium text-gray-700 px-2 py-1 mb-1">
                  Specialized Views
                </div>
                {groupedOptions.specialized?.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => handleStyleSelect(option.key)}
                    className={`w-full flex items-start gap-3 px-2 py-2 text-left rounded-md hover:bg-gray-50 transition-colors ${
                      currentOption.key === option.key
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 ${
                        currentOption.key === option.key
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{option.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
