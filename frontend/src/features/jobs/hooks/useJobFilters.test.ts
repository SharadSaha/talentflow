import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { JOBS_PAGE_SIZE, useJobFilters } from '@/features/jobs/hooks/useJobFilters';

function wrapper({ children }: { children: ReactNode }) {
  return createElement(MemoryRouter, { initialEntries: ['/candidate/jobs'] }, children);
}

function renderJobFilters() {
  return renderHook(() => useJobFilters(), { wrapper });
}

describe('useJobFilters', () => {
  it('derives default query params', () => {
    const { result } = renderJobFilters();
    expect(result.current.params).toMatchObject({
      page: 1,
      limit: JOBS_PAGE_SIZE,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('applies a filter, parses it into params, and counts it', () => {
    const { result } = renderJobFilters();
    act(() => result.current.setFilter('workMode', 'REMOTE'));

    expect(result.current.params.workMode).toBe('REMOTE');
    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.filters.workMode).toBe('REMOTE');
  });

  it('splits skills CSV into an array', () => {
    const { result } = renderJobFilters();
    act(() => result.current.setFilter('skills', 'react, node'));
    expect(result.current.params.skills).toEqual(['react', 'node']);
  });

  it('resets to page 1 when a filter changes', () => {
    const { result } = renderJobFilters();
    act(() => result.current.setPage(4));
    expect(result.current.params.page).toBe(4);

    act(() => result.current.setFilter('location', 'Berlin'));
    expect(result.current.params.page).toBe(1);
  });

  it('splits the sort string into sortBy/sortOrder and resets the page', () => {
    const { result } = renderJobFilters();
    act(() => result.current.setPage(3));
    act(() => result.current.setSort('salary:asc'));

    expect(result.current.params.sortBy).toBe('salary');
    expect(result.current.params.sortOrder).toBe('asc');
    expect(result.current.params.page).toBe(1);
  });

  it('clears all filters', () => {
    const { result } = renderJobFilters();
    act(() => result.current.setFilter('workMode', 'REMOTE'));
    act(() => result.current.setFilter('company', 'NovaTech'));
    expect(result.current.activeFilterCount).toBe(2);

    act(() => result.current.clearFilters());
    expect(result.current.activeFilterCount).toBe(0);
    expect(result.current.params.workMode).toBeUndefined();
  });

  it('debounces the keyword into the query params', async () => {
    const { result } = renderJobFilters();
    act(() => result.current.setSearch('engineer'));

    // Immediate input value updates synchronously.
    expect(result.current.searchInput).toBe('engineer');

    // The committed keyword param lags behind (debounced).
    await waitFor(() => expect(result.current.params.keyword).toBe('engineer'));
  });
});
