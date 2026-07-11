import { AppShell } from '@/layouts/AppShell';
import { HR_NAV_ITEMS } from '@/layouts/navigation';
import { ROUTES } from '@/constants/routes';

/** Authenticated shell for HR routes: supplies the HR navigation. */
export function HRLayout() {
  return (
    <AppShell
      navItems={HR_NAV_ITEMS}
      profileRoute={ROUTES.HR.PROFILE}
      homeRoute={ROUTES.HR.DASHBOARD}
    />
  );
}
