'use client';

import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Pencil } from 'lucide-react';

interface WidgetHoverChromeProps {
  children: ReactNode;
  popover: ReactNode;
  className?: string;
}

export function WidgetHoverChrome({ children, popover, className }: WidgetHoverChromeProps) {
  return (
    <div className={`relative group ${className ?? ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-opacity"
            aria-label="Edit widget settings"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          {popover}
        </PopoverContent>
      </Popover>
      {children}
    </div>
  );
}

export default WidgetHoverChrome;


