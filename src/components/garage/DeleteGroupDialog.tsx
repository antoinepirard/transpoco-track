'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { GarageGroup } from '@/types/garage';

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GarageGroup | null;
  onConfirm: () => void;
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  group,
  onConfirm,
}: DeleteGroupDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the group{' '}
            <span className="font-semibold text-gray-900">
              &quot;{group?.name}&quot;
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
