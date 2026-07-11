import { describe, expect, it } from 'vitest';

import {
  PAGINATION_ELLIPSIS,
  clampPage,
  clampPageSize,
  getEndItem,
  getPageRange,
  getStartItem,
} from '@/utils/pagination';
import type { PaginationMeta } from '@/types/pagination';

function makeMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrevious: false,
    ...overrides,
  };
}

describe('clampPageSize', () => {
  it('clamps values below the minimum up to the minimum', () => {
    expect(clampPageSize(0)).toBe(1);
  });

  it('clamps values above the maximum down to the maximum', () => {
    expect(clampPageSize(500)).toBe(100);
  });

  it('keeps in-range values unchanged', () => {
    expect(clampPageSize(25)).toBe(25);
  });
});

describe('clampPage', () => {
  it('never returns less than 1', () => {
    expect(clampPage(-3, 10)).toBe(1);
  });

  it('caps the page at the total number of pages', () => {
    expect(clampPage(99, 10)).toBe(10);
  });
});

describe('getStartItem / getEndItem', () => {
  it('returns zero start when there are no items', () => {
    expect(getStartItem(makeMeta({ total: 0 }))).toBe(0);
  });

  it('computes the visible range for a middle page', () => {
    const meta = makeMeta({ page: 3, limit: 10, total: 95 });
    expect(getStartItem(meta)).toBe(21);
    expect(getEndItem(meta)).toBe(30);
  });

  it('caps the end item at the total on the last page', () => {
    const meta = makeMeta({ page: 10, limit: 10, total: 95 });
    expect(getEndItem(meta)).toBe(95);
  });
});

describe('getPageRange', () => {
  it('lists every page when the total fits without collapsing', () => {
    expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses both sides with ellipses around the current page', () => {
    expect(getPageRange(5, 10)).toEqual([1, PAGINATION_ELLIPSIS, 4, 5, 6, PAGINATION_ELLIPSIS, 10]);
  });

  it('only collapses the trailing side near the start', () => {
    expect(getPageRange(2, 10)).toEqual([1, 2, 3, PAGINATION_ELLIPSIS, 10]);
  });
});
