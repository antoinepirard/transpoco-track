import { useEffect, useState } from 'react';
import type { Mission, PresetType } from '@/types/dashboard';

const STORAGE_KEY = 'tp:dashboard:preset';

export interface DashboardPresetSelection {
  mission: Mission;
  presetType: PresetType;
  presetId: string; // matches registry id
}

const DEFAULT_SELECTION: DashboardPresetSelection = {
  mission: 'fieldService',
  presetType: 'today',
  presetId: 'fieldService:today',
};

export function useDashboardPreset() {
  const [selection, setSelection] = useState<DashboardPresetSelection>(DEFAULT_SELECTION);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setSelection(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const save = (next: DashboardPresetSelection) => {
    setSelection(next);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // ignore
    }
  };

  return { selection, save };
}


