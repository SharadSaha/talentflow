import { useLocation } from 'react-router-dom';

/**
 * Whether a navigation destination is active for the current location.
 *
 * With `end`, the path must match exactly. Otherwise a parent route is active
 * for its nested/child routes too (e.g. `/hr/jobs` is active on `/hr/jobs/new`
 * and `/hr/jobs/:id/edit`), which keeps highlighting correct on deep links and
 * refreshes.
 */
export function useActiveRoute(to: string, end = false): boolean {
  const { pathname } = useLocation();
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}
