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
  UserIcon,
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import type { GarageDriver, GarageGroup } from '@/types/garage';
import { getVehicleName } from '@/lib/demo/garageData';
import { cn } from '@/lib/utils';

interface DriverDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: GarageDriver | null;
  driverGroups: GarageGroup[];
  onSave: (driver: GarageDriver) => void;
  onArchive: (driver: GarageDriver) => void;
  onRestore: (driver: GarageDriver) => void;
  onDelete: (driver: GarageDriver) => void;
}

function isLicenseExpiringSoon(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiry <= thirtyDaysFromNow && expiry >= now;
}

function isLicenseExpired(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  return expiry < new Date();
}

export function DriverDetailDrawer({
  open,
  onOpenChange,
  driver,
  driverGroups,
  onSave,
  onArchive,
  onRestore,
  onDelete,
}: DriverDetailDrawerProps) {
  const [formData, setFormData] = useState<Partial<GarageDriver>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (driver && open) {
      setFormData({ ...driver });
      setHasChanges(false);
    }
  }, [driver, open]);

  const updateField = <K extends keyof GarageDriver>(
    field: K,
    value: GarageDriver[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (driver && formData) {
      onSave({
        ...driver,
        ...formData,
        updatedAt: new Date().toISOString(),
      } as GarageDriver);
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

  if (!driver) return null;

  const isArchived = driver.status === 'archived';
  const licenseExpired = isLicenseExpired(driver.licenseExpiry);
  const licenseExpiringSoon = isLicenseExpiringSoon(driver.licenseExpiry);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">
                {driver.firstName} {driver.lastName}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                {driver.email || 'No email'}
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
          {(licenseExpired || licenseExpiringSoon) && (
            <div
              className={cn(
                'mt-3 p-3 rounded-lg flex items-center gap-2 text-sm',
                licenseExpired
                  ? 'bg-red-50 text-red-700'
                  : 'bg-amber-50 text-amber-700'
              )}
            >
              <WarningIcon className="w-4 h-4" />
              {licenseExpired
                ? 'License has expired!'
                : 'License expiring soon'}
            </div>
          )}
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4 px-6">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              Details
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex-1">
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => updateField('firstName', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => updateField('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => updateField('licenseNumber', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenseExpiry">License Expiry</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={formData.licenseExpiry || ''}
                  onChange={(e) => updateField('licenseExpiry', e.target.value)}
                  className={cn(
                    licenseExpired && 'border-red-300 focus:ring-red-500',
                    licenseExpiringSoon &&
                      !licenseExpired &&
                      'border-amber-300 focus:ring-amber-500'
                  )}
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
                  {driverGroups.map((g) => (
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
                <span className="text-gray-500">Assigned Vehicle</span>
                <span className="font-medium">
                  {getVehicleName(driver.assignedVehicleId)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span>{new Date(driver.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Updated</span>
                <span>{new Date(driver.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="mt-4">
            <div className="text-center py-8 text-gray-500">
              <p>Vehicle assignment history will appear here.</p>
              <p className="text-sm mt-1">
                Currently assigned: {getVehicleName(driver.assignedVehicleId)}
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
                onClick={() => onRestore(driver)}
              >
                <ArrowCounterClockwiseIcon className="w-4 h-4 mr-1" />
                Restore
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onArchive(driver)}
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
                if (confirm('Are you sure you want to delete this driver?')) {
                  onDelete(driver);
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
