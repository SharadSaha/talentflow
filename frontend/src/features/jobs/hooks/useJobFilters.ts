import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useDebounce } from '@/hooks/useDebounce';
import {
  DEFAULT_JOB_SORT,
  EMPLOYMENT_TYPE,
  EXPERIENCE_LEVEL,
  WORK_MODE,
  type EmploymentType,
  type ExperienceLevel,
  type WorkMode,
} from '@/constants/job';
import type { JobListParams } from '@/types/job';
import type { SortOrder } from '@/types/pagination';

/** Results per page requested from the browse-jobs endpoint. */
export const JOBS_PAGE_SIZE = 12;

/** Delay before a keyword keystroke is committed to the URL. */
const SEARCH_DEBOUNCE_MS = 400;

/** URL param keys that count as filters (keyword and sort are tracked separately). */
const FILTER_KEYS = [
  'location',
  'employmentType',
  'experienceLevel',
  'workMode',
  'salaryMin',
  'salaryMax',
  'skills',
  'company',
] as const;

/** A filter field identifier (also the URL param name). */
export type JobFilterKey = (typeof FILTER_KEYS)[number];

/** Current filter values as strings, ready to bind to inputs (skills is a CSV string). */
export type JobFilterValues = Record<JobFilterKey, string>;

/** Everything the browse page needs to drive URL-synced search, filters, and sort. */
export interface UseJobFiltersResult {
  /** Derived params for `useGetJobsQuery` (empty values omitted, sort split, numbers parsed). */
  params: JobListParams;
  /** Current filter values (string-backed for form controls). */
  filters: JobFilterValues;
  /** Current `field:order` sort string. */
  sort: string;
  /** Current 1-based page. */
  page: number;
  /** Immediate keyword input value (debounced into the URL). */
  searchInput: string;
  /** Number of active (non-empty) filters, excluding keyword and sort. */
  activeFilterCount: number;
  /** Sets a single filter and resets to page 1. */
  setFilter: (key: JobFilterKey, value: string) => void;
  /** Sets the sort order and resets to page 1. */
  setSort: (sort: string) => void;
  /** Navigates to a page. */
  setPage: (page: number) => void;
  /** Updates the immediate keyword input (committed to the URL after a debounce). */
  setSearch: (value: string) => void;
  /** Clears all filters (keeps keyword and sort) and resets to page 1. */
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
const WORK_MODES = Object.values(WORK_MODE) as WorkMode[];

/**
 * Reads and writes browse-jobs state from the URL query string so search,
 * filters, sort, and pagination survive refresh and are shareable. Any filter,
 * search, or sort change resets the page to 1; the keyword input is debounced.
 */
export function useJobFilters(): UseJobFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') ?? '';
  const sort = searchParams.get('sort') ?? DEFAULT_JOB_SORT;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const filters = useMemo<JobFilterValues>(
    () => ({
      location: searchParams.get('location') ?? '',
      employmentType: searchParams.get('employmentType') ?? '',
      experienceLevel: searchParams.get('experienceLevel') ?? '',
      workMode: searchParams.get('workMode') ?? '',
      salaryMin: searchParams.get('salaryMin') ?? '',
      salaryMax: searchParams.get('salaryMax') ?? '',
      skills: searchParams.get('skills') ?? '',
      company: searchParams.get('company') ?? '',
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
    (key: JobFilterKey, value: string) => setParam(key, value, true),
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
        FILTER_KEYS.forEach((key) => next.delete(key));
        next.delete('page');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const activeFilterCount = useMemo(
    () => FILTER_KEYS.reduce((count, key) => (filters[key] ? count + 1 : count), 0),
    [filters],
  );

  const params = useMemo<JobListParams>(() => {
    const [sortBy, order] = sort.split(':');
    const sortOrder: SortOrder = order === 'asc' ? 'asc' : 'desc';

    const next: JobListParams = {
      page,
      limit: JOBS_PAGE_SIZE,
      sortBy,
      sortOrder,
    };

    if (keyword) next.keyword = keyword;
    if (filters.location) next.location = filters.location;
    if (filters.company) next.company = filters.company;

    const employmentType = asEnumValue(filters.employmentType, EMPLOYMENT_TYPES);
    if (employmentType) next.employmentType = employmentType;

    const experienceLevel = asEnumValue(filters.experienceLevel, EXPERIENCE_LEVELS);
    if (experienceLevel) next.experienceLevel = experienceLevel;

    const workMode = asEnumValue(filters.workMode, WORK_MODES);
    if (workMode) next.workMode = workMode;

    const salaryMin = parseNumber(filters.salaryMin);
    if (salaryMin !== undefined) next.salaryMin = salaryMin;

    const salaryMax = parseNumber(filters.salaryMax);
    if (salaryMax !== undefined) next.salaryMax = salaryMax;

    const skills = filters.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    if (skills.length > 0) next.skills = skills;

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
