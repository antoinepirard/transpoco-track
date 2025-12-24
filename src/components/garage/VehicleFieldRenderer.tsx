'use client';

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
import type { VehicleFieldConfig } from '@/lib/vehicleFieldConfig';
import type { GarageVehicle, GarageGroup } from '@/types/garage';
import { getDriverName } from '@/lib/demo/garageData';

interface VehicleFieldRendererProps {
  field: VehicleFieldConfig;
  value: unknown;
  onChange: (fieldId: string, value: unknown) => void;
  vehicleGroups?: GarageGroup[];
  vehicle?: GarageVehicle;
}

export function VehicleFieldRenderer({
  field,
  value,
  onChange,
  vehicleGroups = [],
  vehicle,
}: VehicleFieldRendererProps) {
  const handleChange = (newValue: unknown) => {
    onChange(field.id, newValue);
  };

  switch (field.type) {
    case 'text':
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value || undefined)}
            placeholder={field.placeholder}
            className={
              field.id === 'registrationNumber' ? 'uppercase' : undefined
            }
          />
        </div>
      );

    case 'number':
      return (
        <div className="grid gap-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Input
            id={field.id}
            type="number"
            value={typeof value === 'number' ? value : ''}
            onChange={(e) =>
              handleChange(
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            placeholder={field.placeholder}
          />
        </div>
      );

    case 'select':
      // Handle special case for groupId which needs vehicleGroups
      if (field.id === 'groupId') {
        return (
          <div className="grid gap-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select
              value={(value as string) || 'none'}
              onValueChange={(v) => handleChange(v === 'none' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No group</SelectItem>
                {vehicleGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      return (
        <div className="grid gap-2">
          <Label htmlFor={field.id}>{field.label}</Label>
          <Select
            value={(value as string) || 'none'}
            onValueChange={(v) => handleChange(v === 'none' ? undefined : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.id}
            checked={(value as boolean) ?? false}
            onCheckedChange={(checked) => handleChange(checked === true)}
          />
          <Label
            htmlFor={field.id}
            className="text-sm font-normal cursor-pointer"
          >
            {field.label}
          </Label>
        </div>
      );

    case 'readonly':
      let displayValue = '-';
      if (field.id === 'assignedDriver' && vehicle?.assignedDriverId) {
        displayValue = getDriverName(vehicle.assignedDriverId);
      } else if (field.id === 'createdAt' && vehicle?.createdAt) {
        displayValue = new Date(vehicle.createdAt).toLocaleDateString();
      } else if (field.id === 'updatedAt' && vehicle?.updatedAt) {
        displayValue = new Date(vehicle.updatedAt).toLocaleDateString();
      }

      return (
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{field.label}</span>
          <span className="font-medium">{displayValue}</span>
        </div>
      );

    default:
      return null;
  }
}
