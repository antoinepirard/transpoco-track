'use client';

import { Suspense } from 'react';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { NavigationSidebar } from '@/components/navigation/NavigationSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <NavigationSidebar>
          {children}
        </NavigationSidebar>
      </Suspense>
    </NavigationProvider>
  );
}