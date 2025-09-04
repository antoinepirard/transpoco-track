'use client';

import React, { useState, useRef } from 'react';
import {
  CaretUpIcon,
  CaretDownIcon,
  LockIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react';
import { NavigationTooltip } from './NavigationTooltip';

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

interface NavigationItemDemoProps {
  item: NavigationItem;
  isActive?: boolean;
  isExpanded?: boolean;
  isLocked?: boolean;
  level?: 'parent' | 'child';
  tooltipContent?: TooltipContent;
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
  tooltipContent,
  onItemClick,
  onExpandToggle,
  onLearnMore,
  onKeyDown,
}: NavigationItemDemoProps) {
  const IconComponent = item.icon;
  const isParent = level === 'parent';
  const isChild = level === 'child';
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | undefined>();

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

  const handleMouseEnter = () => {
    if (isLocked && tooltipContent && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setTooltipAnchor(rect);
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (isLocked) {
      setShowTooltip(false);
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
    <>
      <button
        ref={buttonRef}
        data-nav-item={item.id}
        onClick={handleClick}
        onKeyDown={(e) => onKeyDown?.(e, item.id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
      
      {/* Lock icon for locked items - transforms to arrow on hover */}
      {isLocked && (
        <div className="ml-2 h-4 w-4 flex-shrink-0 relative">
          <LockIcon 
            className={`absolute inset-0 h-4 w-4 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-400'} group-hover:opacity-0 group-hover:scale-90`}
            aria-hidden="true"
          />
          <ArrowSquareOutIcon 
            className={`absolute inset-0 h-4 w-4 transition-all duration-200 ${isActive ? 'text-white' : 'text-gray-500'} opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100`}
            aria-hidden="true"
          />
        </div>
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
      
      {/* Tooltip for locked items */}
      {isLocked && tooltipContent && (
        <NavigationTooltip
          isVisible={showTooltip}
          content={tooltipContent}
          anchorRect={tooltipAnchor}
          onClose={() => setShowTooltip(false)}
        />
      )}
    </>
  );
}