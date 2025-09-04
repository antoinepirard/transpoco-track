'use client';

import { useState } from 'react';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NavigationSidebarDemo } from '@/components/navigation/NavigationSidebarDemo';
import { useNavigation } from '@/contexts/NavigationContext';

function NavigationDemoContent() {
  const { sidebarCollapsed, toggleSidebar } = useNavigation();
  const [activeItem, setActiveItem] = useState<{id: string, label: string} | null>({ id: 'live-map', label: 'Live map' });

  return (
    <div className="w-full h-screen flex">
      <NavigationSidebarDemo
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onActiveItemChange={setActiveItem}
      />
      <main className="flex-1 overflow-hidden h-full min-h-0">
        <div className="h-full min-h-0 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-600 mb-2">
              This is a navigation demo page.
            </div>
            {activeItem && (
              <div className="text-lg font-medium text-gray-900">
                Active: {activeItem.label}
              </div>
            )}
          </div>
        </div>
      </main>
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
