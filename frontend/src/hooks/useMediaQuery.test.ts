import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useIsDesktop, useMediaQuery } from '@/hooks/useMediaQuery';

/**
 * A controllable `matchMedia` stub: tests set which queries currently match and
 * can emit a `change` event to registered listeners to simulate a viewport change.
 */
function installMatchMedia(matchingQueries: Set<string>) {
  const listeners = new Set<() => void>();

  const matchMedia = vi.fn((query: string): MediaQueryList => {
    return {
      matches: matchingQueries.has(query),
      media: query,
      onchange: null,
      addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  });

  window.matchMedia = matchMedia;

  return {
    emitChange(nextMatching: Set<string>) {
      matchingQueries.clear();
      nextMatching.forEach((query) => matchingQueries.add(query));
      listeners.forEach((listener) => listener());
    },
  };
}

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('useMediaQuery', () => {
  it('returns true when the query currently matches', () => {
    installMatchMedia(new Set(['(min-width: 900px)']));
    const { result } = renderHook(() => useMediaQuery('(min-width: 900px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when the query does not match', () => {
    installMatchMedia(new Set());
    const { result } = renderHook(() => useMediaQuery('(min-width: 900px)'));
    expect(result.current).toBe(false);
  });

  it('updates when the media query starts matching', () => {
    const controls = installMatchMedia(new Set());
    const { result } = renderHook(() => useMediaQuery('(min-width: 900px)'));
    expect(result.current).toBe(false);

    act(() => controls.emitChange(new Set(['(min-width: 900px)'])));
    expect(result.current).toBe(true);
  });
});

describe('useIsDesktop', () => {
  it('reflects the tablet-and-up breakpoint', () => {
    installMatchMedia(new Set(['(min-width: 768px)']));
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});
