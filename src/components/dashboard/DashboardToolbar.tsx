'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDashboardPreset } from '@/hooks/useDashboardPreset'
import { DashboardPresetDialog } from '@/components/dashboard/DashboardPresetDialog'
import { Badge } from '@/components/ui/badge'
import { PRESETS } from '@/config/dashboardPresets'

const MISSION_LABEL: Record<string, string> = {
  fieldService: 'Field Service',
  lastMile: 'Last‑Mile',
  longHaul: 'Long‑Haul',
  construction: 'Construction',
  passenger: 'Passenger Transport',
  municipal: 'Municipal Services',
}

export function DashboardToolbar() {
  const { selection, save } = useDashboardPreset()
  const [open, setOpen] = useState(false)

  const preset = PRESETS.find(
    (p) => p.id === `${selection.mission}:${selection.presetKey}`
  )

  return (
    <>
      <div className="hidden sm:flex items-center gap-2 mr-2">
        <Badge variant="outline">{MISSION_LABEL[selection.mission] || selection.mission}</Badge>
        {preset ? (
          <Badge className="max-w-[240px] truncate" variant="secondary">{preset.name}</Badge>
        ) : null}
      </div>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <DashboardPresetDialog
        open={open}
        onOpenChange={setOpen}
        selection={selection}
        onSave={save}
      />
    </>
  )
}

export default DashboardToolbar


