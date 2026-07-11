import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks whether a CSS media query currently matches, staying in sync via
 * `useSyncExternalStore` — the idiomatic way to subscribe to an external
 * browser API without effect-driven state updates.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener('change', onChange);
      return () => mediaQuery.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

/** Tailwind's `md` breakpoint (768px). True on tablet-and-up viewports. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}
