import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { usePersistedState } from '@/features/settings/hooks/usePersistedState';

interface Prefs {
  a: number;
  b: string;
}

const KEY = 'talentflow.test.persisted';
const defaults: Prefs = { a: 1, b: 'x' };

afterEach(() => {
  window.localStorage.clear();
});

describe('usePersistedState', () => {
  it('returns the defaults when nothing is persisted', () => {
    const { result } = renderHook(() => usePersistedState(KEY, defaults));
    expect(result.current.value).toEqual(defaults);
  });

  it('persists an updated value to localStorage', () => {
    const { result } = renderHook(() => usePersistedState(KEY, defaults));

    act(() => result.current.setValue({ a: 2, b: 'y' }));

    expect(result.current.value).toEqual({ a: 2, b: 'y' });
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? '{}')).toEqual({ a: 2, b: 'y' });
  });

  it('supports functional updates based on the previous value', () => {
    const { result } = renderHook(() => usePersistedState(KEY, defaults));

    act(() => result.current.setValue((previous) => ({ ...previous, a: previous.a + 10 })));

    expect(result.current.value.a).toBe(11);
  });

  it('hydrates a previously persisted value on mount', () => {
    window.localStorage.setItem(KEY, JSON.stringify({ a: 5, b: 'z' }));

    const { result } = renderHook(() => usePersistedState(KEY, defaults));

    expect(result.current.value).toEqual({ a: 5, b: 'z' });
  });

  it('merges persisted values onto the defaults so new fields keep a value', () => {
    window.localStorage.setItem(KEY, JSON.stringify({ a: 7 }));

    const { result } = renderHook(() => usePersistedState(KEY, defaults));

    expect(result.current.value).toEqual({ a: 7, b: 'x' });
  });

  it('falls back to the defaults when the persisted entry is malformed', () => {
    window.localStorage.setItem(KEY, '{not valid json');

    const { result } = renderHook(() => usePersistedState(KEY, defaults));

    expect(result.current.value).toEqual(defaults);
  });

  it('restores the defaults and clears storage on reset', () => {
    const { result } = renderHook(() => usePersistedState(KEY, defaults));

    act(() => {
      result.current.setValue({ a: 9, b: 'q' });
      result.current.reset();
    });

    expect(result.current.value).toEqual(defaults);
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});
