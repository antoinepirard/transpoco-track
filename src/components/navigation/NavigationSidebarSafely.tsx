'use client';

import { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  SquaresFourIcon,
  ListChecksIcon,
  UsersIcon,
  TruckIcon,
  ListIcon,
  FileTextIcon,
  CloudArrowDownIcon,
  WarningIcon,
  ShieldIcon,
  QuestionIcon,
  BookOpenIcon,
  EnvelopeIcon,
  NewspaperIcon,
  PackageIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ClockClockwiseIcon,
  PlusIcon,
  ReceiptIcon,
  CreditCardIcon,
  KeyIcon,
  DownloadIcon,
  UserPlusIcon,
  ClockIcon,
  PathIcon,
  ChatCircleIcon,
} from '@phosphor-icons/react';
import { NavigationItemGroupDemo } from './NavigationItemGroupDemo';
import { NavigationTooltip } from './NavigationTooltip';
import { UserAvatarDropdown } from './UserAvatarDropdown';
import { BrandSwitcher } from './BrandSwitcher';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProductDiscoveryDialog } from './ProductDiscoveryDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

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

interface NavigationSidebarSafelyProps {
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

// Simplified Safely navigation - flat structure based on mockup
const sidebarNavigationData: NavigationSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: SquaresFourIcon,
        href: '/dashboard',
      },
      {
        id: 'workflows',
        label: 'Workflows',
        icon: PathIcon,
        href: '/workflows',
      },
      {
        id: 'checklist',
        label: 'Checklist',
        icon: ListChecksIcon,
        href: '/checklist',
      },
      {
        id: 'users',
        label: 'Users',
        icon: UsersIcon,
        href: '/users',
      },
      {
        id: 'vehicles',
        label: 'Vehicles',
        icon: TruckIcon,
        href: '/vehicles',
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: ListIcon,
        href: '/tasks',
      },
      {
        id: 'document-center',
        label: 'Document Center',
        icon: FileTextIcon,
        href: '/documents',
      },
      {
        id: 'messaging',
        label: 'Messaging',
        icon: ChatCircleIcon,
        href: '/messaging',
      },
      {
        id: 'import',
        label: 'Import',
        icon: CloudArrowDownIcon,
        href: '/import',
      },
      {
        id: 'incidents',
        label: 'Incidents',
        icon: WarningIcon,
        href: '/incidents',
      },
    ],
  },
];

export function NavigationSidebarSafely({
  onActiveItemChange,
}: NavigationSidebarSafelyProps) {
  const navRef = useRef<HTMLElement>(null);
  const {
    toggleExpandedItem,
    isItemExpanded,
    showLockedItems,
    showDiscoverButton,
  } = useNavigation();

  // Local active state
  const [activeItemId, setActiveItemId] = useState<string>('dashboard');
  const [activeSettingsItemId, setActiveSettingsItemId] = useState<string>('');

  // Ensure SSR and first client render match to avoid hydration mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Brand selection state (defaulting to 'safely')
  const [selectedBrand, setSelectedBrand] = useState<'transpoco' | 'safely'>(
    'safely'
  );

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Command menu state
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Product discovery dialog state
  const [isProductDiscoveryOpen, setIsProductDiscoveryOpen] = useState(false);

  // Demo locked items (premium features) - memoized to prevent re-renders
  const lockedItemIds = useMemo(
    () => (mounted && showLockedItems ? [] : []),
    [mounted, showLockedItems]
  );

  // Tooltip content for locked items - memoized to prevent re-renders
  const tooltipContent = useMemo(() => ({}), []);

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
    setActiveItemId(itemId); // Set active to messages or notifications
    setActiveSettingsItemId(''); // Clear settings active state
    console.log(`[Demo] Top bar item clicked: ${itemId}`);
    onActiveItemChange?.({
      id: itemId,
      label: itemId === 'messages' ? 'Messages' : 'Notifications',
    });
  };

  // Command menu handlers
  const handleCommandSelect = useCallback(
    (item: NavigationItem) => {
      setActiveItemId(item.id);
      setActiveSettingsItemId('');
      setIsCommandOpen(false);
      onActiveItemChange?.({
        id: item.id,
        label: item.label,
      });
      console.log(`[Demo] Command item selected: "${item.label}"`);
    },
    [onActiveItemChange]
  );

  // Handle Cmd+K keyboard shortcut to open command menu
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        event.stopPropagation();
        setIsCommandOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top Bar - Dark Green for Safely */}
      <div className="h-14 bg-[#1a3a2a] border-b border-gray-600 flex items-center justify-between px-4">
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
              onAddNewProduct={() => setIsProductDiscoveryOpen(true)}
            />
          </div>
        </div>

        {/* Right side - Safely AI button and User Avatar */}
        <div className="flex items-center gap-3">
          {/* Safely AI Button */}
          <button
            onClick={() => console.log('[Demo] Safely AI clicked')}
            className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-gray-300/20"
          >
            <Image
              src="/chat-bot.svg"
              alt="Safely AI"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>

          {/* User Name and Avatar */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white hidden sm:inline">
              Jamie Morris
            </span>
            <UserAvatarDropdown
              userName="Jamie Morris"
              userEmail="jamie.morris@safely.com"
              onLogout={() => {
                console.log('[Demo] User logout initiated');
                // Add logout logic here
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-68 bg-white shadow-lg border-r border-gray-200 flex-col relative z-10">
          {/* Command Menu Trigger - Now in sidebar */}
          <div className="p-4">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full flex items-center px-3 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors text-sm text-left"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-3 flex-shrink-0" />
              Search pages...
              <div className="ml-auto flex items-center space-x-1 text-xs text-gray-400">
                <span>⌘</span>
                <span>K</span>
              </div>
            </button>
          </div>

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
                          activeColor="#6DB33F"
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

          <div className="px-4 pb-2 space-y-2">
            {mounted && showDiscoverButton && (
              <Button
                onClick={() => setIsProductDiscoveryOpen(true)}
                size="default"
                className="w-full bg-[#95B148] hover:bg-[#7a9138] text-white"
              >
                <PackageIcon />
                Discover new products
              </Button>
            )}

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
              <div className="h-14 bg-[#1a3a2a] border-b border-gray-600 flex items-center justify-between px-4">
                <BrandSwitcher
                  selectedBrand={selectedBrand}
                  onBrandChange={setSelectedBrand}
                  variant="dark"
                  onAddNewProduct={() => setIsProductDiscoveryOpen(true)}
                />
                <div className="flex items-center gap-2">
                  {/* Safely AI Button - Mobile */}
                  <button
                    onClick={() => console.log('[Demo] Safely AI clicked')}
                    className="flex items-center p-2 rounded-md transition-colors hover:bg-gray-300/20"
                  >
                    <Image
                      src="/chat-bot.svg"
                      alt="Safely AI"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="flex items-center p-2 rounded-md transition-immediate group focus-ring cursor-pointer text-gray-200 hover:hover-only:bg-gray-300/20 hover:hover-only:text-white"
                    aria-label="Close navigation menu"
                  >
                    <XIcon className="h-5 w-5 flex-shrink-0 transition-immediate text-gray-300 group-hover:hover-only:text-white" />
                  </button>
                </div>
              </div>

              {/* Mobile Command Menu Trigger */}
              <div className="p-4">
                <button
                  onClick={() => setIsCommandOpen(true)}
                  className="w-full flex items-center px-3 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors text-sm text-left"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                  Search pages...
                  <div className="ml-auto flex items-center space-x-1 text-xs text-gray-400">
                    <span>⌘</span>
                    <span>K</span>
                  </div>
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
                              activeColor="#6DB33F"
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

              {/* Mobile Product Discovery and Help Buttons */}
              <div className="px-4 pb-2 space-y-2">
                {showDiscoverButton && (
                  <Button
                    onClick={() => setIsProductDiscoveryOpen(true)}
                    size="default"
                    className="w-full bg-[#95B148] hover:bg-[#7a9138] text-white"
                  >
                    <PackageIcon />
                    Discover new products
                  </Button>
                )}

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

        <main className="flex-1 overflow-hidden h-full min-h-0 relative flex flex-col">
          <div className="flex-1 overflow-hidden h-full min-h-0 relative">
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
          </div>
        </main>
      </div>

      {/* Command Menu Dialog */}
      <CommandDialog
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        className="z-[55]"
      >
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Settings Group */}
          {settingsSubmenus.map((category) => (
            <CommandGroup
              key={category.id}
              heading={`Settings > ${category.title}`}
            >
              {category.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${category.title}`}
                    onSelect={() => {
                      setActiveItemId('');
                      setActiveSettingsItemId(item.id);
                      setIsCommandOpen(false);
                      onActiveItemChange?.({
                        id: item.id,
                        label: item.label,
                      });
                      console.log(
                        `[Demo] Settings item selected: "${item.label}"`
                      );
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}

          {/* Navigation Groups */}
          {sidebarNavigationData.map((section) => (
            <CommandGroup key={section.id} heading={section.title}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${section.title}`}
                    onSelect={() => handleCommandSelect(item)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>

      {/* Product Discovery Dialog */}
      <ProductDiscoveryDialog
        open={isProductDiscoveryOpen}
        onOpenChange={setIsProductDiscoveryOpen}
      />
    </div>
  );
}
