'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NavigationSidebarDemo } from '@/components/navigation/NavigationSidebarDemo';
import { NavigationSidebarWithTopBar } from '@/components/navigation/NavigationSidebarWithTopBar';
import { NavigationSidebarWithDualTopBar } from '@/components/navigation/NavigationSidebarWithDualTopBar';
import { NavigationSidebarWithSubmenus } from '@/components/navigation/NavigationSidebarWithSubmenus';
import { NavigationSidebarWithTopBarSearch } from '@/components/navigation/NavigationSidebarWithTopBarSearch';

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
  {
    id: 'sidebar-with-dual-topbar',
    name: 'Sidebar with Dual Top Bar',
    description: 'Main sidebar with primary top bar for categories and secondary top bar for sub-items',
    component: NavigationSidebarWithDualTopBar,
  },
  {
    id: 'sidebar-with-submenus',
    name: 'Sidebar with Submenus',
    description: 'Sidebar navigation with integrated settings dropdown submenus',
    component: NavigationSidebarWithSubmenus,
  },
  {
    id: 'topbar-with-search',
    name: 'Topbar with Search',
    description: 'Sidebar navigation with top bar containing integrated search, settings, messages, and notifications',
    component: NavigationSidebarWithTopBarSearch,
  },
];

function NavigationDemoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState<{id: string, label: string} | null>({ id: 'live-map', label: 'Live map' });

  // Get variant from URL params or default to first variant
  const urlVariant = searchParams.get('variant');
  const selectedVariantId = navigationVariants.find(v => v.id === urlVariant)?.id || navigationVariants[0].id;

  // Get the current variant
  const currentVariant = navigationVariants.find(v => v.id === selectedVariantId) || navigationVariants[0];
  const CurrentNavigationComponent = currentVariant.component;

  // Handle variant change by updating URL
  const handleVariantChange = useCallback((variantId: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (variantId === navigationVariants[0].id) {
      // Remove variant param if it's the default variant
      newSearchParams.delete('variant');
    } else {
      newSearchParams.set('variant', variantId);
    }
    const newUrl = newSearchParams.toString() ? `?${newSearchParams.toString()}` : '';
    router.push(`/new-navigation${newUrl}`, { scroll: false });
  }, [searchParams, router]);

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
              onChange={(e) => handleVariantChange(e.target.value)}
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
      <Suspense fallback={<div>Loading navigation variants...</div>}>
        <NavigationDemoContent />
      </Suspense>
    </NavigationProvider>
  );
}
