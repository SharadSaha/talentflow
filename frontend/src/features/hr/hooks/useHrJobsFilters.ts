import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  DEFAULT_JOB_SORT,
  EMPLOYMENT_TYPE,
  EXPERIENCE_LEVEL,
  type EmploymentType,
  type ExperienceLevel,
} from '@/constants/job';
import { JOB_STATUS, type JobStatus } from '@/constants/job-status';
import type { HrJobsParams } from '@/features/hr/types/hr-job.types';
import { useDebounce } from '@/hooks/useDebounce';
import type { SortOrder } from '@/types/pagination';

/** Results per page requested from the HR jobs endpoint. */
export const HR_JOBS_PAGE_SIZE = 10;

/** Delay before a keyword keystroke is committed to the URL. */
const SEARCH_DEBOUNCE_MS = 400;

/** URL param keys that live inside the Filters panel (keyword, status, and sort are tracked separately). */
const PANEL_FILTER_KEYS = [
  'location',
  'employmentType',
  'experienceLevel',
  'salaryMin',
  'salaryMax',
] as const;

/** A filter field identifier (also the URL param name). `status` is a top-level control. */
export type HrJobFilterKey = (typeof PANEL_FILTER_KEYS)[number] | 'status';

/** Current filter values as strings, ready to bind to inputs. */
export type HrJobFilterValues = Record<HrJobFilterKey, string>;

/** Everything the jobs management page needs to drive URL-synced search, filters, and sort. */
export interface UseHrJobsFiltersResult {
  /** Derived params for `useGetHrJobsQuery` (empty values omitted, sort split, numbers parsed). */
  params: HrJobsParams;
  /** Current filter values (string-backed for form controls). */
  filters: HrJobFilterValues;
  /** Current `field:order` sort string. */
  sort: string;
  /** Current 1-based page. */
  page: number;
  /** Immediate keyword input value (debounced into the URL). */
  searchInput: string;
  /** Number of active (non-empty) panel filters, excluding keyword, status, and sort. */
  activeFilterCount: number;
  /** Sets a single filter and resets to page 1. */
  setFilter: (key: HrJobFilterKey, value: string) => void;
  /** Sets the sort order and resets to page 1. */
  setSort: (sort: string) => void;
  /** Navigates to a page. */
  setPage: (page: number) => void;
  /** Updates the immediate keyword input (committed to the URL after a debounce). */
  setSearch: (value: string) => void;
  /** Clears the panel filters (keeps keyword, status, and sort) and resets to page 1. */
  clearFilters: () => void;
}

/** Parses a numeric string, returning undefined for empty or invalid values. */
function parseNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Narrows an arbitrary string to a known enum value, or undefined if unrecognised. */
function asEnumValue<TValue extends string>(
  value: string,
  allowed: readonly TValue[],
): TValue | undefined {
  return (allowed as readonly string[]).includes(value) ? (value as TValue) : undefined;
}

const EMPLOYMENT_TYPES = Object.values(EMPLOYMENT_TYPE) as EmploymentType[];
const EXPERIENCE_LEVELS = Object.values(EXPERIENCE_LEVEL) as ExperienceLevel[];
const JOB_STATUSES = Object.values(JOB_STATUS) as JobStatus[];

/**
 * Reads and writes HR jobs-list state from the URL query string so search,
 * status, filters, sort, and pagination survive refresh and are shareable. Any
 * filter, search, status, or sort change resets the page to 1; the keyword input
 * is debounced.
 */
export function useHrJobsFilters(): UseHrJobsFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') ?? '';
  const sort = searchParams.get('sort') ?? DEFAULT_JOB_SORT;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const filters = useMemo<HrJobFilterValues>(
    () => ({
      status: searchParams.get('status') ?? '',
      location: searchParams.get('location') ?? '',
      employmentType: searchParams.get('employmentType') ?? '',
      experienceLevel: searchParams.get('experienceLevel') ?? '',
      salaryMin: searchParams.get('salaryMin') ?? '',
      salaryMax: searchParams.get('salaryMax') ?? '',
    }),
    [searchParams],
  );

  // The keyword input responds immediately while its committed value is debounced.
  const [searchInput, setSearchInput] = useState(keyword);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  const setParam = useCallback(
    (key: string, value: string, resetPage: boolean) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Commit the debounced keyword into the URL, resetting pagination.
  useEffect(() => {
    if (debouncedSearch === keyword) return;
    setParam('keyword', debouncedSearch, true);
  }, [debouncedSearch, keyword, setParam]);

  const setFilter = useCallback(
    (key: HrJobFilterKey, value: string) => setParam(key, value, true),
    [setParam],
  );

  const setSort = useCallback(
    (value: string) => setParam('sort', value === DEFAULT_JOB_SORT ? '' : value, true),
    [setParam],
  );

  const setPage = useCallback(
    (nextPage: number) => setParam('page', nextPage > 1 ? String(nextPage) : '', false),
    [setParam],
  );

  const setSearch = useCallback((value: string) => setSearchInput(value), []);

  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        PANEL_FILTER_KEYS.forEach((key) => next.delete(key));
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const activeFilterCount = useMemo(
    () => PANEL_FILTER_KEYS.reduce((count, key) => (filters[key] ? count + 1 : count), 0),
    [filters],
  );

  const params = useMemo<HrJobsParams>(() => {
    const [sortBy, order] = sort.split(':');
    const sortOrder: SortOrder = order === 'asc' ? 'asc' : 'desc';

    const next: HrJobsParams = {
      page,
      limit: HR_JOBS_PAGE_SIZE,
      sortBy,
      sortOrder,
    };

    if (keyword) next.keyword = keyword;
    if (filters.location) next.location = filters.location;

    const status = asEnumValue(filters.status, JOB_STATUSES);
    if (status) next.status = status;

    const employmentType = asEnumValue(filters.employmentType, EMPLOYMENT_TYPES);
    if (employmentType) next.employmentType = employmentType;

    const experienceLevel = asEnumValue(filters.experienceLevel, EXPERIENCE_LEVELS);
    if (experienceLevel) next.experienceLevel = experienceLevel;

    const salaryMin = parseNumber(filters.salaryMin);
    if (salaryMin !== undefined) next.salaryMin = salaryMin;

    const salaryMax = parseNumber(filters.salaryMax);
    if (salaryMax !== undefined) next.salaryMax = salaryMax;

    return next;
  }, [sort, page, keyword, filters]);

  return {
    params,
    filters,
    sort,
    page,
    searchInput,
    activeFilterCount,
    setFilter,
    setSort,
    setPage,
    setSearch,
    clearFilters,
  };
}
