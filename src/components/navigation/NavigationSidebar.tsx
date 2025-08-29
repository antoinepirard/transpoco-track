'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  BellIcon,
  ChatCircleIcon,
  GlobeIcon,
  ChartBarIcon,
  MapPinIcon,
  PathIcon,
  SquaresFourIcon,
  ClockIcon,
  WrenchIcon,
  ThermometerIcon,
  CurrencyDollarIcon,
  BatteryHighIcon,
  ListChecksIcon,
  SteeringWheelIcon,
  CameraIcon,
  RobotIcon,
  ShieldIcon,
  CaretRightIcon,
  CaretLeftIcon,
  GearIcon,
} from '@phosphor-icons/react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
  children?: NavigationItem[];
}

interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
}

interface NavigationSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigationData: NavigationSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: BellIcon,
        badge: 42,
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: ChatCircleIcon,
      },
    ],
  },
  {
    id: 'visibility',
    title: 'Visibility',
    items: [
      {
        id: 'live-map',
        label: 'Live map',
        icon: GlobeIcon,
        href: '/',
      },
      {
        id: 'live-reports',
        label: 'Live Reports',
        icon: ChartBarIcon,
        href: '/reports',
      },
      {
        id: 'locations',
        label: 'Locations',
        icon: MapPinIcon,
      },
      {
        id: 'routes',
        label: 'Routes',
        icon: PathIcon,
      },
    ],
  },
  {
    id: 'efficiency',
    title: 'Efficiency',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: SquaresFourIcon,
      },
      {
        id: 'scheduled-reports',
        label: 'Scheduled Reports',
        icon: ClockIcon,
      },
      {
        id: 'maintain',
        label: 'Maintain',
        icon: WrenchIcon,
      },
      {
        id: 'temperature',
        label: 'Temperature',
        icon: ThermometerIcon,
      },
      {
        id: 'cost-management',
        label: 'Cost Management (TCO)',
        icon: CurrencyDollarIcon,
      },
      {
        id: 'fuel-electric',
        label: 'Fuel/Electric Vehicles',
        icon: BatteryHighIcon,
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Compliance',
    items: [
      {
        id: 'walkaround',
        label: 'Walkaround',
        icon: ListChecksIcon,
      },
      {
        id: 'driving-style',
        label: 'Driving Style',
        icon: SteeringWheelIcon,
      },
      {
        id: 'cameras',
        label: 'Cameras',
        icon: CameraIcon,
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI & Insights',
    items: [
      {
        id: 'fleet-ai',
        label: 'Fleet AI',
        icon: RobotIcon,
      },
      {
        id: 'safely',
        label: 'Safely',
        icon: ShieldIcon,
      },
    ],
  },
];

export function NavigationSidebar({
  isCollapsed = false,
  onToggleCollapse,
}: NavigationSidebarProps) {
  const navRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Map pathname to navigation item ID
  const getActiveItemFromPath = (path: string): string => {
    switch (path) {
      case '/':
        return 'live-map';
      case '/reports':
        return 'live-reports';
      default:
        return 'live-map';
    }
  };

  const activeItem = getActiveItemFromPath(pathname);

  // Keyboard navigation for sequential list items
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, itemId: string) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const buttons = Array.from(
          navRef.current?.querySelectorAll('button[data-nav-item]') || []
        );
        const currentIndex = buttons.findIndex(
          (btn) => btn.getAttribute('data-nav-item') === itemId
        );

        if (currentIndex !== -1) {
          const nextIndex =
            e.key === 'ArrowDown'
              ? Math.min(currentIndex + 1, buttons.length - 1)
              : Math.max(currentIndex - 1, 0);
          (buttons[nextIndex] as HTMLElement)?.focus();
        }
      } else if (e.key === 'Backspace' && (e.metaKey || e.ctrlKey)) {
        // Handle delete with Cmd/Ctrl + Backspace (placeholder for future implementation)
        e.preventDefault();
        console.log('Delete action for item:', itemId);
      }
    },
    []
  );

  if (isCollapsed) {
    return (
      <div className="w-12 bg-white shadow-lg border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:hover-only:bg-gray-100 rounded-lg transition-immediate focus-ring"
          title="Expand navigation"
          aria-label="Expand navigation sidebar"
        >
          <CaretRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-68 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">Transpoco</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:hover-only:bg-gray-100 rounded transition-immediate focus-ring"
          title="Collapse navigation"
          aria-label="Collapse navigation sidebar"
        >
          <CaretLeftIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        {navigationData.map((section) => (
          <div key={section.id} className="mb-6">
            {section.title && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    data-nav-item={item.id}
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    className={`w-full flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-immediate group focus-ring ${
                      isActive
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-700 hover:hover-only:bg-gray-50 hover:hover-only:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    role="menuitem"
                  >
                    <IconComponent
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-immediate ${
                        isActive
                          ? 'text-blue-500'
                          : 'text-gray-400 group-hover:hover-only:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-left truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 tabular-nums"
                        aria-label={`${item.badge} notifications`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <CaretRightIcon
                        className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Image
            className="h-10 w-10 rounded-full object-cover"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile picture of Antoine Pirard"
            width={40}
            height={40}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Antoine Pirard
            </p>
            <p className="text-xs text-gray-500 truncate">Transpoco</p>
          </div>
          <button
            className="p-1 hover:hover-only:bg-gray-100 rounded transition-immediate focus-ring"
            aria-label="User settings"
            title="Settings"
          >
            <GearIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
