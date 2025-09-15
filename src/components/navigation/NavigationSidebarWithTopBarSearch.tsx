'use client';

import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
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
} from '@phosphor-icons/react';
import { NavigationItemGroupDemo } from './NavigationItemGroupDemo';
import { NavigationTooltip } from './NavigationTooltip';
import { UserAvatarDropdown } from './UserAvatarDropdown';
import { BrandSwitcher } from './BrandSwitcher';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
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

interface NavigationItemWithSection extends NavigationItem {
  section?: string;
}

interface NavigationSidebarWithTopBarSearchProps {
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

export function NavigationSidebarWithTopBarSearch({
  onActiveItemChange,
}: NavigationSidebarWithTopBarSearchProps) {
  const navRef = useRef<HTMLElement>(null);
  const { toggleExpandedItem, isItemExpanded } = useNavigation();

  // Local active state
  const [activeItemId, setActiveItemId] = useState<string>('live-map');
  const [activeSettingsItemId, setActiveSettingsItemId] = useState<string>('');

  // Brand selection state (for sidebar branding)
  const [selectedBrand, setSelectedBrand] = useState<'transpoco' | 'safely'>(
    'transpoco'
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<NavigationItemWithSection[]>([]);
  const [highlightedSearchIndex, setHighlightedSearchIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Collect all navigation items for search
  const allNavigationItems = useMemo(() => {
    const items: NavigationItemWithSection[] = [];

    // Add settings items
    settingsSubmenus.forEach(category => {
      category.items.forEach(item => {
        items.push({
          ...item,
          section: `Settings > ${category.title}`
        });
      });
    });

    // Add sidebar navigation items
    sidebarNavigationData.forEach(section => {
      section.items.forEach(item => {
        // Add the main item
        items.push({
          ...item,
          section: section.title
        });

        // Add children if they exist
        if (item.children) {
          item.children.forEach(child => {
            items.push({
              ...child,
              section: `${section.title} > ${item.label}`
            });
          });
        }
      });
    });

    return items;
  }, []);

  // Search through navigation items
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    return allNavigationItems
      .filter(item =>
        item.label.toLowerCase().includes(query) ||
        item.section?.toLowerCase().includes(query)
      )
      .slice(0, 8); // Limit results
  }, [searchQuery, allNavigationItems]);

  // Update search results when filtered results change
  useEffect(() => {
    setSearchResults(filteredSearchResults);
    // Auto-focus first result if there are any results
    setHighlightedSearchIndex(filteredSearchResults.length > 0 ? 0 : -1);
  }, [filteredSearchResults]);

  // Demo locked items (premium features) - memoized to prevent re-renders
  const lockedItemIds = useMemo(
    () => ['bikly', 'cost-management', 'fuel-electric'],
    []
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
      'cost-management': {
        title: 'Cost Management',
        description:
          'Complete Total Cost of Ownership (TCO) analysis and financial optimization tools. Track all fleet expenses, identify cost-saving opportunities, and optimize your fleet budget with detailed analytics.',
        image: '/vehicle-maintenance.webp',
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

  // Search handlers
  const handleSearchSelect = useCallback((item: NavigationItem) => {
    setActiveItemId(item.id);
    setActiveSettingsItemId('');
    setSearchQuery('');
    setIsSearchOpen(false);
    setHighlightedSearchIndex(-1);
    onActiveItemChange?.({
      id: item.id,
      label: item.label,
    });
    console.log(`[Demo] Search result selected: "${item.label}"`);
    searchInputRef.current?.blur();
  }, [onActiveItemChange]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isSearchOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedSearchIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedSearchIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedSearchIndex >= 0 && searchResults[highlightedSearchIndex]) {
          handleSearchSelect(searchResults[highlightedSearchIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsSearchOpen(false);
        setSearchQuery('');
        setHighlightedSearchIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  }, [isSearchOpen, searchResults, highlightedSearchIndex, handleSearchSelect]);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setHighlightedSearchIndex(-1);
    searchInputRef.current?.focus();
  }, []);

  // Handle clicks outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchInputRef.current && !searchInputRef.current.closest('.relative')?.contains(target)) {
        setIsSearchOpen(false);
        setHighlightedSearchIndex(-1);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // Handle Cmd+K keyboard shortcut to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        event.stopPropagation();

        // Focus the search input and clear any existing query
        setSearchQuery('');
        setIsSearchOpen(true);
        setHighlightedSearchIndex(-1);
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-[#0e0033] border-b border-gray-600 flex items-center justify-between px-4">
        {/* Left side - Brand Switcher */}
        <div className="flex items-center space-x-3">
          <BrandSwitcher
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
            variant="dark"
          />
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-6 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
                // Don't reset highlighted index here - let the effect handle it
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              className="block w-full pl-10 pr-10 py-2 bg-gray-500/30 text-white placeholder-gray-300 rounded-lg focus:outline-none focus:border-transparent text-sm"
              placeholder="Search pages..."
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={handleSearchClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-300 transition-colors"
                type="button"
              >
                <XIcon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="py-1">
                {searchResults.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`${item.id}-${index}`}
                      onClick={() => handleSearchSelect(item)}
                      onMouseEnter={() => setHighlightedSearchIndex(index)}
                      className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                        index === highlightedSearchIndex ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.label}
                        </div>
                        {item.section && (
                          <div className="text-xs text-gray-500 truncate">
                            {item.section}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Settings, Messages, Notifications, User Avatar */}
        <div className="flex items-center">
          {/* Settings Section */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-immediate group focus-ring cursor-pointer text-gray-200 hover:hover-only:bg-gray-300/20 hover:hover-only:text-white data-[state=open]:bg-[#3D88C5] data-[state=open]:text-white outline-none">
                <GearIcon className="mr-2 h-5 w-5 flex-shrink-0 transition-immediate text-gray-300 group-hover:hover-only:text-white group-data-[state=open]:text-white" />
                <span>Settings</span>
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

          {/* Divider */}
          <div className="mx-4 h-6 w-px bg-gray-600"></div>

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

          {/* Divider */}
          <div className="mx-4 h-6 w-px bg-gray-600"></div>

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
        {/* Sidebar */}
        <div className="w-68 bg-white shadow-lg border-r border-gray-200 flex flex-col relative z-10">
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