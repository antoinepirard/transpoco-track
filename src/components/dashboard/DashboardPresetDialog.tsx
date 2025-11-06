'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { Mission, PresetKey } from '@/types/dashboard';
import { PRESETS } from '@/config/dashboardPresets';

export interface DashboardPresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: { mission: Mission; presetKey: PresetKey; presetId: string };
  onSave: (next: {
    mission: Mission;
    presetKey: PresetKey;
    presetId: string;
  }) => void;
}

const MISSIONS: { value: Mission; label: string }[] = [
  { value: 'fieldService', label: 'Field Service' },
  { value: 'lastMile', label: 'Last‑Mile' },
  { value: 'longHaul', label: 'Long‑Haul' },
  { value: 'construction', label: 'Construction' },
  { value: 'passenger', label: 'Passenger Transport' },
  { value: 'municipal', label: 'Municipal Services' },
];

function presetsForMission(mission: Mission) {
  return PRESETS.filter((p) => p.mission === mission);
}

export function DashboardPresetDialog({
  open,
  onOpenChange,
  selection,
  onSave,
}: DashboardPresetDialogProps) {
  const [mission, setMission] = useState<Mission>(selection.mission);
  const [presetKey, setPresetKey] = useState<PresetKey>(selection.presetKey);

  useEffect(() => {
    if (!open) return;
    setMission(selection.mission);
    setPresetKey(selection.presetKey);
  }, [open, selection.mission, selection.presetKey]);

  useEffect(() => {
    // Ensure presetKey stays valid for the selected mission, pick default if not
    const available = presetsForMission(mission);
    if (!available.find((u) => u.presetKey === presetKey)) {
      const next = available.find((p) => p.isDefault) ?? available[0];
      if (next) setPresetKey(next.presetKey);
    }
  }, [mission, presetKey]);

  const computedId = useMemo(
    () => `${mission}:${presetKey}`,
    [mission, presetKey]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit dashboard preset</DialogTitle>
          <DialogDescription>
            Choose a mission and preset to shape the dashboard.
          </DialogDescription>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Current:</span>
            <Badge variant="outline">
              {MISSIONS.find((m) => m.value === selection.mission)?.label ||
                selection.mission}
            </Badge>
            <Badge variant="secondary">
              {presetsForMission(selection.mission).find(
                (p) => p.presetKey === selection.presetKey
              )?.name || selection.presetKey}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Mission
            </div>
            <Command>
              <CommandList>
                <CommandEmpty>No missions found.</CommandEmpty>
                <CommandGroup>
                  {MISSIONS.map((m) => (
                    <CommandItem
                      key={m.value}
                      onSelect={() => setMission(m.value)}
                      className={
                        mission === m.value
                          ? 'bg-accent text-accent-foreground'
                          : ''
                      }
                    >
                      <span className="truncate">{m.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Preset
            </div>
            <Command>
              <CommandList>
                <CommandEmpty>No presets found.</CommandEmpty>
                <CommandGroup>
                  {presetsForMission(mission).map((p) => (
                    <CommandItem
                      key={p.presetKey}
                      onSelect={() => setPresetKey(p.presetKey)}
                      data-selected={presetKey === p.presetKey}
                      className={
                        presetKey === p.presetKey
                          ? 'data-[selected=true]:bg-accent'
                          : ''
                      }
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate">
                          {p.name}
                          {p.isDefault ? ' (default)' : ''}
                        </span>
                        <span className="text-muted-foreground text-xs line-clamp-2">
                          {p.description}
                        </span>
                      </div>
                      {selection.mission === mission &&
                      selection.presetKey === p.presetKey ? (
                        <Check className="ml-auto text-primary" />
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({ mission, presetKey, presetId: computedId });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DashboardPresetDialog;
