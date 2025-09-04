'use client';

import { useCallback, useRef, useState, useLayoutEffect } from 'react';
import Image from 'next/image';
import { Menu } from '@base-ui-components/react';
import { useNavigation } from '@/contexts/NavigationContext';
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
  CaretUpIcon,
  CaretDownIcon,
  GearIcon,
  TruckIcon,
  ChartLineIcon,
  NavigationArrowIcon,
  PauseIcon,
  StopIcon,
  TargetIcon,
  CheckCircleIcon,
  WarningIcon,
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

interface NavigationSidebarDemoProps {
  onActiveItemChange?: (item: {id: string, label: string}) => void;
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
        id: 'reports',
        label: 'Reports',
        icon: ChartBarIcon,
        children: [
          {
            id: 'last-location',
            label: 'Last Location',
            icon: MapPinIcon,
            href: '/reports/last-location',
          },
          {
            id: 'fleet-summary',
            label: 'Fleet Summary',
            icon: TruckIcon,
            href: '/reports/fleet-summary',
          },
          {
            id: 'summary',
            label: 'Summary',
            icon: ChartLineIcon,
            href: '/reports/summary',
          },
          {
            id: 'journeys',
            label: 'Journeys',
            icon: NavigationArrowIcon,
            href: '/reports/journeys',
          },
          {
            id: 'idling',
            label: 'Idling',
            icon: PauseIcon,
            href: '/reports/idling',
          },
          {
            id: 'stops',
            label: 'Stops',
            icon: StopIcon,
            href: '/reports/stops',
          },
          {
            id: 'stops-idling',
            label: 'Stops/Idling',
            icon: ClockIcon,
            href: '/reports/stops-idling',
          },
          {
            id: 'locations',
            label: 'Locations',
            icon: TargetIcon,
            href: '/reports/locations',
          },
          {
            id: 'route-completion-summary',
            label: 'Route Completion Summary',
            icon: CheckCircleIcon,
            href: '/reports/route-completion-summary',
          },
          {
            id: 'alerts',
            label: 'Alerts',
            icon: WarningIcon,
            href: '/reports/alerts',
          },
        ],
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

export function NavigationSidebarDemo({
  onActiveItemChange,
}: NavigationSidebarDemoProps) {
  const navRef = useRef<HTMLElement>(null);
  const { toggleExpandedItem, isItemExpanded } = useNavigation();
  // Local active state just for demo purposes (no routing)
  const [activeItemId, setActiveItemId] = useState<string>('live-map');
  // Brand selection state
  const [selectedBrand, setSelectedBrand] = useState<'transpoco' | 'safely'>('transpoco');
  // Menu hover state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Measure trigger width to match popup width
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuWidth, setMenuWidth] = useState<number>(0);

  useLayoutEffect(() => {
    const update = () => {
      const w = triggerRef.current?.getBoundingClientRect().width ?? 0;
      setMenuWidth(w);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const handleMenuEnter = useCallback(() => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    menuTimeoutRef.current = setTimeout(() => {
      setMenuOpen(true);
    }, 100);
  }, []);

  const handleMenuLeave = useCallback(() => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    menuTimeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 150);
  }, []);

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
        e.preventDefault();
        console.log('[Demo] Delete action for item:', itemId);
      }
    },
    []
  );


  return (
    <div className="w-68 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4">
        <div 
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <Menu.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Menu.Trigger
              ref={triggerRef}
              className="w-full bg-gray-50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:hover-only:bg-gray-100 transition-immediate"
            >
              <div className="flex items-center flex-1">
                <Image
                  src={selectedBrand === 'transpoco' ? '/transpoco-logo.svg' : '/safely-logo.svg'}
                  alt={`${selectedBrand === 'transpoco' ? 'Transpoco' : 'Safely'} logo`}
                  width={111}
                  height={26}
                  className="h-6 w-auto"
                />
              </div>
              <div className="p-1">
                <CaretDownIcon className="w-4 h-4 text-gray-600" />
              </div>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                onMouseEnter={handleMenuEnter}
                onMouseLeave={handleMenuLeave}
                className="z-50"
              >
                <Menu.Popup
                  onMouseEnter={handleMenuEnter}
                  onMouseLeave={handleMenuLeave}
                  style={{ width: menuWidth || undefined }}
                  className={`bg-white rounded-lg shadow-lg border border-gray-200 p-1 mt-2 transition-all duration-200 ease-out ${menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                >
                  <Menu.Item
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedBrand('transpoco')}
                  >
                    Transpoco
                  </Menu.Item>
                  <Menu.Item
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedBrand('safely')}
                  >
                    Safely
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </div>

      {/* Navigation */}
      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto py-4 custom-scrollbar"
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
                const isActive = activeItemId === item.id;
                const isExpanded = isItemExpanded(item.id);
                return (
                  <div key={item.id}>
                    <button
                      data-nav-item={item.id}
                      onClick={() => {
                        if (item.children) {
                          toggleExpandedItem(item.id);
                        } else {
                          setActiveItemId(item.id);
                          onActiveItemChange?.({ id: item.id, label: item.label });
                          console.log(`[Demo] Active item set to "${item.label}"`);
                        }
                      }}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      className={`w-full flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-immediate group focus-ring cursor-pointer ${
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
                        <>
                          {isExpanded ? (
                            <CaretUpIcon
                              className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0 transition-all duration-200"
                              aria-hidden="true"
                            />
                          ) : (
                            <CaretDownIcon
                              className="ml-2 h-4 w-4 text-gray-400 flex-shrink-0 transition-all duration-200"
                              aria-hidden="true"
                            />
                          )}
                        </>
                      )}
                    </button>
                    {item.children && (
                      <div 
                        className={`ml-4 overflow-hidden transition-all duration-200 ease-out ${
                          isExpanded ? 'max-h-96 mt-1' : 'max-h-0'
                        }`}
                      >
                        <div className="space-y-0.5 relative">
                          {/* Vertical line indicator */}
                          <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                          {item.children.map((childItem) => {
                            const isChildActive = activeItemId === childItem.id;
                            return (
                              <button
                                key={childItem.id}
                                data-nav-item={childItem.id}
                                onClick={() => {
                                  setActiveItemId(childItem.id);
                                  onActiveItemChange?.({ id: childItem.id, label: childItem.label });
                                  console.log(`[Demo] Active item set to "${childItem.label}"`);
                                }}
                                onKeyDown={(e) => handleKeyDown(e, childItem.id)}
                                className={`w-full flex items-center py-1.5 pr-2 pl-6 text-sm font-medium rounded-md transition-immediate group focus-ring relative cursor-pointer ${
                                  isChildActive
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'text-gray-600 hover:hover-only:bg-gray-50 hover:hover-only:text-gray-900'
                                }`}
                                aria-current={isChildActive ? 'page' : undefined}
                                role="menuitem"
                              >
                                <span className="flex-1 text-left truncate">
                                  {childItem.label}
                                </span>
                                {childItem.badge && (
                                  <span
                                    className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 tabular-nums"
                                    aria-label={`${childItem.badge} notifications`}
                                  >
                                    {childItem.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4">
        <div className="border border-gray-200 rounded-lg p-3 hover:hover-only:bg-gray-100 transition-immediate group cursor-pointer">
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
            <GearIcon className="w-4 h-4 text-gray-400 group-hover:hover-only:text-gray-600 transition-immediate" aria-hidden="true" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
