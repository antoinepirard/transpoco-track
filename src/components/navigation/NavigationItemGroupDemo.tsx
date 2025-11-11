'use client';

import React, { useState, useEffect } from 'react';
import { NavigationItemDemo } from './NavigationItemDemo';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
  children?: NavigationItem[];
}

interface NavigationItemGroupDemoProps {
  item: NavigationItem;
  isActive?: boolean;
  isExpanded?: boolean;
  isLocked?: boolean;
  activeItemId?: string;
  lockedItemIds?: string[];
  activeColor?: string;
  onItemClick?: (item: NavigationItem) => void;
  onExpandToggle?: (itemId: string) => void;
  onLearnMore?: (item: NavigationItem) => void;
  onKeyDown?: (e: React.KeyboardEvent, itemId: string) => void;
  onItemHover?: (itemId: string, anchorRect: DOMRect) => void;
  onItemLeave?: () => void;
}

export function NavigationItemGroupDemo({
  item,
  isActive = false,
  isExpanded = false,
  isLocked = false,
  activeItemId,
  lockedItemIds = [],
  activeColor,
  onItemClick,
  onExpandToggle,
  onLearnMore,
  onKeyDown,
  onItemHover,
  onItemLeave,
}: NavigationItemGroupDemoProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial hydration, always render as collapsed
  const safeIsExpanded = isClient ? isExpanded : false;
  return (
    <div>
      {/* Parent Item */}
      <NavigationItemDemo
        item={item}
        isActive={isActive}
        isExpanded={safeIsExpanded}
        isLocked={isLocked}
        level="parent"
        activeColor={activeColor}
        onItemClick={onItemClick}
        onExpandToggle={onExpandToggle}
        onLearnMore={onLearnMore}
        onKeyDown={onKeyDown}
        onItemHover={onItemHover}
        onItemLeave={onItemLeave}
      />
      
      {/* Children Items */}
      {item.children && (
        <div 
          className={`ml-4 overflow-hidden transition-all duration-200 ease-out ${
            safeIsExpanded ? 'max-h-96 mt-1' : 'max-h-0'
          }`}
        >
          <div className="space-y-0.5 relative">
            {/* Vertical line indicator */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
            
            {item.children.map((childItem) => {
              const isChildActive = activeItemId === childItem.id;
              const isChildLocked = lockedItemIds.includes(childItem.id);
              
              return (
                <div key={childItem.id} className="relative">
                  <NavigationItemDemo
                    item={childItem}
                    isActive={isChildActive}
                    isLocked={isChildLocked}
                    level="child"
                    activeColor={activeColor}
                    onItemClick={onItemClick}
                    onLearnMore={onLearnMore}
                    onKeyDown={onKeyDown}
                    onItemHover={onItemHover}
                    onItemLeave={onItemLeave}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}