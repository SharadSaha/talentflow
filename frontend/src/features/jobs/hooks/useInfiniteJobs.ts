import { useCallback, useMemo, useState } from 'react';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useGetJobsQuery } from '@/features/jobs/api/jobsApi';
import { useJobFilters, type UseJobFiltersResult } from '@/features/jobs/hooks/useJobFilters';
import type { Job } from '@/types/job';

export interface UseInfiniteJobsResult extends UseJobFiltersResult {
  /** Accumulated jobs across every loaded page. */
  items: Job[];
  /** Total matches reported by the server. */
  total: number;
  /** Whether another page exists. */
  hasMore: boolean;
  /** Initial load (no data for the current filters yet). */
  isLoading: boolean;
  /** Fetching a subsequent page (append), not the first page. */
  isFetchingNextPage: boolean;
  isError: boolean;
  refetch: () => void;
  /** Attach to a sentinel element at the end of the list to auto-load more. */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Drives the infinite browse list: reuses {@link useJobFilters} for URL-synced
 * search/filter/sort, accumulates pages via the RTK Query `merge` cache, and
 * exposes a sentinel ref that loads the next page when it scrolls into view.
 * Changing any filter resets to page 1 (derived synchronously so no stale page
 * is ever requested).
 */
export function useInfiniteJobs(): UseInfiniteJobsResult {
  const filters = useJobFilters();
  const [page, setPage] = useState(1);

  // Reset to page 1 the moment the filter/sort/keyword signature changes. Using
  // the "adjust state during render from previous props" pattern (React docs) so
  // the reset happens before the query effect fires — no stale page is fetched.
  const filtersKey = useMemo(() => JSON.stringify(filters.params), [filters.params]);
  const [previousFiltersKey, setPreviousFiltersKey] = useState(filtersKey);
  if (previousFiltersKey !== filtersKey) {
    setPreviousFiltersKey(filtersKey);
    setPage(1);
  }

  const queryArgs = useMemo(() => ({ ...filters.params, page }), [filters.params, page]);
  const { data, isLoading, isFetching, isError, refetch } = useGetJobsQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;
  const hasMore = page < totalPages;
  const isFetchingNextPage = isFetching && !isLoading && page > 1;

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((current) => current + 1);
    }
  }, [isFetching, hasMore]);

  const sentinelRef = useIntersectionObserver<HTMLDivElement>({
    onIntersect: loadMore,
    enabled: hasMore && !isFetching,
  });

  return {
    ...filters,
    items,
    total,
    hasMore,
    isLoading,
    isFetchingNextPage,
    isError,
    refetch: () => void refetch(),
    sentinelRef,
  };
}
