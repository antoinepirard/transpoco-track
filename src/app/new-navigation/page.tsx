'use client';

import { useState, useEffect } from 'react';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NavigationSidebarDemo } from '@/components/navigation/NavigationSidebarDemo';
import { NavigationSidebarWithTopBar } from '@/components/navigation/NavigationSidebarWithTopBar';

// Define navigation variants
interface NavigationVariant {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<{ onActiveItemChange: (item: {id: string, label: string} | null) => void }>;
}

const navigationVariants: NavigationVariant[] = [
  {
    id: 'sidebar-overlay-settings',
    name: 'Sidebar with Settings Overlay',
    description: 'Main sidebar with expandable settings overlay panel',
    component: NavigationSidebarDemo,
  },
  {
    id: 'sidebar-with-topbar',
    name: 'Sidebar with Top Bar',
    description: 'Sidebar navigation with top bar containing settings, messages, and notifications',
    component: NavigationSidebarWithTopBar,
  },
  // Future variants will be added here
];

function NavigationDemoContent() {
  const [activeItem, setActiveItem] = useState<{id: string, label: string} | null>({ id: 'live-map', label: 'Live map' });
  const [selectedVariantId, setSelectedVariantId] = useState<string>('sidebar-overlay-settings');

  // Get the current variant
  const currentVariant = navigationVariants.find(v => v.id === selectedVariantId) || navigationVariants[0];
  const CurrentNavigationComponent = currentVariant.component;

  // Load saved variant from localStorage
  useEffect(() => {
    const savedVariant = localStorage.getItem('navigation-demo-variant');
    if (savedVariant && navigationVariants.find(v => v.id === savedVariant)) {
      setSelectedVariantId(savedVariant);
    }
  }, []);

  // Save variant to localStorage when changed
  useEffect(() => {
    localStorage.setItem('navigation-demo-variant', selectedVariantId);
  }, [selectedVariantId]);

  return (
    <div className="w-full h-screen flex relative">
      <CurrentNavigationComponent onActiveItemChange={setActiveItem} />
      <main className="flex-1 overflow-hidden h-full min-h-0">
        <div className="h-full min-h-0 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-600 mb-2">
              Current variant: <span className="font-medium">{currentVariant.name}</span>
            </div>
            {activeItem && (
              <div className="text-lg font-medium text-gray-900">
                Active: {activeItem.label}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Variant Selector - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex flex-col space-y-2">
            <label htmlFor="variant-select" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
              Navigation Variant
            </label>
            <select
              id="variant-select"
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
            >
              {navigationVariants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500">
              {currentVariant.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NavigationDemoPage() {
  return (
    <NavigationProvider>
      <NavigationDemoContent />
    </NavigationProvider>
  );
}
