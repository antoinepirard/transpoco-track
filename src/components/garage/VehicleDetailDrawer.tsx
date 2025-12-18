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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TruckIcon,
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type {
  GarageVehicle,
  GarageGroup,
  VehicleType,
  FuelType,
} from '@/types/garage';
import { getDriverName } from '@/lib/demo/garageData';
import { cn } from '@/lib/utils';

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'trailer', label: 'Trailer' },
];

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' },
];

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
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TruckIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">
                {vehicle.name}
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
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4 px-6">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              Details
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex-1">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Vehicle Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registration">Registration</Label>
                <Input
                  id="registration"
                  value={formData.registrationNumber || ''}
                  onChange={(e) =>
                    updateField('registrationNumber', e.target.value)
                  }
                  className="uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Vehicle Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => updateField('type', v as VehicleType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fuel">Fuel Type</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(v) => updateField('fuelType', v as FuelType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make || ''}
                  onChange={(e) => updateField('make', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model || ''}
                  onChange={(e) => updateField('model', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) =>
                    updateField(
                      'year',
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin || ''}
                  onChange={(e) => updateField('vin', e.target.value)}
                  placeholder="Vehicle Identification Number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="odometer">Odometer (km)</Label>
                <Input
                  id="odometer"
                  type="number"
                  value={formData.odometer || ''}
                  onChange={(e) =>
                    updateField(
                      'odometer',
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="group">Group</Label>
              <Select
                value={formData.groupId || 'none'}
                onValueChange={(v) =>
                  updateField('groupId', v === 'none' ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {vehicleGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <div className="flex items-center gap-2">
                        {g.color && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: g.color }}
                          />
                        )}
                        {g.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Read-only info */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Assigned Driver</span>
                <span className="font-medium">
                  {getDriverName(vehicle.assignedDriverId)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span>{new Date(vehicle.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span>{new Date(vehicle.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <div className="text-center py-8 text-gray-500">
              <p>Vehicle assignment history will appear here.</p>
              <p className="text-sm mt-1">
                Assigned to: {getDriverName(vehicle.assignedDriverId)}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="text-center py-8 text-gray-500">
              <p>Activity history will appear here.</p>
            </div>
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
    </Sheet>
  );
}
