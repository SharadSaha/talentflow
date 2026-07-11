import { useCallback, useMemo, useState } from 'react';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants/pagination';
import { clampPageSize } from '@/utils/pagination';

export interface PaginationControls {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

/**
 * Local pagination state for list views. Pagination is transient UI state, so
 * it stays in React rather than Redux; RTK Query requests the corresponding
 * page. Changing the page size resets to the first page to avoid empty pages.
 */
export function usePagination(options: UsePaginationOptions = {}): PaginationControls {
  const { initialPage = DEFAULT_PAGE, initialPageSize = DEFAULT_PAGE_SIZE } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(() => clampPageSize(initialPageSize));

  const setPage = useCallback((next: number) => setPageState(Math.max(next, 1)), []);

  const setPageSize = useCallback((next: number) => {
    setPageSizeState(clampPageSize(next));
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => setPageState((current) => current + 1), []);
  const previousPage = useCallback(() => setPageState((current) => Math.max(current - 1, 1)), []);
  const reset = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(clampPageSize(initialPageSize));
  }, [initialPage, initialPageSize]);

  return useMemo(
    () => ({ page, pageSize, setPage, setPageSize, nextPage, previousPage, reset }),
    [page, pageSize, setPage, setPageSize, nextPage, previousPage, reset],
  );
}
