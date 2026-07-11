import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  UserCircle,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE, type UserRole } from '@/constants/roles';

/** A single primary navigation entry for the app sidebar. */
export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Role-specific primary navigation. Each authenticated layout renders the menu
 * for its role, so the sidebar adapts automatically after login. Feature
 * modules extend these lists as they are added.
 */
export const CANDIDATE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.CANDIDATE.DASHBOARD, icon: LayoutDashboard },
  { label: 'Browse Jobs', to: ROUTES.CANDIDATE.JOBS, icon: Search },
  { label: 'Applied Jobs', to: ROUTES.CANDIDATE.APPLICATIONS, icon: FileText },
  { label: 'Profile', to: ROUTES.CANDIDATE.PROFILE, icon: UserCircle },
  { label: 'Settings', to: ROUTES.CANDIDATE.SETTINGS, icon: Settings },
];

export const HR_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: ROUTES.HR.DASHBOARD, icon: LayoutDashboard },
  { label: 'Jobs', to: ROUTES.HR.JOBS, icon: Briefcase },
  { label: 'Applicants', to: ROUTES.HR.APPLICANTS, icon: Users },
  { label: 'Profile', to: ROUTES.HR.PROFILE, icon: UserCircle },
];

/** Returns the navigation menu for the given role. */
export function getNavItemsForRole(role: UserRole | null): NavItem[] {
  if (role === USER_ROLE.HR) return HR_NAV_ITEMS;
  if (role === USER_ROLE.CANDIDATE) return CANDIDATE_NAV_ITEMS;
  return [];
}
