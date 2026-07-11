import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useActiveRoute } from '@/hooks/useActiveRoute';

function wrapperFor(path: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, { initialEntries: [path] }, children);
  };
}

describe('useActiveRoute', () => {
  it('matches the exact path', () => {
    const { result } = renderHook(() => useActiveRoute('/hr/jobs'), {
      wrapper: wrapperFor('/hr/jobs'),
    });
    expect(result.current).toBe(true);
  });

  it('matches nested/child routes by default', () => {
    const { result } = renderHook(() => useActiveRoute('/hr/jobs'), {
      wrapper: wrapperFor('/hr/jobs/123/edit'),
    });
    expect(result.current).toBe(true);
  });

  it('does not treat a sibling prefix as active', () => {
    const { result } = renderHook(() => useActiveRoute('/candidate/applications'), {
      wrapper: wrapperFor('/candidate/dashboard'),
    });
    expect(result.current).toBe(false);
  });

  it('honours exact matching when `end` is set', () => {
    const { result } = renderHook(() => useActiveRoute('/hr/dashboard', true), {
      wrapper: wrapperFor('/hr/dashboard/anything'),
    });
    expect(result.current).toBe(false);
  });
});
