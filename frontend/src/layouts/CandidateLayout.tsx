import { AppShell } from '@/layouts/AppShell';
import { CANDIDATE_NAV_ITEMS } from '@/layouts/navigation';
import { ROUTES } from '@/constants/routes';

/** Authenticated shell for candidate routes: supplies the candidate navigation. */
export function CandidateLayout() {
  return (
    <AppShell
      navItems={CANDIDATE_NAV_ITEMS}
      profileRoute={ROUTES.CANDIDATE.PROFILE}
      homeRoute={ROUTES.CANDIDATE.DASHBOARD}
    />
  );
}
