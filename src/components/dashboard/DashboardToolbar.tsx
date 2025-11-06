'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDashboardPreset } from '@/hooks/useDashboardPreset'
import { DashboardPresetDialog } from '@/components/dashboard/DashboardPresetDialog'
 

export function DashboardToolbar() {
  const { selection, save } = useDashboardPreset()
  const [open, setOpen] = useState(false)

  return (
    <>
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


