import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface UseCountUpOptions {
  /** Target value to count up to. */
  target: number;
  /** Duration of the animation in milliseconds. */
  durationMs?: number;
}

interface UseCountUpResult {
  /** Ref to attach to the element whose visibility triggers the count. */
  ref: React.RefObject<HTMLSpanElement | null>;
  /** The current animated value. */
  value: number;
}

/**
 * Counts a number from zero up to `target` once the element scrolls into view,
 * using an eased time-based animation. Respects `prefers-reduced-motion` by
 * jumping straight to the target.
 */
export function useCountUp({ target, durationMs = 1600 }: UseCountUpOptions): UseCountUpResult {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Scheduling via rAF (rather than a synchronous setState) keeps the effect
    // free of cascading renders while still landing on the target immediately.
    if (prefersReducedMotion) {
      const reducedFrameId = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(reducedFrameId);
    }

    let frameId: number;
    let startTime: number | null = null;

    const tick = (timestamp: number): void => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // easeOutCubic for a natural deceleration.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, prefersReducedMotion, target, durationMs]);

  return { ref, value };
}
