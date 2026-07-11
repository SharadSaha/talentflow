import { AppShell } from '@/layouts/AppShell';

/**
 * Authenticated shell for candidate routes. The shell derives its navigation
 * from the authenticated role, so this is a thin, role-scoped route element.
 */
export function CandidateLayout() {
  return <AppShell />;
}
