'use client';

import React from 'react';
import { NavigationItemDemo } from './NavigationItemDemo';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
  children?: NavigationItem[];
}

interface TooltipContent {
  title: string;
  description: string;
  image?: string;
  learnMoreUrl?: string;
}

interface NavigationItemGroupDemoProps {
  item: NavigationItem;
  isActive?: boolean;
  isExpanded?: boolean;
  isLocked?: boolean;
  activeItemId?: string;
  lockedItemIds?: string[];
  tooltipContentMap?: Record<string, TooltipContent>;
  onItemClick?: (item: NavigationItem) => void;
  onExpandToggle?: (itemId: string) => void;
  onLearnMore?: (item: NavigationItem) => void;
  onKeyDown?: (e: React.KeyboardEvent, itemId: string) => void;
}

export function NavigationItemGroupDemo({
  item,
  isActive = false,
  isExpanded = false,
  isLocked = false,
  activeItemId,
  lockedItemIds = [],
  tooltipContentMap,
  onItemClick,
  onExpandToggle,
  onLearnMore,
  onKeyDown,
}: NavigationItemGroupDemoProps) {
  return (
    <div>
      {/* Parent Item */}
      <NavigationItemDemo
        item={item}
        isActive={isActive}
        isExpanded={isExpanded}
        isLocked={isLocked}
        level="parent"
        tooltipContent={tooltipContentMap?.[item.id]}
        onItemClick={onItemClick}
        onExpandToggle={onExpandToggle}
        onLearnMore={onLearnMore}
        onKeyDown={onKeyDown}
      />
      
      {/* Children Items */}
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
              const isChildLocked = lockedItemIds.includes(childItem.id);
              
              return (
                <div key={childItem.id} className="relative">
                  <NavigationItemDemo
                    item={childItem}
                    isActive={isChildActive}
                    isLocked={isChildLocked}
                    level="child"
                    tooltipContent={tooltipContentMap?.[childItem.id]}
                    onItemClick={onItemClick}
                    onLearnMore={onLearnMore}
                    onKeyDown={onKeyDown}
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