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
  LinkIcon,
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
  StarIcon,
} from '@phosphor-icons/react';
import type {
  VehicleDriverAssignment,
  GarageVehicle,
  GarageDriver,
  GarageGroup,
} from '@/types/garage';
import { cn } from '@/lib/utils';

interface AssignmentDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: VehicleDriverAssignment | null;
  vehicles: GarageVehicle[];
  drivers: GarageDriver[];
  assignmentGroups: GarageGroup[];
  onSave: (assignment: VehicleDriverAssignment) => void;
  onArchive: (assignment: VehicleDriverAssignment) => void;
  onRestore: (assignment: VehicleDriverAssignment) => void;
  onDelete: (assignment: VehicleDriverAssignment) => void;
}

export function AssignmentDetailDrawer({
  open,
  onOpenChange,
  assignment,
  vehicles,
  drivers,
  assignmentGroups,
  onSave,
  onArchive,
  onRestore,
  onDelete,
}: AssignmentDetailDrawerProps) {
  const [formData, setFormData] = useState<Partial<VehicleDriverAssignment>>(
    {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  const activeVehicles = vehicles.filter((v) => v.status === 'active');
  const activeDrivers = drivers.filter((d) => d.status === 'active');

  useEffect(() => {
    if (assignment && open) {
      setFormData({ ...assignment });
      setHasChanges(false);
    }
  }, [assignment, open]);

  const updateField = <K extends keyof VehicleDriverAssignment>(
    field: K,
    value: VehicleDriverAssignment[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (assignment && formData) {
      const vehicle = vehicles.find((v) => v.id === formData.vehicleId);
      const driver = drivers.find((d) => d.id === formData.driverId);

      onSave({
        ...assignment,
        ...formData,
        vehicle,
        driver,
        updatedAt: new Date().toISOString(),
      } as VehicleDriverAssignment);
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

  if (!assignment) return null;

  const isArchived = assignment.status === 'archived';

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LinkIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate flex items-center gap-2">
                Assignment
                {assignment.isPrimary && (
                  <StarIcon className="w-4 h-4 text-amber-500" weight="fill" />
                )}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                {assignment.vehicle?.name} → {assignment.driver?.firstName}{' '}
                {assignment.driver?.lastName}
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
            <TabsTrigger value="history" className="flex-1">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(v) => updateField('vehicleId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vehicle..." />
                </SelectTrigger>
                <SelectContent>
                  {activeVehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex flex-col">
                        <span>{v.name}</span>
                        <span className="text-xs text-gray-500">
                          {v.registrationNumber}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver">Driver</Label>
              <Select
                value={formData.driverId}
                onValueChange={(v) => updateField('driverId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver..." />
                </SelectTrigger>
                <SelectContent>
                  {activeDrivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex flex-col">
                        <span>
                          {d.firstName} {d.lastName}
                        </span>
                        {d.email && (
                          <span className="text-xs text-gray-500">
                            {d.email}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => updateField('startDate', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) =>
                    updateField('endDate', e.target.value || undefined)
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
                  {assignmentGroups.map((g) => (
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) =>
                  updateField('isPrimary', checked === true)
                }
              />
              <Label
                htmlFor="isPrimary"
                className="text-sm font-normal cursor-pointer"
              >
                Primary assignment (main driver for this vehicle)
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes || ''}
                onChange={(e) =>
                  updateField('notes', e.target.value || undefined)
                }
                placeholder="Optional notes about this assignment"
              />
            </div>

            {/* Read-only info */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span>
                  {new Date(assignment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span>
                  {new Date(assignment.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="text-center py-8 text-gray-500">
              <p>Assignment history will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 p-6 pt-4 border-t flex-row gap-2">
          <div className="flex gap-2">
            {isArchived ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRestore(assignment)}
              >
                <ArrowCounterClockwiseIcon className="w-4 h-4 mr-1" />
                Restore
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onArchive(assignment)}
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
                if (
                  confirm('Are you sure you want to delete this assignment?')
                ) {
                  onDelete(assignment);
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
