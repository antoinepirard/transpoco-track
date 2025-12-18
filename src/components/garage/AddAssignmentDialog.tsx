'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  GarageVehicle,
  GarageDriver,
  GarageGroup,
  VehicleDriverAssignment,
} from '@/types/garage';

interface AddAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: GarageVehicle[];
  drivers: GarageDriver[];
  assignmentGroups: GarageGroup[];
  onSubmit: (
    assignment: Omit<
      VehicleDriverAssignment,
      'id' | 'createdAt' | 'updatedAt' | 'vehicle' | 'driver'
    >
  ) => void;
}

export function AddAssignmentDialog({
  open,
  onOpenChange,
  vehicles,
  drivers,
  assignmentGroups,
  onSubmit,
}: AddAssignmentDialogProps) {
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [notes, setNotes] = useState('');

  // Filter to only show active vehicles and drivers
  const activeVehicles = vehicles.filter((v) => v.status === 'active');
  const activeDrivers = drivers.filter((d) => d.status === 'active');

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setVehicleId('');
      setDriverId('');
      setGroupId('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setIsPrimary(true);
      setNotes('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleId && driverId) {
      onSubmit({
        vehicleId,
        driverId,
        groupId: groupId || undefined,
        startDate,
        status: 'active',
        isPrimary,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    }
  };

  const isValid = vehicleId && driverId;

  const selectedVehicle = activeVehicles.find((v) => v.id === vehicleId);
  const selectedDriver = activeDrivers.find((d) => d.id === driverId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
            <DialogDescription>Assign a driver to a vehicle.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vehicle">
                Vehicle <span className="text-red-500">*</span>
              </Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
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
              {selectedVehicle && (
                <p className="text-xs text-gray-500">
                  {selectedVehicle.make} {selectedVehicle.model} •{' '}
                  {selectedVehicle.registrationNumber}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver">
                Driver <span className="text-red-500">*</span>
              </Label>
              <Select value={driverId} onValueChange={setDriverId}>
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
              {selectedDriver && selectedDriver.email && (
                <p className="text-xs text-gray-500">{selectedDriver.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="group">Group (optional)</Label>
                <Select
                  value={groupId || 'none'}
                  onValueChange={(v) => setGroupId(v === 'none' ? '' : v)}
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
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked === true)}
              />
              <Label
                htmlFor="isPrimary"
                className="text-sm font-normal cursor-pointer"
              >
                Primary assignment (main driver for this vehicle)
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Backup driver for night shifts"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="bg-[#3D88C5] hover:bg-[#3478a5]"
            >
              Create Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
