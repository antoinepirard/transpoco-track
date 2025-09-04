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
  UsersIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockClockwiseIcon,
  PlusIcon,
  ReceiptIcon,
  CreditCardIcon,
  BookOpenIcon,
  KeyIcon,
  DownloadIcon,
  CloudArrowDownIcon,
  UserPlusIcon,
  ArrowLeftIcon,
} from '@phosphor-icons/react';
import { NavigationItemGroupDemo } from './NavigationItemGroupDemo';

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
        id: 'setup',
        label: 'Setup',
        icon: GearIcon,
        children: [
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
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Compliance',
    items: [
      {
        id: 'cameras',
        label: 'Cameras',
        icon: CameraIcon,
      },
      {
        id: 'driving-style',
        label: 'Driving Style',
        icon: SteeringWheelIcon,
      },
      {
        id: 'walkaround',
        label: 'Walkaround',
        icon: ListChecksIcon,
      },
      {
        id: 'bikly',
        label: 'Bikly',
        icon: ShieldIcon,
      },
    ],
  },
  {
    id: 'efficiency',
    title: 'Asset & Cost Management',
    items: [
      {
        id: 'maintain',
        label: 'Maintain',
        icon: WrenchIcon,
        children: [
          {
            id: 'service',
            label: 'Service',
            icon: WrenchIcon,
            href: '/maintain/service',
          },
          {
            id: 'types',
            label: 'Types',
            icon: SquaresFourIcon,
            href: '/maintain/types',
          },
          {
            id: 'garage',
            label: 'Garage',
            icon: TruckIcon,
            href: '/maintain/garage',
          },
        ],
      },
      {
        id: 'temperature',
        label: 'Temperature',
        icon: ThermometerIcon,
      },
      {
        id: 'cost-management',
        label: 'Cost Management',
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
    id: 'ai',
    title: 'Marketplace',
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

const settingsNavigationData: NavigationSection[] = [
  {
    id: 'users-permissions',
    title: 'Users & Permissions',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: UsersIcon,
      },
      {
        id: 'profiles',
        label: 'Profiles',
        icon: UserCircleIcon,
      },
      {
        id: 'security-settings',
        label: 'Security Settings',
        icon: ShieldCheckIcon,
      },
    ],
  },
  {
    id: 'company-details',
    title: 'Company Details',
    items: [
      {
        id: 'audit-logs',
        label: 'Audit logs',
        icon: ClockClockwiseIcon,
      },
      {
        id: 'shift-time',
        label: 'Shift Time',
        icon: ClockIcon,
      },
    ],
  },
  {
    id: 'orders-billing',
    title: 'Orders & Billing',
    items: [
      {
        id: 'add-new-vehicles',
        label: 'Add New Vehicles',
        icon: PlusIcon,
      },
      {
        id: 'view-orders',
        label: 'View Orders',
        icon: ReceiptIcon,
      },
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: CreditCardIcon,
      },
    ],
  },
  {
    id: 'api-resources',
    title: 'API Resources',
    items: [
      {
        id: 'api-documentation',
        label: 'API Documentation',
        icon: BookOpenIcon,
      },
      {
        id: 'request-api-access',
        label: 'Request API Access',
        icon: KeyIcon,
      },
    ],
  },
  {
    id: 'import-wizard',
    title: 'Import Wizard',
    items: [
      {
        id: 'import-services',
        label: 'Import Services',
        icon: DownloadIcon,
      },
      {
        id: 'import-drivers',
        label: 'Import Drivers',
        icon: UserPlusIcon,
      },
      {
        id: 'import-purchases',
        label: 'Import Purchases',
        icon: CloudArrowDownIcon,
      },
    ],
  },
];

export function NavigationSidebarDemo({
  onActiveItemChange,
}: NavigationSidebarDemoProps) {
  const navRef = useRef<HTMLElement>(null);
  const { toggleExpandedItem, isItemExpanded, showSettingsNav, toggleSettingsNav } = useNavigation();
  // Local active state just for demo purposes (no routing)
  const [activeItemId, setActiveItemId] = useState<string>('live-map');
  const [settingsActiveItemId, setSettingsActiveItemId] = useState<string>('');
  // Brand selection state
  const [selectedBrand, setSelectedBrand] = useState<'transpoco' | 'safely'>('transpoco');
  // Menu hover state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Measure trigger width to match popup width
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuWidth, setMenuWidth] = useState<number>(0);
  
  // Demo locked items (premium features)
  const lockedItemIds = ['bikly', 'fleet-ai', 'cost-management', 'fuel-electric'];

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

  const handleLearnMore = useCallback((item: NavigationItem) => {
    console.log(`[Demo] Learn more about premium feature: "${item.label}"`);
    // In a real app, this would open a modal or navigate to a pricing page
  }, []);


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
                    className="flex flex-col items-start px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedBrand('transpoco')}
                  >
                    <span className="font-medium">Transpoco</span>
                    <span className="text-xs text-gray-500">Fleet management & tracking</span>
                  </Menu.Item>
                  <Menu.Item
                    className="flex flex-col items-start px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedBrand('safely')}
                  >
                    <span className="font-medium">Safely</span>
                    <span className="text-xs text-gray-500">AI-powered safety insights</span>
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
        aria-label={showSettingsNav ? "Settings navigation" : "Main navigation"}
      >
        <div className="transition-all duration-200 ease-in-out">
          {showSettingsNav && (
            <div className="px-4 mb-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <div className="flex items-center space-x-2 text-blue-800">
                <GearIcon className="w-4 h-4" />
                <h2 className="text-base font-semibold">Settings</h2>
              </div>
              <div className="mt-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
            </div>
          )}
          
          {(showSettingsNav ? settingsNavigationData : navigationData).map((section) => (
          <div key={section.id} className="mb-6">
            {section.title && (
              <div className="px-4 mb-2">
                <h3 className="text-xs font-medium text-gray-500">
                  {section.title}
                </h3>
              </div>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const currentActiveId = showSettingsNav ? settingsActiveItemId : activeItemId;
                const isActive = currentActiveId === item.id;
                const isExpanded = isItemExpanded(item.id);
                const isLocked = lockedItemIds.includes(item.id);
                
                const handleItemClick = (clickedItem: NavigationItem) => {
                  if (showSettingsNav) {
                    setSettingsActiveItemId(clickedItem.id);
                  } else {
                    setActiveItemId(clickedItem.id);
                  }
                  onActiveItemChange?.({ id: clickedItem.id, label: clickedItem.label });
                  console.log(`[Demo] Active item set to "${clickedItem.label}"`);
                };
                
                return (
                  <NavigationItemGroupDemo
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    isExpanded={isExpanded}
                    isLocked={isLocked}
                    activeItemId={currentActiveId}
                    lockedItemIds={lockedItemIds}
                    onItemClick={handleItemClick}
                    onExpandToggle={toggleExpandedItem}
                    onLearnMore={handleLearnMore}
                    onKeyDown={handleKeyDown}
                  />
                );
              })}
            </div>
          </div>
        ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4">
        <button
          onClick={toggleSettingsNav}
          className={`w-full border border-gray-200 rounded-lg p-3 hover:hover-only:bg-gray-100 transition-immediate group cursor-pointer focus-ring text-left ${
            showSettingsNav ? 'bg-blue-50 border-blue-200' : ''
          }`}
        >
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
            <p className="text-xs text-gray-500 truncate">
              {showSettingsNav ? 'Settings' : 'Transpoco'}
            </p>
          </div>
          <div className="p-1">
            {showSettingsNav ? (
              <ArrowLeftIcon className="w-4 h-4 text-blue-500 transition-immediate" aria-hidden="true" />
            ) : (
              <GearIcon className="w-4 h-4 text-gray-400 group-hover:hover-only:text-gray-600 transition-immediate" aria-hidden="true" />
            )}
          </div>
          </div>
        </button>
      </div>
    </div>
  );
}
