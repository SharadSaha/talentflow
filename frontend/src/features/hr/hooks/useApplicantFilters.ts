import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { APPLICATION_STATUS, type ApplicationStatus } from '@/constants/application-status';
import { EDUCATION_LEVEL, type EducationLevel } from '@/constants/education';
import { useDebounce } from '@/hooks/useDebounce';
import type { ApplicantsQueryParams } from '@/types/applicant';
import type { SortOrder } from '@/types/pagination';

/** Applicants requested per page from the job-applicants endpoint. */
export const APPLICANTS_PAGE_SIZE = 10;

/** Delay before a keyword keystroke is committed to the URL. */
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Friendly sort options mapped to the backend `field:order` contract, where
 * `field` ∈ `createdAt | updatedAt | status | experience`.
 */
export const APPLICANT_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'createdAt:desc', label: 'Newest applied' },
  { value: 'createdAt:asc', label: 'Oldest applied' },
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'status:asc', label: 'Status' },
  { value: 'experience:desc', label: 'Most experience' },
  { value: 'experience:asc', label: 'Least experience' },
];

/** Default sort applied when the URL does not specify one. */
export const DEFAULT_APPLICANT_SORT = 'createdAt:desc';

/** URL param keys that count as applicant filters (keyword and sort are tracked separately). */
const FILTER_KEYS = [
  'status',
  'currentLocation',
  'currentCompany',
  'highestEducation',
  'skills',
  'minExperienceMonths',
  'maxExperienceMonths',
] as const;

/** A filter field identifier (also the URL param name). */
export type ApplicantFilterKey = (typeof FILTER_KEYS)[number];

/** Current filter values as strings, ready to bind to inputs (skills is a CSV string). */
export type ApplicantFilterValues = Record<ApplicantFilterKey, string>;

/** Everything the applicants board needs to drive URL-synced search, filters, and sort. */
export interface UseApplicantFiltersResult {
  /** Derived filter/sort/paging params (job-agnostic; the caller adds `jobId` when needed). */
  params: ApplicantsQueryParams;
  /** Current filter values (string-backed for form controls). */
  filters: ApplicantFilterValues;
  /** Current `field:order` sort string. */
  sort: string;
  /** Current 1-based page. */
  page: number;
  /** Immediate keyword input value (debounced into the URL). */
  searchInput: string;
  /** Number of active (non-empty) filters, excluding keyword and sort. */
  activeFilterCount: number;
  /** Sets a single filter and resets to page 1. */
  setFilter: (key: ApplicantFilterKey, value: string) => void;
  /** Sets the sort order and resets to page 1. */
  setSort: (sort: string) => void;
  /** Navigates to a page. */
  setPage: (page: number) => void;
  /** Updates the immediate keyword input (committed to the URL after a debounce). */
  setSearch: (value: string) => void;
  /** Clears all filters (keeps keyword and sort) and resets to page 1. */
  clearFilters: () => void;
}

const APPLICATION_STATUSES = Object.values(APPLICATION_STATUS) as ApplicationStatus[];
const EDUCATION_LEVELS = Object.values(EDUCATION_LEVEL) as EducationLevel[];

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

/**
 * Reads and writes the applicant board's state from the URL query string so
 * search, filters, sort, and pagination survive refresh and are shareable. Any
 * filter, search, or sort change resets the page to 1; the keyword input is
 * debounced. `selectionKey` identifies the current job selection (a job id or
 * the "All Jobs" sentinel) purely so switching selections clears the keyword.
 */
export function useApplicantFilters(selectionKey: string): UseApplicantFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') ?? '';
  const sort = searchParams.get('sort') ?? DEFAULT_APPLICANT_SORT;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const filters = useMemo<ApplicantFilterValues>(
    () => ({
      status: searchParams.get('status') ?? '',
      currentLocation: searchParams.get('currentLocation') ?? '',
      currentCompany: searchParams.get('currentCompany') ?? '',
      highestEducation: searchParams.get('highestEducation') ?? '',
      skills: searchParams.get('skills') ?? '',
      minExperienceMonths: searchParams.get('minExperienceMonths') ?? '',
      maxExperienceMonths: searchParams.get('maxExperienceMonths') ?? '',
    }),
    [searchParams],
  );

  // The keyword input responds immediately while its committed value is debounced.
  const [searchInput, setSearchInput] = useState(keyword);
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_MS);

  // Switching the selected job clears the board's filters (and the keyword) —
  // reset the immediate input so a stale keystroke isn't re-committed.
  const previousSelection = useRef(selectionKey);
  useEffect(() => {
    if (previousSelection.current !== selectionKey) {
      previousSelection.current = selectionKey;
      setSearchInput('');
    }
  }, [selectionKey]);

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
    (key: ApplicantFilterKey, value: string) => setParam(key, value, true),
    [setParam],
  );

  const setSort = useCallback(
    (value: string) => setParam('sort', value === DEFAULT_APPLICANT_SORT ? '' : value, true),
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

  const params = useMemo<ApplicantsQueryParams>(() => {
    const [sortBy, order] = sort.split(':');
    const sortOrder: SortOrder = order === 'asc' ? 'asc' : 'desc';

    const next: ApplicantsQueryParams = {
      page,
      limit: APPLICANTS_PAGE_SIZE,
      sortBy,
      sortOrder,
    };

    if (keyword) next.keyword = keyword;
    if (filters.currentLocation) next.currentLocation = filters.currentLocation;
    if (filters.currentCompany) next.currentCompany = filters.currentCompany;

    const status = asEnumValue(filters.status, APPLICATION_STATUSES);
    if (status) next.status = status;

    const highestEducation = asEnumValue(filters.highestEducation, EDUCATION_LEVELS);
    if (highestEducation) next.highestEducation = highestEducation;

    const minExperienceMonths = parseNumber(filters.minExperienceMonths);
    if (minExperienceMonths !== undefined) next.minExperienceMonths = minExperienceMonths;

    const maxExperienceMonths = parseNumber(filters.maxExperienceMonths);
    if (maxExperienceMonths !== undefined) next.maxExperienceMonths = maxExperienceMonths;

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
