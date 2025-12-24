'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DotsSixVertical, Lock } from '@phosphor-icons/react';
import type {
  VehicleFieldConfig,
  VehicleFieldTab,
} from '@/lib/vehicleFieldConfig';

interface FieldCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getFieldsForTab: (tab: VehicleFieldTab) => VehicleFieldConfig[];
  onToggleVisibility: (fieldId: string) => void;
  onReorder: (tab: VehicleFieldTab, fromIndex: number, toIndex: number) => void;
  onReset: () => void;
}

const TABS: { id: VehicleFieldTab; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'technical', label: 'Technical' },
  { id: 'display', label: 'Display' },
  { id: 'financial', label: 'Financial' },
];

export function FieldCustomizationDialog({
  open,
  onOpenChange,
  getFieldsForTab,
  onToggleVisibility,
  onReorder,
  onReset,
}: FieldCustomizationDialogProps) {
  const [activeTab, setActiveTab] = useState<VehicleFieldTab>('basic');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(activeTab, draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Vehicle Fields</DialogTitle>
          <DialogDescription>
            Show/hide and reorder fields displayed in the vehicle detail drawer.
            Drag fields to reorder. Required fields cannot be hidden.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as VehicleFieldTab)}
          className="mt-4"
        >
          <TabsList className="w-full">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getFieldsForTab(tab.id).map((field, index) => (
                  <div
                    key={field.id}
                    draggable={!field.required}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-2 rounded-md border ${
                      draggedIndex === index
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    } ${!field.required ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <div className="text-gray-400">
                      {field.required ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <DotsSixVertical className="w-4 h-4" />
                      )}
                    </div>
                    <Checkbox
                      id={`field-${field.id}`}
                      checked={field.visible}
                      disabled={field.required}
                      onCheckedChange={() => onToggleVisibility(field.id)}
                    />
                    <Label
                      htmlFor={`field-${field.id}`}
                      className={`flex-1 cursor-pointer ${field.required ? 'font-medium' : ''}`}
                    >
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-xs text-gray-500">
                          (required)
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onReset}>
            Reset to Defaults
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#3D88C5] hover:bg-[#3478a5]"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
