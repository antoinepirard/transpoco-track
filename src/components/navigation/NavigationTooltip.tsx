'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipContent {
  title: string;
  description: string;
  image?: string;
  learnMoreUrl?: string;
}

interface NavigationTooltipProps {
  isVisible: boolean;
  content: TooltipContent;
  anchorRect?: DOMRect;
  onClose?: () => void;
}

export function NavigationTooltip({ 
  isVisible, 
  content, 
  anchorRect,
  onClose 
}: NavigationTooltipProps) {
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!mounted || !isVisible || !anchorRect) {
    return null;
  }

  // Calculate tooltip position
  const tooltipWidth = 350;
  const tooltipHeight = 200;
  const spacing = 12;
  
  // Position to the right of the anchor with some spacing
  let left = anchorRect.right + spacing;
  let top = anchorRect.top + (anchorRect.height / 2) - (tooltipHeight / 2);

  // Ensure tooltip stays within viewport
  if (left + tooltipWidth > window.innerWidth) {
    left = anchorRect.left - tooltipWidth - spacing;
  }
  
  if (top < spacing) {
    top = spacing;
  } else if (top + tooltipHeight > window.innerHeight - spacing) {
    top = window.innerHeight - tooltipHeight - spacing;
  }

  const tooltipElement = (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-4 transition-all duration-200 ease-out"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${tooltipWidth}px`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
      }}
    >
      {/* Image placeholder */}
      <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-md mb-3 flex items-center justify-center">
        {content.image ? (
          <img 
            src={content.image} 
            alt={content.title}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="text-blue-400 text-sm font-medium">
            {content.title}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-white">
          {content.title}
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          {content.description}
        </p>
      </div>
      
      {/* Learn more indicator */}
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="text-xs text-blue-400 font-medium flex items-center">
          <span>Click to learn more</span>
          <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
    </div>
  );

  return createPortal(tooltipElement, document.body);
}