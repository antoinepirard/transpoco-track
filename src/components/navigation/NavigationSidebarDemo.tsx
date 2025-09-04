'use client';

import { useCallback, useRef, useState, useLayoutEffect, useMemo, useEffect } from 'react';
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
  QuestionIcon,
  EnvelopeIcon,
  FileTextIcon,
  NewspaperIcon,
  StorefrontIcon,
  PackageIcon,
} from '@phosphor-icons/react';
import { NavigationItemGroupDemo } from './NavigationItemGroupDemo';
import { NavigationTooltip } from './NavigationTooltip';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
          {
            id: 'scheduled-reports',
            label: 'Scheduled Reports',
            icon: ClockIcon,
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
  
  // Demo locked items (premium features) - memoized to prevent re-renders
  const lockedItemIds = useMemo(() => ['bikly', 'fleet-ai', 'cost-management', 'fuel-electric'], []);
  
  // Tooltip content for locked items - memoized to prevent re-renders
  const tooltipContent = useMemo(() => ({
    'bikly': {
      title: 'Bikly',
      description: 'Advanced safety and compliance monitoring for your fleet. Get real-time alerts, driver behavior insights, and comprehensive safety reporting to reduce incidents and improve driver performance.',
      image: '/pointing at laptop screen with data on show.webp',
    },
    'fleet-ai': {
      title: 'Fleet AI',
      description: 'AI-powered predictive analytics and intelligent fleet optimization. Leverage machine learning to predict maintenance needs, optimize routes, and make data-driven decisions for maximum efficiency.',
    },
    'cost-management': {
      title: 'Cost Management',
      description: 'Complete Total Cost of Ownership (TCO) analysis and financial optimization tools. Track all fleet expenses, identify cost-saving opportunities, and optimize your fleet budget with detailed analytics.',
      image: '/vehicle-maintenance.webp',
    },
    'fuel-electric': {
      title: 'Fuel/Electric Vehicles',
      description: 'Comprehensive EV fleet management and fuel optimization. Monitor charging status, plan efficient routes for electric vehicles, and seamlessly manage mixed fuel and electric fleets.',
      image: '/vans charging up at electrical charging points.webp',
    },
  }), []);

  // Timeout refs for tooltip management
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Global tooltip state
  const [globalTooltip, setGlobalTooltip] = useState<{
    isVisible: boolean;
    itemId: string | null;
    anchorRect: DOMRect | null;
    previousAnchorRect: DOMRect | null;
    content: typeof tooltipContent[keyof typeof tooltipContent] | null;
  }>({
    isVisible: false,
    itemId: null,
    anchorRect: null,
    previousAnchorRect: null,
    content: null,
  });

  const handleItemHover = useCallback((itemId: string, anchorRect: DOMRect) => {
    // Clear any pending hide timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    
    if (lockedItemIds.includes(itemId) && tooltipContent[itemId as keyof typeof tooltipContent]) {
      setGlobalTooltip(prev => ({
        isVisible: true,
        itemId,
        anchorRect,
        previousAnchorRect: prev.isVisible && prev.itemId !== itemId ? prev.anchorRect : null,
        content: tooltipContent[itemId as keyof typeof tooltipContent],
      }));
    }
  }, [lockedItemIds, tooltipContent]);

  const handleItemLeave = useCallback(() => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    // Add a delay before hiding to allow moving between items or to tooltip
    tooltipTimeoutRef.current = setTimeout(() => {
      setGlobalTooltip(prev => ({
        ...prev,
        isVisible: false,
      }));
      tooltipTimeoutRef.current = null;
    }, 300); // Increased delay for better UX
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
    }, 500); // Longer delay when leaving entire nav area
  }, []);

  const handleNavigationMouseEnter = useCallback(() => {
    // Cancel any pending hide when re-entering navigation area
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
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
        onMouseEnter={handleNavigationMouseEnter}
        onMouseLeave={handleNavigationMouseLeave}
      >
        <div>
          {showSettingsNav && (
            <div className="px-4 mb-4">
              <div className="flex items-center space-x-2 text-gray-800">
                <GearIcon className="w-4 h-4" />
                <h2 className="text-base font-semibold">Settings</h2>
              </div>
              <div className="mt-1 h-px bg-gray-100" />
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

      {/* Promotional Banner */}
      {/* <div className="p-4 pb-2 relative z-10">
        <div className="bg-gradient-to-r from-gray-950 to-gray-900 rounded-lg p-4 text-white relative shadow-md">
          {/* Background decoration */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-600/20 rounded-lg" />
          
          {/* Try 30 days tag - positioned absolutely on the edge */}
          {/* <div className="absolute -top-4 -left-2 ml-6 bg-green-400 text-green-900 text-xs font-semibold px-2 py-1 rounded-md z-20">
            Try 30 days
          </div>
          
          {/* Content */}
          {/* <div className="relative z-10">
            <h3 className="text-base font-bold mb-0">Drive with Safely</h3>
            <p className="text-sm text-indigo-100 opacity-90">
              Cut risk & save on insurance
            </p>
          </div>
        </div>
      </div> */}

      {/* Feedback Button */}
      <div className="px-4 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="default"
              className="w-full"
            >
              <QuestionIcon />
              Feedback
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('#', '_blank')}>
              <EnvelopeIcon className="w-4 h-4 text-gray-400" />
              Get in Touch
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('#', '_blank')}>
              <ShieldIcon className="w-4 h-4 text-gray-400" />
              Terms & Privacy Policy
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('#', '_blank')}>
              <BookOpenIcon className="w-4 h-4 text-gray-400" />
              Knowledge Base
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('#', '_blank')}>
              <FileTextIcon className="w-4 h-4 text-gray-400" />
              User Manual
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => window.open('#', '_blank')}>
              <NewspaperIcon className="w-4 h-4 text-gray-400" />
              Whats New?
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Settings Button */}
      <div className="p-4 pt-0">
        <Button
          onClick={toggleSettingsNav}
          variant={showSettingsNav ? "default" : "outline"}
          size="default"
          className="w-full"
        >
          {showSettingsNav ? (
            <>
              <ArrowLeftIcon />
              Back to Navigation
            </>
          ) : (
            <>
              <GearIcon />
              Settings
            </>
          )}
        </Button>
      </div>

      {/* Global tooltip for locked items */}
      <AnimatePresence>
        {globalTooltip.isVisible && globalTooltip.content && globalTooltip.anchorRect && (
          <NavigationTooltip
            isVisible={globalTooltip.isVisible}
            content={globalTooltip.content}
            anchorRect={globalTooltip.anchorRect}
            previousAnchorRect={globalTooltip.previousAnchorRect || undefined}
            onClose={handleTooltipClose}
            onMouseEnter={handleNavigationMouseEnter}
            onMouseLeave={handleItemLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
