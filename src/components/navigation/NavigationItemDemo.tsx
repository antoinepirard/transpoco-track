'use client';

import React from 'react';
import {
  CaretUpIcon,
  CaretDownIcon,
  LockIcon,
} from '@phosphor-icons/react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  href?: string;
  children?: NavigationItem[];
}

interface NavigationItemDemoProps {
  item: NavigationItem;
  isActive?: boolean;
  isExpanded?: boolean;
  isLocked?: boolean;
  level?: 'parent' | 'child';
  onItemClick?: (item: NavigationItem) => void;
  onExpandToggle?: (itemId: string) => void;
  onLearnMore?: (item: NavigationItem) => void;
  onKeyDown?: (e: React.KeyboardEvent, itemId: string) => void;
}

export function NavigationItemDemo({
  item,
  isActive = false,
  isExpanded = false,
  isLocked = false,
  level = 'parent',
  onItemClick,
  onExpandToggle,
  onLearnMore,
  onKeyDown,
}: NavigationItemDemoProps) {
  const IconComponent = item.icon;
  const isParent = level === 'parent';
  const isChild = level === 'child';

  const handleClick = () => {
    if (isLocked) {
      onLearnMore?.(item);
      return;
    }

    if (item.children) {
      onExpandToggle?.(item.id);
    } else {
      onItemClick?.(item);
    }
  };

  const getButtonClassName = () => {
    const baseClasses = `w-full flex items-center text-sm font-medium rounded-md transition-immediate group focus-ring cursor-pointer`;
    
    if (isChild) {
      const childPadding = 'py-1.5 pr-2 pl-6';
      if (isLocked) {
        return `${baseClasses} ${childPadding} text-gray-600 hover:hover-only:bg-gray-100 hover:hover-only:text-gray-900`;
      }
      if (isActive) {
        return `${baseClasses} ${childPadding} bg-gray-900 text-white`;
      }
      return `${baseClasses} ${childPadding} text-gray-600 hover:hover-only:bg-gray-100 hover:hover-only:text-gray-900`;
    }

    // Parent item styling
    const parentPadding = 'px-2 py-1.5';
    if (isLocked) {
      return `${baseClasses} ${parentPadding} text-gray-700 hover:hover-only:bg-gray-100 hover:hover-only:text-gray-900`;
    }
    if (isActive) {
      return `${baseClasses} ${parentPadding} bg-gray-900 text-white`;
    }
    return `${baseClasses} ${parentPadding} text-gray-700 hover:hover-only:bg-gray-100 hover:hover-only:text-gray-900`;
  };

  const getIconClassName = () => {
    const baseClasses = `mr-3 h-5 w-5 flex-shrink-0 transition-immediate`;
    
    if (isLocked) {
      return `${baseClasses} text-gray-400 group-hover:hover-only:text-gray-500`;
    }
    if (isActive) {
      return `${baseClasses} text-white`;
    }
    return `${baseClasses} text-gray-400 group-hover:hover-only:text-gray-500`;
  };

  const getBadgeClassName = () => {
    if (isActive) {
      return "ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white tabular-nums";
    }
    if (isLocked) {
      return "ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 tabular-nums";
    }
    return "ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 tabular-nums";
  };

  const getCaretClassName = () => {
    const baseClasses = `ml-2 h-4 w-4 flex-shrink-0 transition-all duration-200`;
    if (isActive) {
      return `${baseClasses} text-white`;
    }
    if (isLocked) {
      return `${baseClasses} text-gray-400`;
    }
    return `${baseClasses} text-gray-400`;
  };

  return (
    <button
      data-nav-item={item.id}
      onClick={handleClick}
      onKeyDown={(e) => onKeyDown?.(e, item.id)}
      className={getButtonClassName()}
      aria-current={isActive ? 'page' : undefined}
      role="menuitem"
      title={isLocked ? `${item.label} (Premium Feature - Click to learn more)` : item.label}
    >
      {isParent && (
        <IconComponent
          className={getIconClassName()}
          aria-hidden="true"
        />
      )}
      <span className={`flex-1 text-left truncate ${isChild ? 'ml-0' : ''}`}>
        {item.label}
      </span>
      
      {/* Lock icon for locked items */}
      {isLocked && (
        <LockIcon 
          className={`ml-2 h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
          aria-hidden="true"
        />
      )}
      
      {/* Badge */}
      {item.badge && (
        <span
          className={getBadgeClassName()}
          aria-label={`${item.badge} notifications`}
        >
          {item.badge}
        </span>
      )}
      
      {/* Expansion caret for items with children */}
      {item.children && !isLocked && (
        <>
          {isExpanded ? (
            <CaretUpIcon
              className={getCaretClassName()}
              aria-hidden="true"
            />
          ) : (
            <CaretDownIcon
              className={getCaretClassName()}
              aria-hidden="true"
            />
          )}
        </>
      )}
    </button>
  );
}