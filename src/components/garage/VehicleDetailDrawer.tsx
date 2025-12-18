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
import { Checkbox } from '@/components/ui/checkbox';
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
  FuelType,
  LabelColor,
  VehicleIcon,
} from '@/types/garage';
import { getDriverName } from '@/lib/demo/garageData';
import { cn } from '@/lib/utils';

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' },
];

const LABEL_COLORS: { value: LabelColor; label: string }[] = [
  { value: 'white_label', label: 'White' },
  { value: 'blue_label', label: 'Blue' },
  { value: 'green_label', label: 'Green' },
  { value: 'red_label', label: 'Red' },
  { value: 'yellow_label', label: 'Yellow' },
  { value: 'orange_label', label: 'Orange' },
];

const VEHICLE_ICONS: { value: VehicleIcon; label: string }[] = [
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'stairs', label: 'Stairs' },
  { value: 'electric_tractor', label: 'Electric Tractor' },
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
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="fleetNumber">Fleet Number</Label>
                <Input
                  id="fleetNumber"
                  value={formData.fleetNumber || ''}
                  onChange={(e) => updateField('fleetNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secondaryDescription">
                Secondary Description
              </Label>
              <Input
                id="secondaryDescription"
                value={formData.secondaryDescription || ''}
                onChange={(e) =>
                  updateField('secondaryDescription', e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fuel">Fuel Type</Label>
                <Select
                  value={formData.fuelType || 'none'}
                  onValueChange={(v) =>
                    updateField(
                      'fuelType',
                      v === 'none' ? undefined : (v as FuelType)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {FUEL_TYPES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="division">Division / Station</Label>
                <Input
                  id="division"
                  value={formData.division || ''}
                  onChange={(e) => updateField('division', e.target.value)}
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

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage || ''}
                  onChange={(e) =>
                    updateField(
                      'mileage',
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Input
                  id="passengers"
                  type="number"
                  value={formData.passengers || ''}
                  onChange={(e) =>
                    updateField(
                      'passengers',
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin || ''}
                onChange={(e) => updateField('vin', e.target.value)}
                placeholder="Vehicle Identification Number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentEngineHours">Current Engine Hours</Label>
                <Input
                  id="currentEngineHours"
                  type="number"
                  step="0.1"
                  value={formData.currentEngineHours ?? ''}
                  onChange={(e) =>
                    updateField(
                      'currentEngineHours',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="initialEngineHours">Initial Engine Hours</Label>
                <Input
                  id="initialEngineHours"
                  type="number"
                  step="0.1"
                  value={formData.initialEngineHours ?? ''}
                  onChange={(e) =>
                    updateField(
                      'initialEngineHours',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="engineType">Engine Type</Label>
                <Input
                  id="engineType"
                  value={formData.engineType || ''}
                  onChange={(e) => updateField('engineType', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cameraSerialNumber">Camera Serial Number</Label>
                <Input
                  id="cameraSerialNumber"
                  value={formData.cameraSerialNumber || ''}
                  onChange={(e) =>
                    updateField('cameraSerialNumber', e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canbusEnabled"
                  checked={formData.canbusEnabled ?? false}
                  onCheckedChange={(checked) =>
                    updateField('canbusEnabled', checked === true)
                  }
                />
                <Label
                  htmlFor="canbusEnabled"
                  className="text-sm font-normal cursor-pointer"
                >
                  CANbus Enabled
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whitelistEnabled"
                  checked={formData.whitelistEnabled ?? false}
                  onCheckedChange={(checked) =>
                    updateField('whitelistEnabled', checked === true)
                  }
                />
                <Label
                  htmlFor="whitelistEnabled"
                  className="text-sm font-normal cursor-pointer"
                >
                  Whitelist Enabled
                </Label>
              </div>
            </div>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="mt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label || ''}
                onChange={(e) => updateField('label', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="labelColor">Label Colour</Label>
                <Select
                  value={formData.labelColor || 'none'}
                  onValueChange={(v) =>
                    updateField(
                      'labelColor',
                      v === 'none' ? undefined : (v as LabelColor)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {LABEL_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon || 'none'}
                  onValueChange={(v) =>
                    updateField(
                      'icon',
                      v === 'none' ? undefined : (v as VehicleIcon)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {VEHICLE_ICONS.map((i) => (
                      <SelectItem key={i.value} value={i.value}>
                        {i.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

          {/* Financial Tab */}
          <TabsContent value="financial" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vehicleValue">Vehicle Value</Label>
                <Input
                  id="vehicleValue"
                  type="number"
                  value={formData.vehicleValue || ''}
                  onChange={(e) =>
                    updateField(
                      'vehicleValue',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="€"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purchaseCost">Purchase Cost (ex VAT)</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={formData.purchaseCost || ''}
                  onChange={(e) =>
                    updateField(
                      'purchaseCost',
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="€"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="consumptionTarget">Consumption Target</Label>
              <Input
                id="consumptionTarget"
                type="number"
                step="0.1"
                value={formData.consumptionTarget || ''}
                onChange={(e) =>
                  updateField(
                    'consumptionTarget',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="L/100km or kWh/100km"
              />
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
