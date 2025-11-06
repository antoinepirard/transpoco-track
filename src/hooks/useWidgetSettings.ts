'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export function useWidgetSettings<T extends Record<string, Json>>(
  id: string,
  defaults: T
) {
  const storageKey = useMemo(() => `tp:widget:${id}` as const, [id]);
  const defaultsRef = useRef(defaults);
  const [settings, setSettings] = useState<T>(() => {
    // Initialize from localStorage on mount
    try {
      if (typeof window === 'undefined') return defaults;
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<T>;
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Update defaults ref
  useEffect(() => {
    defaultsRef.current = defaults;
  }, [defaults]);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Persist on changes (skip first render)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [storageKey, settings, isInitialized]);

  const update = useCallback((partial: Partial<T>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setSettings(defaultsRef.current);
  }, []);

  return { settings, setSettings, update, reset } as const;
}


