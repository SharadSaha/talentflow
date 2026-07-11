import { MAX_PAGE_SIZE, MIN_PAGE_SIZE } from '@/constants/pagination';
import type { PaginationMeta } from '@/types/pagination';

/**
 * Pagination helpers shared by list views. Pure functions — no side effects.
 */

/** Clamps a requested page size to the allowed bounds. */
export function clampPageSize(pageSize: number): number {
  return Math.min(Math.max(Math.trunc(pageSize), MIN_PAGE_SIZE), MAX_PAGE_SIZE);
}

/** Clamps a requested page to at least 1, capped at the known total pages. */
export function clampPage(page: number, totalPages: number): number {
  const upperBound = Math.max(totalPages, 1);
  return Math.min(Math.max(Math.trunc(page), 1), upperBound);
}

/** The 1-based index of the first item shown on the given page. */
export function getStartItem(meta: PaginationMeta): number {
  if (meta.total === 0) return 0;
  return (meta.page - 1) * meta.limit + 1;
}

/** The 1-based index of the last item shown on the given page. */
export function getEndItem(meta: PaginationMeta): number {
  return Math.min(meta.page * meta.limit, meta.total);
}

/** An ellipsis marker used between non-contiguous page ranges. */
export const PAGINATION_ELLIPSIS = 'ellipsis' as const;

export type PaginationItem = number | typeof PAGINATION_ELLIPSIS;

/**
 * Builds a compact page range for pagination controls, collapsing large gaps
 * with ellipses. `siblingCount` controls how many pages surround the current
 * page. Example (current 5 of 10): [1, ellipsis, 4, 5, 6, ellipsis, 10].
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PaginationItem[] {
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const range: PaginationItem[] = [1];
  if (showLeftEllipsis) range.push(PAGINATION_ELLIPSIS);

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    if (page !== 1 && page !== totalPages) range.push(page);
  }

  if (showRightEllipsis) range.push(PAGINATION_ELLIPSIS);
  range.push(totalPages);

  return range;
}
