'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { Mission, PresetType } from '@/types/dashboard'

export interface DashboardPresetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selection: { mission: Mission; presetType: PresetType; presetId: string }
  onSave: (next: { mission: Mission; presetType: PresetType; presetId: string }) => void
}

const MISSIONS: { value: Mission; label: string }[] = [
  { value: 'fieldService', label: 'Field Service' },
  { value: 'lastMile', label: 'Last‑Mile' },
  { value: 'longHaul', label: 'Long‑Haul' },
  { value: 'construction', label: 'Construction' },
  { value: 'passenger', label: 'Passenger Transport' },
  { value: 'municipal', label: 'Municipal Services' },
]

const PRESET_TYPES: { value: PresetType; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'reliability30d', label: '30‑Day Reliability' },
  { value: 'costEfficiency', label: 'Cost & Efficiency' },
  { value: 'safetyCompliance', label: 'Safety & Compliance' },
  { value: 'customerExperience', label: 'Customer Experience' },
]

export function DashboardPresetDialog({ open, onOpenChange, selection, onSave }: DashboardPresetDialogProps) {
  const [mission, setMission] = useState<Mission>(selection.mission)
  const [presetType, setPresetType] = useState<PresetType>(selection.presetType)

  useEffect(() => {
    if (!open) return
    setMission(selection.mission)
    setPresetType(selection.presetType)
  }, [open, selection.mission, selection.presetType])

  const computedId = useMemo(() => `${mission}:${presetType}`, [mission, presetType])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit dashboard preset</DialogTitle>
          <DialogDescription>Choose a mission and preset type to shape the dashboard.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Mission</div>
            <Command>
              <CommandList>
                <CommandEmpty>No missions found.</CommandEmpty>
                <CommandGroup>
                  {MISSIONS.map((m) => (
                    <CommandItem
                      key={m.value}
                      onSelect={() => setMission(m.value)}
                      data-selected={mission === m.value}
                      className={mission === m.value ? 'data-[selected=true]:bg-accent' : ''}
                    >
                      <span className="truncate">{m.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Preset type</div>
            <Command>
              <CommandList>
                <CommandEmpty>No preset types found.</CommandEmpty>
                <CommandGroup>
                  {PRESET_TYPES.map((p) => (
                    <CommandItem
                      key={p.value}
                      onSelect={() => setPresetType(p.value)}
                      data-selected={presetType === p.value}
                      className={presetType === p.value ? 'data-[selected=true]:bg-accent' : ''}
                    >
                      <span className="truncate">{p.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({ mission, presetType, presetId: computedId })
              onOpenChange(false)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DashboardPresetDialog


