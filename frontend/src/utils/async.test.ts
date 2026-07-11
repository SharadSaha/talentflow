import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { debounce, sleep } from '@/utils/async';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes the callback only after the delay has elapsed', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('collapses rapid successive calls into a single invocation', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('invokes the callback with the arguments of the most recent call', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced('first');
    debounced('second');
    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledWith('second');
  });

  it('does not invoke the callback when cancelled before the delay elapses', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(200);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('sleep', () => {
  it('resolves after the requested number of milliseconds', async () => {
    vi.useFakeTimers();
    const onResolved = vi.fn();

    const pending = sleep(500).then(onResolved);
    expect(onResolved).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);
    await pending;

    expect(onResolved).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
