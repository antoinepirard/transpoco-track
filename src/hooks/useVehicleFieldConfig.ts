'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_VEHICLE_FIELDS,
  CURRENT_CONFIG_VERSION,
  STORAGE_KEY,
  type VehicleFieldConfig,
  type VehicleDrawerFieldConfig,
  type VehicleFieldTab,
} from '@/lib/vehicleFieldConfig';

export function useVehicleFieldConfig() {
  const [config, setConfig] = useState<VehicleDrawerFieldConfig>({
    version: CURRENT_CONFIG_VERSION,
    fields: DEFAULT_VEHICLE_FIELDS,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as VehicleDrawerFieldConfig;
        // Handle version migrations if needed in the future
        if (parsed.version === CURRENT_CONFIG_VERSION) {
          setConfig(parsed);
        }
      }
    } catch {
      // Use defaults on error
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  const saveConfig = useCallback((newConfig: VehicleDrawerFieldConfig) => {
    setConfig(newConfig);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Toggle field visibility
  const toggleFieldVisibility = useCallback(
    (fieldId: string) => {
      setConfig((prev) => {
        const field = prev.fields.find((f) => f.id === fieldId);
        if (!field || field.required) return prev; // Cannot hide required fields

        const newFields = prev.fields.map((f) =>
          f.id === fieldId ? { ...f, visible: !f.visible } : f
        );
        const newConfig = { ...prev, fields: newFields };
        saveConfig(newConfig);
        return newConfig;
      });
    },
    [saveConfig]
  );

  // Reorder fields within a tab
  const reorderFields = useCallback(
    (tab: VehicleFieldTab, fromIndex: number, toIndex: number) => {
      setConfig((prev) => {
        const tabFields = prev.fields
          .filter((f) => f.tab === tab)
          .sort((a, b) => a.order - b.order);

        const [moved] = tabFields.splice(fromIndex, 1);
        tabFields.splice(toIndex, 0, moved);

        // Reassign order values
        const reorderedTabFields = tabFields.map((f, idx) => ({
          ...f,
          order: idx,
        }));

        const newFields = prev.fields.map((f) => {
          if (f.tab !== tab) return f;
          const updated = reorderedTabFields.find((tf) => tf.id === f.id);
          return updated || f;
        });

        const newConfig = { ...prev, fields: newFields };
        saveConfig(newConfig);
        return newConfig;
      });
    },
    [saveConfig]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaultConfig = {
      version: CURRENT_CONFIG_VERSION,
      fields: DEFAULT_VEHICLE_FIELDS,
    };
    saveConfig(defaultConfig);
  }, [saveConfig]);

  // Get visible fields for a tab, sorted by order
  const getVisibleFieldsForTab = useCallback(
    (tab: VehicleFieldTab): VehicleFieldConfig[] => {
      return config.fields
        .filter((f) => f.tab === tab && f.visible)
        .sort((a, b) => a.order - b.order);
    },
    [config.fields]
  );

  // Get all fields for a tab (for customization dialog)
  const getFieldsForTab = useCallback(
    (tab: VehicleFieldTab): VehicleFieldConfig[] => {
      return config.fields
        .filter((f) => f.tab === tab)
        .sort((a, b) => a.order - b.order);
    },
    [config.fields]
  );

  return {
    config,
    isLoaded,
    toggleFieldVisibility,
    reorderFields,
    resetToDefaults,
    getVisibleFieldsForTab,
    getFieldsForTab,
  };
}
