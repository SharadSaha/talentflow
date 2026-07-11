import { AppShell } from '@/layouts/AppShell';

/**
 * Authenticated shell for HR routes. The shell derives its navigation from the
 * authenticated role, so this is a thin, role-scoped route element.
 */
export function HRLayout() {
  return <AppShell />;
}
