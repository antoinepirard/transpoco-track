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
import type { GarageGroup, GroupType } from '@/types/garage';

const GROUP_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#F43F5E', // rose
  '#0EA5E9', // sky
];

const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  vehicle: 'Vehicle',
  driver: 'Driver',
  'vehicle-driver': 'Assignment',
};

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'rename';
  groupType: GroupType;
  group?: GarageGroup | null;
  onSubmit: (name: string, color: string) => void;
}

export function GroupDialog({
  open,
  onOpenChange,
  mode,
  groupType,
  group,
  onSubmit,
}: GroupDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(GROUP_COLORS[0]);

  useEffect(() => {
    if (open) {
      if (mode === 'rename' && group) {
        setName(group.name);
        setColor(group.color || GROUP_COLORS[0]);
      } else {
        setName('');
        setColor(GROUP_COLORS[Math.floor(Math.random() * GROUP_COLORS.length)]);
      }
    }
  }, [open, mode, group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), color);
      onOpenChange(false);
    }
  };

  const title =
    mode === 'add'
      ? `Add ${GROUP_TYPE_LABELS[groupType]} Group`
      : 'Rename Group';

  const description =
    mode === 'add'
      ? `Create a new group to organize your ${groupType === 'vehicle-driver' ? 'assignments' : `${groupType}s`}.`
      : 'Update the group name and color.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name..."
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
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
              disabled={!name.trim()}
              className="bg-[#3D88C5] hover:bg-[#3478a5]"
            >
              {mode === 'add' ? 'Create Group' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
