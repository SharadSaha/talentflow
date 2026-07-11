import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { usePagination } from '@/hooks/usePagination';

describe('usePagination', () => {
  it('starts on the default page and page size', () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.page).toBe(DEFAULT_PAGE);
    expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
  });

  it('honours provided initial options', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 3, initialPageSize: 20 }));
    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(20);
  });

  it('clamps an out-of-range initial page size', () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 500 }));
    expect(result.current.pageSize).toBe(100);
  });

  it('advances to the next page', () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(2);
  });

  it('never goes below the first page when moving backwards', () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.previousPage());
    expect(result.current.page).toBe(1);
  });

  it('never sets a page below one via setPage', () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setPage(-5));
    expect(result.current.page).toBe(1);
  });

  it('resets to the first page when the page size changes', () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setPage(4));
    act(() => result.current.setPageSize(50));
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(50);
  });

  it('restores the initial page and size on reset', () => {
    const { result } = renderHook(() => usePagination({ initialPage: 2, initialPageSize: 20 }));
    act(() => result.current.setPage(6));
    act(() => result.current.setPageSize(50));
    act(() => result.current.reset());
    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(20);
  });
});
