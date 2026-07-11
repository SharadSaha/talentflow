import {
  Briefcase,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Search,
  Settings,
  UserCircle,
  Users,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';
import { USER_ROLE, type UserRole } from '@/constants/roles';

/**
 * Navigation is driven by configuration rather than hardcoded JSX. Each role has
 * its own `NavigationConfig`; the sidebar renders whichever config matches the
 * authenticated user, so a candidate never sees HR navigation (and vice versa),
 * and new routes/groups are added by editing config alone.
 */

/** A single navigation destination. */
export interface NavigationItem {
  /** Stable identity (also the React key and command-palette id). */
  key: string;
  title: string;
  to: string;
  icon: LucideIcon;
  /** Optional supporting copy (shown in collapsed tooltips). */
  description?: string;
  /** Match the path exactly (no nested/child highlighting). */
  end?: boolean;
  /** Non-interactive placeholder (rendered dimmed, not navigable). */
  disabled?: boolean;
  /** Marks an upcoming feature — renders a subtle badge, still navigable. */
  comingSoon?: boolean;
  /** Static badge label/count (dynamic counts can be layered on later). */
  badge?: string | number;
  /** A small unread/notification indicator. */
  dot?: boolean;
}

/** A labelled group of navigation items (e.g. "Menu", "Account"). */
export interface NavigationGroup {
  id: string;
  label?: string;
  items: NavigationItem[];
}

/** The full navigation surface for a role. */
export interface NavigationConfig {
  /** Short workspace name shown under the logo. */
  workspaceLabel: string;
  /** Brand/logo link + post-login home. */
  homeRoute: string;
  /** Destination for the "View profile" account action. */
  profileRoute: string;
  /** Destination for the "Settings" account action. */
  settingsRoute: string;
  groups: NavigationGroup[];
}

const CANDIDATE_NAVIGATION: NavigationConfig = {
  workspaceLabel: 'Candidate workspace',
  homeRoute: ROUTES.CANDIDATE.DASHBOARD,
  profileRoute: ROUTES.CANDIDATE.PROFILE,
  settingsRoute: ROUTES.CANDIDATE.SETTINGS,
  groups: [
    {
      id: 'main',
      label: 'Menu',
      items: [
        {
          key: 'candidate-dashboard',
          title: 'Career Hub',
          to: ROUTES.CANDIDATE.DASHBOARD,
          icon: LayoutDashboard,
          description: 'Your activity at a glance',
          end: true,
        },
        {
          key: 'candidate-jobs',
          title: 'Browse Jobs',
          to: ROUTES.CANDIDATE.JOBS,
          icon: Search,
          description: 'Find and apply to roles',
        },
        {
          key: 'candidate-applications',
          title: 'My Applications',
          to: ROUTES.CANDIDATE.APPLICATIONS,
          icon: FileText,
          description: 'Track your applications',
        },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        {
          key: 'candidate-profile',
          title: 'Profile',
          to: ROUTES.CANDIDATE.PROFILE,
          icon: UserCircle,
          description: 'Manage your profile',
        },
        {
          key: 'candidate-settings',
          title: 'Settings',
          to: ROUTES.CANDIDATE.SETTINGS,
          icon: Settings,
          description: 'Preferences',
        },
      ],
    },
  ],
};

const HR_NAVIGATION: NavigationConfig = {
  workspaceLabel: 'Employer workspace',
  homeRoute: ROUTES.HR.DASHBOARD,
  profileRoute: ROUTES.HR.PROFILE,
  settingsRoute: ROUTES.HR.SETTINGS,
  groups: [
    {
      id: 'main',
      label: 'Menu',
      items: [
        {
          key: 'hr-dashboard',
          title: 'Hiring Hub',
          to: ROUTES.HR.DASHBOARD,
          icon: LayoutDashboard,
          description: 'Hiring overview',
          end: true,
        },
        {
          key: 'hr-jobs',
          title: 'Jobs',
          to: ROUTES.HR.JOBS,
          icon: Briefcase,
          description: 'Manage job postings',
        },
        {
          key: 'hr-applicants',
          title: 'Applicants',
          to: ROUTES.HR.APPLICANTS,
          icon: Users,
          description: 'Review candidates',
        },
      ],
    },
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        {
          key: 'hr-profile',
          title: 'Profile',
          to: ROUTES.HR.PROFILE,
          icon: UserCircle,
          description: 'Your account',
        },
        {
          key: 'hr-settings',
          title: 'Settings',
          to: ROUTES.HR.SETTINGS,
          icon: Settings,
          description: 'Workspace preferences',
        },
      ],
    },
  ],
};

const EMPTY_NAVIGATION: NavigationConfig = {
  workspaceLabel: '',
  homeRoute: ROUTES.HOME,
  profileRoute: ROUTES.HOME,
  settingsRoute: ROUTES.HOME,
  groups: [],
};

/** Returns the navigation configuration for the given role. */
export function getNavigationConfig(role: UserRole | null): NavigationConfig {
  if (role === USER_ROLE.HR) return HR_NAVIGATION;
  if (role === USER_ROLE.CANDIDATE) return CANDIDATE_NAVIGATION;
  return EMPTY_NAVIGATION;
}

/** Flattens every item across groups — useful for a future command palette. */
export function getNavigationItems(config: NavigationConfig): NavigationItem[] {
  return config.groups.flatMap((group) => group.items);
}
