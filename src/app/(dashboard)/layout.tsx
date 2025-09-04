'use client';

import { NavigationProvider } from '@/contexts/NavigationContext';
import { NavigationSidebar } from '@/components/navigation/NavigationSidebar';
import { useNavigation } from '@/contexts/NavigationContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar } = useNavigation();

  return (
    <div className="w-full h-screen flex">
      <NavigationSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <main className="flex-1 overflow-hidden h-full min-h-0">
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </NavigationProvider>
  );
}