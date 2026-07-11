import { FileText, LayoutDashboard, Briefcase, UserCircle } from 'lucide-react';
import type { ComponentType } from 'react';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE, type UserRole } from '@/constants/roles';

/** A single primary navigation entry for the app sidebar. */
export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  /** Roles allowed to see this item; omit for all authenticated users. */
  roles?: UserRole[];
}

/**
 * Primary navigation for the authenticated app shell. Role-scoped items are
 * filtered per user by `getNavItemsForRole`. Feature modules extend this list
 * as they are added.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Jobs', to: ROUTES.JOBS, icon: Briefcase },
  {
    label: 'Applications',
    to: ROUTES.APPLICATIONS,
    icon: FileText,
    roles: [USER_ROLE.CANDIDATE],
  },
  { label: 'Profile', to: ROUTES.PROFILE, icon: UserCircle, roles: [USER_ROLE.CANDIDATE] },
];

/** Returns the nav items visible to the given role (or all common items). */
export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  return PRIMARY_NAV_ITEMS.filter(
    (item) => !item.roles || (role !== null && item.roles.includes(role)),
  );
}
