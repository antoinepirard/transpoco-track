'use client';

import { useState } from 'react';
import { ContextMenu } from '@base-ui-components/react';
import { Eye } from '@phosphor-icons/react';

interface MapContextMenuProps {
  children: React.ReactNode;
  onStreetView: () => void;
  onOpenChange: (open: boolean) => void;
}

export function MapContextMenu({ children, onStreetView, onOpenChange }: MapContextMenuProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange(newOpen);
  };

  const handleStreetView = () => {
    onStreetView();
    setOpen(false);
    onOpenChange(false);
  };

  return (
    <ContextMenu.Root open={open} onOpenChange={handleOpenChange}>
      <ContextMenu.Trigger className="w-full h-full">
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Positioner>
          <ContextMenu.Popup className="bg-white shadow-lg rounded-md border border-gray-200 py-1 min-w-[160px] z-50">
            <ContextMenu.Item
              onClick={handleStreetView}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer outline-none focus:bg-gray-100"
            >
              <Eye size={16} />
              Open Street View
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}