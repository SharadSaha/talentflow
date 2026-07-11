import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

interface ModuleSearchTarget {
  /** Where a query lands (the current module's primary searchable list). */
  path: string;
  /** Extra query params to preserve (e.g. the selected applicants job). */
  extraParams: Record<string, string>;
  /** Context-aware placeholder. */
  placeholder: string;
}

/** Maps the current route to the module's searchable list + placeholder. */
function resolveTarget(pathname: string, params: URLSearchParams): ModuleSearchTarget {
  if (pathname.startsWith(ROUTES.HR.APPLICANTS)) {
    const job = params.get('job');
    return {
      path: ROUTES.HR.APPLICANTS,
      extraParams: job ? { job } : {},
      placeholder: 'Search applicants…',
    };
  }
  if (pathname.startsWith(ROUTES.HR.ROOT)) {
    return { path: ROUTES.HR.JOBS, extraParams: {}, placeholder: 'Search jobs…' };
  }
  return { path: ROUTES.CANDIDATE.JOBS, extraParams: {}, placeholder: 'Search jobs…' };
}

interface UseModuleSearchResult {
  placeholder: string;
  /** Runs a search within the current module (debounced by the caller). */
  search: (query: string) => void;
}

/**
 * Powers the top-bar quick search. It routes a query into the current module's
 * primary list using the existing URL-driven `keyword` filter — so results and
 * pagination reuse the feature APIs already in place, and the same mechanism can
 * later back a global command palette.
 */
export function useModuleSearch(): UseModuleSearchResult {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const target = useMemo(() => resolveTarget(pathname, params), [pathname, params]);

  const search = useCallback(
    (query: string) => {
      const next = new URLSearchParams(target.extraParams);
      const trimmed = query.trim();
      if (trimmed) next.set('keyword', trimmed);
      const queryString = next.toString();
      navigate(queryString ? `${target.path}?${queryString}` : target.path);
    },
    [navigate, target],
  );

  return { placeholder: target.placeholder, search };
}
