import { useCallback, useState } from 'react';

import { localStorageService } from '@/services/storage/local-storage.service';

/** The shape returned by {@link usePersistedState}. */
export interface PersistedState<TValue> {
  value: TValue;
  /** Replaces the value with the next value (or a value produced from the previous). */
  setValue: (next: TValue | ((previous: TValue) => TValue)) => void;
  /** Restores the provided defaults and clears the persisted entry. */
  reset: () => void;
}

/**
 * A typed, JSON-backed `useState` that persists to `localStorage` through the
 * shared storage service. Reads are merged onto the defaults so newly added
 * fields always have a value, and malformed entries fall back to the defaults
 * rather than throwing. This is the primitive behind the settings hooks.
 */
export function usePersistedState<TValue extends object>(
  key: string,
  defaults: TValue,
): PersistedState<TValue> {
  const [value, setStoredValue] = useState<TValue>(() => readValue(key, defaults));

  const setValue = useCallback(
    (next: TValue | ((previous: TValue) => TValue)) => {
      setStoredValue((previous) => {
        const resolved =
          typeof next === 'function' ? (next as (p: TValue) => TValue)(previous) : next;
        localStorageService.set(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    localStorageService.remove(key);
    setStoredValue(defaults);
  }, [key, defaults]);

  return { value, setValue, reset };
}

/** Reads and validates the persisted value, merging it onto the defaults. */
function readValue<TValue extends object>(key: string, defaults: TValue): TValue {
  const raw = localStorageService.get(key);
  if (!raw) return defaults;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return defaults;
    return { ...defaults, ...(parsed as Partial<TValue>) };
  } catch {
    // A corrupted entry should degrade to defaults rather than crash the UI.
    return defaults;
  }
}
