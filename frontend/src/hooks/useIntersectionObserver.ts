import { useEffect, useRef } from 'react';

export interface UseIntersectionObserverOptions {
  /** Invoked whenever the observed element enters the viewport. */
  onIntersect: () => void;
  /** When false the observer is detached (e.g. no more pages to load). */
  enabled?: boolean;
  /** Grows the root's bounding box so loading starts before the sentinel is visible. */
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Observes a sentinel element and fires `onIntersect` when it scrolls into view.
 * Returns a ref to attach to the sentinel. Used to drive infinite scrolling
 * without scroll listeners. Re-subscribes when `enabled`/`onIntersect` change,
 * so the caller guards against duplicate loads (e.g. via an `isFetching` flag).
 */
export function useIntersectionObserver<TElement extends HTMLElement = HTMLDivElement>({
  onIntersect,
  enabled = true,
  rootMargin = '200px',
  threshold = 0,
}: UseIntersectionObserverOptions) {
  const ref = useRef<TElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onIntersect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onIntersect, rootMargin, threshold]);

  return ref;
}
