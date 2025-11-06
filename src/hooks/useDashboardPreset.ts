import { useEffect, useState } from 'react';
import type { Mission, PresetKey } from '@/types/dashboard';

const STORAGE_KEY = 'tp:dashboard:preset';

export interface DashboardPresetSelection {
  mission: Mission;
  presetKey: PresetKey;
  presetId: string; // `${mission}:${presetKey}`
}

const DEFAULT_SELECTION: DashboardPresetSelection = {
  mission: 'fieldService',
  presetKey: 'slaProductivity',
  presetId: 'fieldService:slaProductivity',
};

export function useDashboardPreset() {
  const [selection, setSelection] = useState<DashboardPresetSelection>(DEFAULT_SELECTION);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        // New shape already
        if (parsed && parsed.presetKey && typeof parsed.presetId === 'string' && parsed.presetId.split(':').length === 2) {
          setSelection(parsed);
          return;
        }

        // Migrate from mission+useCase+presetType shape
        if (parsed && parsed.useCase) {
          const mission: Mission = parsed.mission ?? 'fieldService';
          const presetKey: PresetKey = parsed.useCase;
          const migrated: DashboardPresetSelection = {
            mission,
            presetKey,
            presetId: `${mission}:${presetKey}`,
          };
          setSelection(migrated);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } catch {}
          return;
        }

        // Migrate from 3-part id mission:useCase:presetType
        if (parsed && typeof parsed.presetId === 'string' && parsed.presetId.split(':').length === 3) {
          const [mission, presetKey] = parsed.presetId.split(':');
          const migrated: DashboardPresetSelection = {
            mission: mission as Mission,
            presetKey: presetKey as PresetKey,
            presetId: `${mission}:${presetKey}`,
          };
          setSelection(migrated);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } catch {}
          return;
        }

        // Migrate from mission:presetType (choose mission default)
        if (parsed && typeof parsed.presetId === 'string' && parsed.presetId.split(':').length === 2) {
          const [mission] = parsed.presetId.split(':');
          const defaultKey: PresetKey =
            mission === 'fieldService' ? 'slaProductivity'
            : mission === 'lastMile' ? 'promiseThroughput'
            : mission === 'longHaul' ? 'complianceFirstOps'
            : mission === 'construction' ? 'siteControlUtilization'
            : mission === 'passenger' ? 'serviceAdherence'
            : 'coverageQuality';
          const migrated: DashboardPresetSelection = {
            mission: mission as Mission,
            presetKey: defaultKey,
            presetId: `${mission}:${defaultKey}`,
          };
          setSelection(migrated);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } catch {}
          return;
        }

        // Fallback to default
        setSelection(DEFAULT_SELECTION);
      }
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


