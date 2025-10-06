'use client';

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
  sidebarCollapsed: boolean;
  expandedItems: string[];
  showSettingsNav: boolean;
  showLockedItems: boolean;
  showDiscoverButton: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleExpandedItem: (itemId: string) => void;
  isItemExpanded: (itemId: string) => boolean;
  toggleSettingsNav: () => void;
  setShowSettingsNav: (show: boolean) => void;
  setShowLockedItems: (show: boolean) => void;
  setShowDiscoverButton: (show: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'transpoco-sidebar-collapsed',
  EXPANDED_ITEMS: 'transpoco-nav-expanded-items',
  SETTINGS_NAV: 'transpoco-settings-nav',
  SHOW_LOCKED_ITEMS: 'transpoco-show-locked-items',
  SHOW_DISCOVER_BUTTON: 'transpoco-show-discover-button',
};

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showSettingsNav, setShowSettingsNav] = useState(false);
  const [showLockedItems, setShowLockedItemsState] = useState(true);
  const [showDiscoverButton, setShowDiscoverButtonState] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated on client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return;

    try {
      // Load sidebar collapsed state
      const storedCollapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
      if (storedCollapsed) {
        setSidebarCollapsed(JSON.parse(storedCollapsed));
      }

      // Load expanded items
      const storedExpanded = localStorage.getItem(STORAGE_KEYS.EXPANDED_ITEMS);
      let initialExpanded: string[] = [];
      
      if (storedExpanded) {
        const parsed = JSON.parse(storedExpanded);
        if (Array.isArray(parsed)) {
          initialExpanded = parsed;
        }
      }

      // Load settings navigation state
      const storedSettingsNav = localStorage.getItem(STORAGE_KEYS.SETTINGS_NAV);
      if (storedSettingsNav) {
        setShowSettingsNav(JSON.parse(storedSettingsNav));
      }

      // Load show locked items state
      const storedShowLockedItems = localStorage.getItem(STORAGE_KEYS.SHOW_LOCKED_ITEMS);
      if (storedShowLockedItems !== null) {
        setShowLockedItemsState(JSON.parse(storedShowLockedItems));
      }

      // Load show discover button state
      const storedShowDiscoverButton = localStorage.getItem(STORAGE_KEYS.SHOW_DISCOVER_BUTTON);
      if (storedShowDiscoverButton !== null) {
        setShowDiscoverButtonState(JSON.parse(storedShowDiscoverButton));
      }

      // Auto-expand Reports section if on a report page
      if (pathname.startsWith('/reports') && !initialExpanded.includes('reports')) {
        initialExpanded.push('reports');
      }

      setExpandedItems(initialExpanded);
      setIsInitialized(true);
    } catch (error) {
      console.warn('Failed to load navigation state from localStorage:', error);
      setIsInitialized(true);
    }
  }, [pathname, isHydrated]);

  // Save sidebar collapsed state to localStorage
  const saveSidebarState = useCallback((collapsed: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(collapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, []);

  // Save expanded items to localStorage
  const saveExpandedItems = useCallback((items: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.EXPANDED_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save navigation state to localStorage:', error);
    }
  }, []);

  // Handle pathname changes to auto-expand Reports section
  useEffect(() => {
    if (!isInitialized) return;

    if (pathname.startsWith('/reports')) {
      setExpandedItems(current => {
        if (!current.includes('reports')) {
          const newItems = [...current, 'reports'];
          saveExpandedItems(newItems);
          return newItems;
        }
        return current;
      });
    }
  }, [pathname, isInitialized, saveExpandedItems]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(current => {
      const newValue = !current;
      saveSidebarState(newValue);
      return newValue;
    });
  }, [saveSidebarState]);

  const handleSetSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    saveSidebarState(collapsed);
  }, [saveSidebarState]);

  const toggleExpandedItem = useCallback((itemId: string) => {
    setExpandedItems(current => {
      const newItems = current.includes(itemId)
        ? current.filter(id => id !== itemId)
        : [...current, itemId];
      
      saveExpandedItems(newItems);
      return newItems;
    });
  }, [saveExpandedItems]);

  const isItemExpanded = useCallback((itemId: string) => {
    // During SSR, return false to ensure consistent initial state
    if (!isHydrated) return false;
    return expandedItems.includes(itemId);
  }, [expandedItems, isHydrated]);

  // Save settings navigation state to localStorage
  const saveSettingsNavState = useCallback((show: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS_NAV, JSON.stringify(show));
    } catch (error) {
      console.warn('Failed to save settings nav state to localStorage:', error);
    }
  }, []);

  const toggleSettingsNav = useCallback(() => {
    setShowSettingsNav(current => {
      const newValue = !current;
      saveSettingsNavState(newValue);
      return newValue;
    });
  }, [saveSettingsNavState]);

  const handleSetShowSettingsNav = useCallback((show: boolean) => {
    setShowSettingsNav(show);
    saveSettingsNavState(show);
  }, [saveSettingsNavState]);

  // Save show locked items state to localStorage
  const saveShowLockedItemsState = useCallback((show: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_LOCKED_ITEMS, JSON.stringify(show));
    } catch (error) {
      console.warn('Failed to save show locked items state to localStorage:', error);
    }
  }, []);

  const handleSetShowLockedItems = useCallback((show: boolean) => {
    setShowLockedItemsState(show);
    saveShowLockedItemsState(show);
  }, [saveShowLockedItemsState]);

  // Save show discover button state to localStorage
  const saveShowDiscoverButtonState = useCallback((show: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SHOW_DISCOVER_BUTTON, JSON.stringify(show));
    } catch (error) {
      console.warn('Failed to save show discover button state to localStorage:', error);
    }
  }, []);

  const handleSetShowDiscoverButton = useCallback((show: boolean) => {
    setShowDiscoverButtonState(show);
    saveShowDiscoverButtonState(show);
  }, [saveShowDiscoverButtonState]);

  const value: NavigationContextType = {
    sidebarCollapsed,
    expandedItems,
    showSettingsNav,
    showLockedItems,
    showDiscoverButton,
    setSidebarCollapsed: handleSetSidebarCollapsed,
    toggleSidebar,
    toggleExpandedItem,
    isItemExpanded,
    toggleSettingsNav,
    setShowSettingsNav: handleSetShowSettingsNav,
    setShowLockedItems: handleSetShowLockedItems,
    setShowDiscoverButton: handleSetShowDiscoverButton,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}