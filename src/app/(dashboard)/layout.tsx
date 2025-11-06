'use client';

import { NavigationProvider } from '@/contexts/NavigationContext';
import { NavigationSidebar } from '@/components/navigation/NavigationSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <NavigationSidebar>
        {children}
      </NavigationSidebar>
    </NavigationProvider>
  );
}