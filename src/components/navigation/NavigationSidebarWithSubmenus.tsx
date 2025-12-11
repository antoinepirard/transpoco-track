'use client';

import { useCallback, useRef, useState, useMemo } from 'react';
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
  ShieldIcon,
  GearIcon,
  SlidersIcon,
  TruckIcon,
  ChartLineIcon,
  NavigationArrowIcon,
  PauseIcon,
  StopIcon,
  TargetIcon,
  CheckCircleIcon,
  WarningIcon,
  QuestionIcon,
  BookOpenIcon,
  EnvelopeIcon,
  FileTextIcon,
  NewspaperIcon,
  StorefrontIcon,
  PackageIcon,
  UsersIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockClockwiseIcon,
  PlusIcon,
  ReceiptIcon,
  CreditCardIcon,
  KeyIcon,
  DownloadIcon,
  CloudArrowDownIcon,
  UserPlusIcon,
  ListIcon,
  XIcon,
} from '@phosphor-icons/react';
import { NavigationItemGroupDemo } from './NavigationItemGroupDemo';
import { NavigationTooltip } from './NavigationTooltip';
import { UserAvatarDropdown } from './UserAvatarDropdown';
import { BrandSwitcher } from './BrandSwitcher';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

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

interface NavigationSidebarWithSubmenusProps {
  onActiveItemChange?: (item: { id: string; label: string }) => void;
}

// Settings submenu data for top bar dropdown
const settingsSubmenus = [
  {
    id: 'users-permissions',
    title: 'Users & Permissions',
    icon: UsersIcon,
    items: [
      { id: 'users', label: 'Users', icon: UsersIcon },
      { id: 'profiles', label: 'Profiles', icon: UserCircleIcon },
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
    icon: ClockClockwiseIcon,
    items: [
      { id: 'audit-logs', label: 'Audit logs', icon: ClockClockwiseIcon },
      { id: 'shift-time', label: 'Shift Time', icon: ClockIcon },
    ],
  },
  {
    id: 'alerts',
    title: 'Alerts',
    icon: WarningIcon,
    items: [
      { id: 'manage-alerts', label: 'Manage Alerts', icon: WarningIcon },
      { id: 'alerts-log', label: 'Alerts Log', icon: ListIcon },
    ],
  },
  {
    id: 'orders-billing',
    title: 'Orders & Billing',
    icon: CreditCardIcon,
    items: [
      { id: 'add-new-vehicles', label: 'Add New Vehicles', icon: PlusIcon },
      { id: 'view-orders', label: 'View Orders', icon: ReceiptIcon },
      { id: 'subscriptions', label: 'Subscriptions', icon: CreditCardIcon },
    ],
  },
  {
    id: 'api-resources',
    title: 'API Resources',
    icon: BookOpenIcon,
    items: [
      {
        id: 'api-documentation',
        label: 'API Documentation',
        icon: BookOpenIcon,
      },
      { id: 'request-api-access', label: 'Request API Access', icon: KeyIcon },
    ],
  },
  {
    id: 'import-wizard',
    title: 'Import Wizard',
    icon: DownloadIcon,
    items: [
      { id: 'import-services', label: 'Import Services', icon: DownloadIcon },
      { id: 'import-drivers', label: 'Import Drivers', icon: UserPlusIcon },
      {
        id: 'import-purchases',
        label: 'Import Purchases',
        icon: CloudArrowDownIcon,
      },
    ],
  },
];

// Navigation data without settings (settings now only in top bar)
const sidebarNavigationData: NavigationSection[] = [
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
        id: 'setup',
        label: 'Setup',
        icon: SlidersIcon,
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
          {
            id: 'scheduled-reports',
            label: 'Scheduled Reports',
            icon: ClockIcon,
          },
          {
            id: 'vehicles',
            label: 'Vehicles',
            icon: TruckIcon,
          },
          {
            id: 'vehicle-groups',
            label: 'Vehicle Groups',
            icon: ListIcon,
          },
          {
            id: 'drivers',
            label: 'Drivers',
            icon: UsersIcon,
          },
          {
            id: 'driver-groups',
            label: 'Driver Groups',
            icon: UsersIcon,
          },
          {
            id: 'vehicle-driver-groups',
            label: 'Vehicle Driver Groups',
            icon: UsersIcon,
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
        id: 'fuel-electric',
        label: 'Fuel/Electric Vehicles',
        icon: BatteryHighIcon,
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
        href: '/cost-management',
      },
    ],
  },
  {
    id: 'addons',
    title: 'Addons',
    items: [
      {
        id: 'marketplace',
        label: 'Marketplace',
        icon: StorefrontIcon,
      },
      {
        id: 'assets-tracking',
        label: 'Assets Tracking',
        icon: PackageIcon,
      },
      {
        id: 'trailer-tracking',
        label: 'Trailer tracking',
        icon: TruckIcon,
      },
    ],
  },
];

export function NavigationSidebarWithSubmenus({
  onActiveItemChange,
}: NavigationSidebarWithSubmenusProps) {
  const navRef = useRef<HTMLElement>(null);
  const { toggleExpandedItem, isItemExpanded, showLockedItems } =
    useNavigation();

  // Local active state
  const [activeItemId, setActiveItemId] = useState<string>('live-map');
  const [activeSettingsItemId, setActiveSettingsItemId] = useState<string>('');

  // Brand selection state (for sidebar branding)
  const [selectedBrand, setSelectedBrand] = useState<'transpoco' | 'safely'>(
    'transpoco'
  );

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Demo locked items (premium features) - memoized to prevent re-renders
  const lockedItemIds = useMemo(
    () => (showLockedItems ? ['bikly', 'cameras', 'fuel-electric'] : []),
    [showLockedItems]
  );

  // Tooltip content for locked items - memoized to prevent re-renders
  const tooltipContent = useMemo(
    () => ({
      bikly: {
        title: 'Bikly',
        description:
          'Advanced safety and compliance monitoring for your fleet. Get real-time alerts, driver behavior insights, and comprehensive safety reporting to reduce incidents and improve driver performance.',
        image: '/pointing at laptop screen with data on show.webp',
      },
      cameras: {
        title: 'Cameras',
        description:
          'Video telematics with AI-powered incident detection, driver coaching, and evidence capture. Protect your fleet with intelligent dashcam technology.',
        image: '/pointing at laptop screen with data on show.webp',
      },
      'fuel-electric': {
        title: 'Fuel/Electric Vehicles',
        description:
          'Comprehensive EV fleet management and fuel optimization. Monitor charging status, plan efficient routes for electric vehicles, and seamlessly manage mixed fuel and electric fleets.',
        image: '/vans charging up at electrical charging points.webp',
      },
    }),
    []
  );

  // Timeout refs for tooltip management
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global tooltip state
  const [globalTooltip, setGlobalTooltip] = useState<{
    isVisible: boolean;
    itemId: string | null;
    anchorRect: DOMRect | null;
    previousAnchorRect: DOMRect | null;
    content: (typeof tooltipContent)[keyof typeof tooltipContent] | null;
  }>({
    isVisible: false,
    itemId: null,
    anchorRect: null,
    previousAnchorRect: null,
    content: null,
  });

  const handleItemHover = useCallback(
    (itemId: string, anchorRect: DOMRect) => {
      // Clear any pending hide timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }

      if (
        lockedItemIds.includes(itemId) &&
        tooltipContent[itemId as keyof typeof tooltipContent]
      ) {
        setGlobalTooltip((prev) => ({
          isVisible: true,
          itemId,
          anchorRect,
          previousAnchorRect:
            prev.isVisible && prev.itemId !== itemId ? prev.anchorRect : null,
          content: tooltipContent[itemId as keyof typeof tooltipContent],
        }));
      }
    },
    [lockedItemIds, tooltipContent]
  );

  const handleItemLeave = useCallback(() => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Add a delay before hiding to allow moving between items or to tooltip
    tooltipTimeoutRef.current = setTimeout(() => {
      setGlobalTooltip((prev) => ({
        ...prev,
        isVisible: false,
      }));
      tooltipTimeoutRef.current = null;
    }, 300);
  }, []);

  const handleTooltipClose = useCallback(() => {
    setGlobalTooltip({
      isVisible: false,
      itemId: null,
      anchorRect: null,
      previousAnchorRect: null,
      content: null,
    });
  }, []);

  const handleNavigationMouseLeave = useCallback(() => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Hide tooltip when completely leaving the navigation area
    tooltipTimeoutRef.current = setTimeout(() => {
      setGlobalTooltip({
        isVisible: false,
        itemId: null,
        anchorRect: null,
        previousAnchorRect: null,
        content: null,
      });
      tooltipTimeoutRef.current = null;
    }, 500);
  }, []);

  const handleNavigationMouseEnter = useCallback(() => {
    // Cancel any pending hide when re-entering navigation area
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
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
  }, []);

  const handleTopBarItemClick = (itemId: string) => {
    // Handle messages and notifications
    setActiveItemId(''); // Clear main nav active state
    setActiveSettingsItemId(''); // Clear settings active state
    console.log(`[Demo] Top bar item clicked: ${itemId}`);
    onActiveItemChange?.({
      id: itemId,
      label: itemId === 'messages' ? 'Messages' : 'Notifications',
    });
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-[#0e0033] border-b border-gray-600 flex items-center justify-between px-4">
        {/* Left side - Mobile Menu + Brand Switcher */}
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden flex items-center p-2 rounded-md transition-immediate group focus-ring cursor-pointer text-gray-200 hover:hover-only:bg-gray-300/20 hover:hover-only:text-white"
            aria-label="Open navigation menu"
          >
            <ListIcon className="h-5 w-5 flex-shrink-0 transition-immediate text-gray-300 group-hover:hover-only:text-white" />
          </button>

          {/* Brand Switcher - hidden on mobile */}
          <div className="hidden md:block">
            <BrandSwitcher
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              variant="dark"
            />
          </div>
        </div>

        {/* Right side - Settings, Messages, Notifications, User Avatar */}
        <div className="flex items-center">
          {/* Settings Section */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-immediate group focus-ring cursor-pointer text-gray-200 hover:hover-only:bg-gray-300/20 hover:hover-only:text-white data-[state=open]:bg-[#3D88C5] data-[state=open]:text-white outline-none">
                <GearIcon className="mr-2 h-5 w-5 flex-shrink-0 transition-immediate text-gray-300 group-hover:hover-only:text-white group-data-[state=open]:text-white" />
                <span className="hidden sm:inline">Settings</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                className="w-64 p-2"
                collisionPadding={10}
                avoidCollisions={true}
              >
                <div className="space-y-1">
                  {settingsSubmenus.map((category) => {
                    const CategoryIcon = category.icon;

                    return (
                      <DropdownMenuSub key={category.id}>
                        <DropdownMenuSubTrigger className="flex items-center gap-3 cursor-pointer transition-immediate hover:bg-gray-50">
                          <CategoryIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span className="text-sm font-medium">
                            {category.title}
                          </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-56 p-1">
                          {category.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <DropdownMenuItem
                                key={subItem.id}
                                className="flex items-center gap-3 cursor-pointer transition-immediate hover:bg-gray-50"
                                onClick={() => {
                                  setActiveItemId(''); // Clear main nav active state
                                  setActiveSettingsItemId(subItem.id);
                                  onActiveItemChange?.({
                                    id: subItem.id,
                                    label: subItem.label,
                                  });
                                  console.log(
                                    `[Demo] Settings item clicked: "${subItem.label}"`
                                  );
                                }}
                              >
                                <SubIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                <span className="text-sm">{subItem.label}</span>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden sm:block mx-4 h-6 w-px bg-gray-600"></div>

          {/* Icons Section */}
          <div className="flex items-center space-x-2">
            {/* Messages */}
            <button
              onClick={() => handleTopBarItemClick('messages')}
              className="flex items-center p-2 rounded-md transition-immediate group focus-ring cursor-pointer text-gray-200 hover:hover-only:bg-gray-300/20 hover:hover-only:text-white"
            >
              <ChatCircleIcon className="h-5 w-5 flex-shrink-0 transition-immediate text-gray-300 group-hover:hover-only:text-white" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => handleTopBarItemClick('notifications')}
              className="flex items-center p-2 rounded-md transition-immediate group focus-ring cursor-pointer text-gray-200 hover:hover-only:bg-gray-300/20 hover:hover-only:text-white"
            >
              <BellIcon className="h-5 w-5 flex-shrink-0 transition-immediate text-gray-300 group-hover:hover-only:text-white" />
              <span className="ml-1 inline-flex items-center px-1.5 py-1 rounded-full text-xs font-medium bg-red-500 text-white tabular-nums">
                42
              </span>
            </button>
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden sm:block mx-4 h-6 w-px bg-gray-600"></div>

          {/* User Avatar Dropdown */}
          <UserAvatarDropdown
            userName="John Doe"
            userEmail="john.doe@transpoco.com"
            onLogout={() => {
              console.log('[Demo] User logout initiated');
              // Add logout logic here
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-68 bg-white shadow-lg border-r border-gray-200 flex-col relative z-10">
          {/* Navigation */}
          <nav
            ref={navRef}
            className="flex-1 overflow-y-auto py-4 custom-scrollbar"
            role="navigation"
            aria-label="Main navigation"
            onMouseEnter={handleNavigationMouseEnter}
            onMouseLeave={handleNavigationMouseLeave}
          >
            <div>
              {sidebarNavigationData.map((section) => (
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
                      const isActive =
                        activeItemId === item.id && !activeSettingsItemId;
                      const isExpanded = isItemExpanded(item.id);
                      const isLocked = lockedItemIds.includes(item.id);

                      const handleItemClick = (clickedItem: NavigationItem) => {
                        setActiveItemId(clickedItem.id);
                        setActiveSettingsItemId(''); // Clear settings active state
                        onActiveItemChange?.({
                          id: clickedItem.id,
                          label: clickedItem.label,
                        });
                        console.log(
                          `[Demo] Active item set to "${clickedItem.label}"`
                        );
                      };

                      return (
                        <NavigationItemGroupDemo
                          key={item.id}
                          item={item}
                          isActive={isActive}
                          isExpanded={isExpanded}
                          isLocked={isLocked}
                          activeItemId={activeItemId}
                          lockedItemIds={lockedItemIds}
                          onItemClick={handleItemClick}
                          onExpandToggle={toggleExpandedItem}
                          onLearnMore={handleLearnMore}
                          onKeyDown={handleKeyDown}
                          onItemHover={handleItemHover}
                          onItemLeave={handleItemLeave}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="px-4 pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="default" className="w-full">
                  <QuestionIcon />
                  Help
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => window.open('#', '_blank')}
                >
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  Get in Touch
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => window.open('#', '_blank')}
                >
                  <ShieldIcon className="w-4 h-4 text-gray-400" />
                  Terms & Privacy Policy
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => window.open('#', '_blank')}
                >
                  <BookOpenIcon className="w-4 h-4 text-gray-400" />
                  Knowledge Base
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => window.open('#', '_blank')}
                >
                  <FileTextIcon className="w-4 h-4 text-gray-400" />
                  User Manual
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => window.open('#', '_blank')}
                >
                  <NewspaperIcon className="w-4 h-4 text-gray-400" />
                  Whats New?
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              {/* Mobile Sidebar Header */}
              <div className="h-14 bg-[#0e0033] border-b border-gray-600 flex items-center justify-between px-4">
                <BrandSwitcher
                  selectedBrand={selectedBrand}
                  onBrandChange={setSelectedBrand}
                  variant="dark"
                />
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center p-2 rounded-md transition-immediate group focus-ring cursor-pointer text-gray-200 hover:hover-only:bg-gray-300/20 hover:hover-only:text-white"
                  aria-label="Close navigation menu"
                >
                  <XIcon className="h-5 w-5 flex-shrink-0 transition-immediate text-gray-300 group-hover:hover-only:text-white" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav
                className="flex-1 overflow-y-auto py-4 custom-scrollbar"
                role="navigation"
                aria-label="Main navigation"
                onMouseEnter={handleNavigationMouseEnter}
                onMouseLeave={handleNavigationMouseLeave}
              >
                <div>
                  {sidebarNavigationData.map((section) => (
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
                          const isActive =
                            activeItemId === item.id && !activeSettingsItemId;
                          const isExpanded = isItemExpanded(item.id);
                          const isLocked = lockedItemIds.includes(item.id);

                          const handleItemClick = (
                            clickedItem: NavigationItem
                          ) => {
                            setActiveItemId(clickedItem.id);
                            setActiveSettingsItemId('');
                            setIsMobileSidebarOpen(false); // Close mobile sidebar
                            onActiveItemChange?.({
                              id: clickedItem.id,
                              label: clickedItem.label,
                            });
                            console.log(
                              `[Demo] Active item set to "${clickedItem.label}"`
                            );
                          };

                          return (
                            <NavigationItemGroupDemo
                              key={item.id}
                              item={item}
                              isActive={isActive}
                              isExpanded={isExpanded}
                              isLocked={isLocked}
                              activeItemId={activeItemId}
                              lockedItemIds={lockedItemIds}
                              onItemClick={handleItemClick}
                              onExpandToggle={toggleExpandedItem}
                              onLearnMore={handleLearnMore}
                              onKeyDown={handleKeyDown}
                              onItemHover={handleItemHover}
                              onItemLeave={handleItemLeave}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </nav>

              {/* Mobile Help Button */}
              <div className="px-4 pb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="default"
                      className="w-full"
                    >
                      <QuestionIcon />
                      Help
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      Get in Touch
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <ShieldIcon className="w-4 h-4 text-gray-400" />
                      Terms & Privacy Policy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <BookOpenIcon className="w-4 h-4 text-gray-400" />
                      Knowledge Base
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <FileTextIcon className="w-4 h-4 text-gray-400" />
                      User Manual
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <NewspaperIcon className="w-4 h-4 text-gray-400" />
                      Whats New?
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-hidden h-full min-h-0 relative">
          <AnimatePresence>
            {globalTooltip.isVisible &&
              globalTooltip.content &&
              globalTooltip.anchorRect && (
                <NavigationTooltip
                  isVisible={globalTooltip.isVisible}
                  content={globalTooltip.content}
                  anchorRect={globalTooltip.anchorRect}
                  previousAnchorRect={
                    globalTooltip.previousAnchorRect || undefined
                  }
                  onClose={handleTooltipClose}
                  onMouseEnter={handleNavigationMouseEnter}
                  onMouseLeave={handleItemLeave}
                />
              )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
