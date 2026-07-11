import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDisclosure } from '@/hooks/useDisclosure';

describe('useDisclosure', () => {
  it('is closed by default', () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
  });

  it('respects an initial open state', () => {
    const { result } = renderHook(() => useDisclosure(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('opens via open()', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('closes via close()', () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('flips the state via toggle()', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('sets the state explicitly via setOpen()', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.setOpen(true));
    expect(result.current.isOpen).toBe(true);
  });
});
