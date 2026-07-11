/**
 * Async and timing utilities.
 */

/** A debounced function that also exposes a `cancel` method. */
export interface DebouncedFunction<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
}

/**
 * Returns a debounced version of `callback` that delays invocation until
 * `delayMs` has elapsed since the last call. Useful for search inputs and
 * resize handlers.
 */
export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number,
): DebouncedFunction<TArgs> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: TArgs): void => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delayMs);
  };

  debounced.cancel = (): void => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return debounced;
}

/** Resolves after `ms` milliseconds. Handy for artificial delays in demos/tests. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
