'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface TooltipContent {
  title: string;
  description: string;
  image?: string;
  learnMoreUrl?: string;
  id?: string;
}

interface NavigationTooltipProps {
  isVisible: boolean;
  content: TooltipContent;
  anchorRect?: DOMRect;
  previousAnchorRect?: DOMRect;
  onClose?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function NavigationTooltip({
  isVisible,
  content,
  anchorRect,
  previousAnchorRect,
  onClose,
  onMouseEnter,
  onMouseLeave
}: NavigationTooltipProps) {
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
  
  // Helper function to calculate tooltip position for any anchor rect
  const calculateTooltipPosition = (anchor: DOMRect) => {
    let left = anchor.right + spacing;
    let top = anchor.top + (anchor.height / 2) - (tooltipHeight / 2);

    // Ensure tooltip stays within viewport
    if (left + tooltipWidth > window.innerWidth) {
      left = anchor.left - tooltipWidth - spacing;
    }
    
    if (top < spacing) {
      top = spacing;
    } else if (top + tooltipHeight > window.innerHeight - spacing) {
      top = window.innerHeight - tooltipHeight - spacing;
    }
    
    return { left, top };
  };
  
  // Calculate current and previous tooltip positions
  const currentPosition = calculateTooltipPosition(anchorRect);
  const { left, top } = currentPosition;
  
  // Animation variants based on final position and morphing
  const direction: 'left' | 'right' = left > anchorRect.right ? 'left' : 'right';
  
  // Calculate morphing offset based on actual tooltip positions (not just anchor positions)
  const getMorphOffset = () => {
    if (previousAnchorRect) {
      const previousPosition = calculateTooltipPosition(previousAnchorRect);
      return {
        x: previousPosition.left - currentPosition.left,
        y: previousPosition.top - currentPosition.top,
      };
    }
    return { x: direction === 'left' ? -20 : 20, y: -8 };
  };

  const morphOffset = getMorphOffset();
  const isMorphing = !!previousAnchorRect;

  const animationVariants = {
    initial: {
      opacity: isMorphing ? 1 : 0,
      scale: isMorphing ? 1 : 0.85,
      x: morphOffset.x,
      y: morphOffset.y,
    },
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      x: direction === 'left' ? -10 : 10,
      y: -4,
    },
  };

  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
    mass: 0.8,
  };

  const tooltipElement = (
    <motion.div
      ref={tooltipRef}
      className="fixed z-50 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-4"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${tooltipWidth}px`,
      }}
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={springTransition}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image placeholder */}
      <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-700 rounded-md mb-3 flex items-center justify-center">
        {content.image ? (
          <Image 
            src={content.image} 
            alt={content.title}
            width={350}
            height={80}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="text-blue-400 text-sm font-medium">
            {content.title}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">
          {content.title}
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          {content.description}
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="w-full text-xs h-8 cursor-pointer"
          onClick={() => {
            console.log(`[Demo] Learn more about: ${content.title}`);
            if (content.id) {
              // Use replace instead of push to avoid adding to history stack
              router.replace(`/features/${content.id}`);
            }
          }}
        >
          Learn More
        </Button>
      </div>
    </motion.div>
  );

  return createPortal(tooltipElement, document.body);
}