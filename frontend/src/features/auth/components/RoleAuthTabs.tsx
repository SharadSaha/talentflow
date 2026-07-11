import { motion, useReducedMotion } from 'framer-motion';
import { Building2, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

type AuthRole = 'candidate' | 'hr';
type AuthMode = 'login' | 'register';

interface RoleAuthTabsProps {
  /** The role authenticated on the current page. */
  active: AuthRole;
  /** Whether the surrounding pages are sign-in or registration flows. */
  mode: AuthMode;
}

interface RoleTab {
  role: AuthRole;
  label: string;
  icon: LucideIcon;
}

const ROLE_TABS: RoleTab[] = [
  { role: 'candidate', label: 'Candidate', icon: UserRound },
  { role: 'hr', label: 'HR', icon: Building2 },
];

/** Destination page for each role within a given mode (sign-in vs registration). */
const DESTINATIONS: Record<AuthMode, Record<AuthRole, string>> = {
  login: { candidate: ROUTES.AUTH.CANDIDATE_LOGIN, hr: ROUTES.AUTH.HR_LOGIN },
  register: { candidate: ROUTES.AUTH.CANDIDATE_REGISTER, hr: ROUTES.AUTH.HR_REGISTER },
};

const ACTIVE_PILL_LAYOUT_ID = 'role-auth-active-pill';

/**
 * Segmented control that switches the authenticated role while preserving the
 * current mode. Selecting the other tab navigates (replacing history) to the
 * matching page, so the URL always reflects the role being authenticated.
 */
export function RoleAuthTabs({ active, mode }: RoleAuthTabsProps) {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  function selectRole(role: AuthRole) {
    if (role === active) return;
    navigate(DESTINATIONS[mode][role], { replace: true });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const currentIndex = ROLE_TABS.findIndex((tab) => tab.role === active);
    const nextIndex =
      event.key === 'ArrowRight'
        ? (currentIndex + 1) % ROLE_TABS.length
        : (currentIndex - 1 + ROLE_TABS.length) % ROLE_TABS.length;
    selectRole(ROLE_TABS[nextIndex].role);
  }

  return (
    <div
      role="tablist"
      aria-label="Choose account type"
      onKeyDown={handleKeyDown}
      className="grid w-full grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1"
    >
      {ROLE_TABS.map(({ role, label, icon: Icon }) => {
        const isActive = role === active;
        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => selectRole(role)}
            className={cn(
              'relative inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium',
              'outline-none transition-colors duration-fast ease-emphasized',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isActive ? 'text-foreground' : 'text-foreground-muted hover:text-foreground',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId={ACTIVE_PILL_LAYOUT_ID}
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-surface-elevated shadow-sm"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 320, damping: 28 }
                }
              />
            ) : null}
            <Icon className="relative z-10 size-4" aria-hidden="true" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
