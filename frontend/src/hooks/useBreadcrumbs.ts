import { useMatches } from 'react-router-dom';

/** Shape of the `handle` a route may attach to describe its breadcrumb. */
export interface RouteHandle {
  title?: string;
}

export interface Breadcrumb {
  label: string;
  to: string;
  isCurrent: boolean;
}

/**
 * Derives the breadcrumb trail from the matched routes' `handle.title`. Routes
 * opt in declaratively (`handle: { title: 'Jobs' }`), so breadcrumbs stay in
 * sync with the route tree without a parallel config.
 */
export function useBreadcrumbs(): Breadcrumb[] {
  const matches = useMatches();

  const titledMatches = matches.filter(
    (match): match is (typeof matches)[number] & { handle: RouteHandle } =>
      Boolean((match.handle as RouteHandle | undefined)?.title),
  );

  return titledMatches.map((match, index) => ({
    label: match.handle.title as string,
    to: match.pathname,
    isCurrent: index === titledMatches.length - 1,
  }));
}
