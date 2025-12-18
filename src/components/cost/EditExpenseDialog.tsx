'use client';

import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Expense } from './ExpensesList';

// Demo vehicle list (reused from InvoiceDropZone)
const DEMO_VEHICLES = [
  { id: 'DUB-117', label: 'Transit Custom · DUB-117' },
  { id: 'DUB-204', label: 'Sprinter 316CDI · DUB-204' },
  { id: 'CORK-118', label: 'Vivaro-e · CORK-118' },
  { id: 'LIM-077', label: 'Transit Custom · LIM-077' },
  { id: 'BEL-033', label: 'eVito · BEL-033' },
  { id: 'GAL-022', label: 'Crafter · GAL-022' },
  { id: 'DUB-301', label: 'Transit · DUB-301' },
  { id: 'CORK-205', label: 'Sprinter · CORK-205' },
];

const COST_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'lease', label: 'Lease/Finance' },
  { value: 'tax', label: 'Road Tax' },
  { value: 'tolls', label: 'Tolls' },
  { value: 'fines', label: 'Fines' },
  { value: 'parking', label: 'Parking' },
  { value: 'other', label: 'Other' },
];

interface EditExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: Expense) => void;
}

export function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSave,
}: EditExpenseDialogProps) {
  const [formData, setFormData] = useState<Expense | null>(null);

  // Reset form when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({ ...expense });
    } else {
      setFormData(null);
    }
  }, [expense]);

  const handleFieldChange = (field: keyof Expense, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update the expense details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Vehicle */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Vehicle</Label>
            <Select
              value={formData.vehicle}
              onValueChange={(v) => handleFieldChange('vehicle', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEMO_VEHICLES.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => handleFieldChange('category', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COST_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount and Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Amount (€)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  €
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleFieldChange('amount', e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Supplier</Label>
            <Input
              value={formData.supplier}
              onChange={(e) => handleFieldChange('supplier', e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


