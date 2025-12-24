'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TruckIcon,
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
  GearIcon,
} from '@phosphor-icons/react';
import type { GarageVehicle, GarageGroup } from '@/types/garage';
import { cn } from '@/lib/utils';
import { useVehicleFieldConfig } from '@/hooks/useVehicleFieldConfig';
import { FieldCustomizationDialog } from './FieldCustomizationDialog';
import { VehicleFieldRenderer } from './VehicleFieldRenderer';

interface VehicleDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: GarageVehicle | null;
  vehicleGroups: GarageGroup[];
  onSave: (vehicle: GarageVehicle) => void;
  onArchive: (vehicle: GarageVehicle) => void;
  onRestore: (vehicle: GarageVehicle) => void;
  onDelete: (vehicle: GarageVehicle) => void;
}

export function VehicleDetailDrawer({
  open,
  onOpenChange,
  vehicle,
  vehicleGroups,
  onSave,
  onArchive,
  onRestore,
  onDelete,
}: VehicleDetailDrawerProps) {
  const [formData, setFormData] = useState<Partial<GarageVehicle>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);

  const {
    config,
    isLoaded,
    toggleFieldVisibility,
    reorderFields,
    resetToDefaults,
    getVisibleFieldsForTab,
    getFieldsForTab,
  } = useVehicleFieldConfig();

  // Helper to check if a field is visible
  const isFieldVisible = (fieldId: string) => {
    const field = config.fields.find((f) => f.id === fieldId);
    return field?.visible ?? true;
  };

  useEffect(() => {
    if (vehicle && open) {
      setFormData({ ...vehicle });
      setHasChanges(false);
    }
  }, [vehicle, open]);

  const updateField = <K extends keyof GarageVehicle>(
    field: K,
    value: GarageVehicle[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (vehicle && formData) {
      onSave({
        ...vehicle,
        ...formData,
        updatedAt: new Date().toISOString(),
      } as GarageVehicle);
      setHasChanges(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Discard them?')) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  if (!vehicle) return null;

  const isArchived = vehicle.status === 'archived';

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">
                {vehicle.description}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                {vehicle.registrationNumber}
                <Badge
                  variant={isArchived ? 'secondary' : 'default'}
                  className={cn(
                    'text-xs',
                    !isArchived && 'bg-green-100 text-green-700'
                  )}
                >
                  {isArchived ? 'Archived' : 'Active'}
                </Badge>
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCustomizeDialogOpen(true)}
              title="Customize fields"
            >
              <GearIcon className="w-5 h-5" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="basic" className="mt-4 px-6">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              Basic
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex-1">
              Technical
            </TabsTrigger>
            <TabsTrigger value="display" className="flex-1">
              Display
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex-1">
              Financial
            </TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="mt-4 space-y-4">
            {getVisibleFieldsForTab('basic').map((field) => (
              <VehicleFieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id as keyof GarageVehicle]}
                onChange={(id, value) =>
                  updateField(id as keyof GarageVehicle, value as never)
                }
                vehicleGroups={vehicleGroups}
                vehicle={vehicle}
              />
            ))}
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-4 space-y-4">
            {getVisibleFieldsForTab('technical').map((field) => (
              <VehicleFieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id as keyof GarageVehicle]}
                onChange={(id, value) =>
                  updateField(id as keyof GarageVehicle, value as never)
                }
                vehicleGroups={vehicleGroups}
                vehicle={vehicle}
              />
            ))}
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="mt-4 space-y-4">
            {getVisibleFieldsForTab('display').map((field) => (
              <VehicleFieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id as keyof GarageVehicle]}
                onChange={(id, value) =>
                  updateField(id as keyof GarageVehicle, value as never)
                }
                vehicleGroups={vehicleGroups}
                vehicle={vehicle}
              />
            ))}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="mt-4 space-y-4">
            {getVisibleFieldsForTab('financial').map((field) => (
              <VehicleFieldRenderer
                key={field.id}
                field={field}
                value={formData[field.id as keyof GarageVehicle]}
                onChange={(id, value) =>
                  updateField(id as keyof GarageVehicle, value as never)
                }
                vehicleGroups={vehicleGroups}
                vehicle={vehicle}
              />
            ))}
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 p-6 pt-4 border-t flex-row gap-2">
          <div className="flex gap-2">
            {isArchived ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(vehicle)}
              >
                <ArrowCounterClockwiseIcon className="w-4 h-4 mr-1" />
                Restore
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onArchive(vehicle)}
              >
                <ArchiveIcon className="w-4 h-4 mr-1" />
                Archive
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if (confirm('Are you sure you want to delete this vehicle?')) {
                  onDelete(vehicle);
                }
              }}
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
          <div className="flex-1" />
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-[#3D88C5] hover:bg-[#3478a5]"
          >
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>

      <FieldCustomizationDialog
        open={customizeDialogOpen}
        onOpenChange={setCustomizeDialogOpen}
        getFieldsForTab={getFieldsForTab}
        onToggleVisibility={toggleFieldVisibility}
        onReorder={reorderFields}
        onReset={resetToDefaults}
      />
    </Sheet>
  );
}
