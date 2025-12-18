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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GarageVehicle, GarageGroup, FuelType } from '@/types/garage';

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' },
];

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleGroups: GarageGroup[];
  onSubmit: (
    vehicle: Omit<GarageVehicle, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
}

export function AddVehicleDialog({
  open,
  onOpenChange,
  vehicleGroups,
  onSubmit,
}: AddVehicleDialogProps) {
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');
  const [secondaryDescription, setSecondaryDescription] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState<FuelType | ''>('');
  const [fleetNumber, setFleetNumber] = useState('');
  const [division, setDivision] = useState('');
  const [groupId, setGroupId] = useState<string>('');

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setRegistrationNumber('');
      setDescription('');
      setSecondaryDescription('');
      setMake('');
      setModel('');
      setFuelType('');
      setFleetNumber('');
      setDivision('');
      setGroupId('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && registrationNumber.trim()) {
      onSubmit({
        registrationNumber: registrationNumber.trim().toUpperCase(),
        description: description.trim(),
        secondaryDescription: secondaryDescription.trim() || undefined,
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        fuelType: fuelType || undefined,
        fleetNumber: fleetNumber.trim() || undefined,
        division: division.trim() || undefined,
        groupId: groupId || undefined,
        status: 'active',
      });
      onOpenChange(false);
    }
  };

  const isValid = description.trim() && registrationNumber.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
            <DialogDescription>
              Add a new vehicle to your fleet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="registration">
                  Registration <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="registration"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. 191-D-12345"
                  className="uppercase"
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fleetNumber">Fleet Number</Label>
                <Input
                  id="fleetNumber"
                  value={fleetNumber}
                  onChange={(e) => setFleetNumber(e.target.value)}
                  placeholder="e.g. FL001"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Transit Custom 01"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secondaryDescription">
                Secondary Description
              </Label>
              <Input
                id="secondaryDescription"
                value={secondaryDescription}
                onChange={(e) => setSecondaryDescription(e.target.value)}
                placeholder="Optional additional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Ford"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Transit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fuel">Fuel Type</Label>
                <Select
                  value={fuelType || 'none'}
                  onValueChange={(v) =>
                    setFuelType(v === 'none' ? '' : (v as FuelType))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
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
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="e.g. Dublin Fleet"
                />
              </div>
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
              Add Vehicle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
