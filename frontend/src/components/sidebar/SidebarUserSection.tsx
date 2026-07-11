import { ChevronsUpDown, Settings, SunMoon, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserMenu, type UserMenuItem } from '@/components/ui/user-menu';
import type { NavigationConfig } from '@/config/navigation';
import { USER_ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { useTheme } from '@/hooks/useTheme';
import { getInitials } from '@/utils/format';

interface SidebarUserSectionProps {
  collapsed: boolean;
  config: NavigationConfig;
}

/**
 * Bottom user section: avatar, name, and role with an account dropdown (view
 * profile, settings, theme toggle, log out). Reuses the shared `UserMenu`; when
 * collapsed it falls back to the compact avatar-only trigger.
 */
export function SidebarUserSection({ collapsed, config }: SidebarUserSectionProps) {
  const { user, role } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;
  const roleLabel = role ? USER_ROLE_LABELS[role] : undefined;

  const items: UserMenuItem[] = [
    { label: 'View profile', icon: UserCircle, onSelect: () => navigate(config.profileRoute) },
    { label: 'Settings', icon: Settings, onSelect: () => navigate(config.settingsRoute) },
    { label: 'Toggle theme', icon: SunMoon, onSelect: toggleTheme },
  ];

  const expandedTrigger = (
    <button
      type="button"
      aria-label={`Account menu for ${fullName}`}
      className="flex w-full items-center gap-2 rounded-md p-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
    >
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="text-xs">{getInitials(fullName)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-sidebar-foreground">
          {fullName}
        </span>
        {roleLabel ? (
          <span className="block truncate text-xs text-foreground-muted">{roleLabel}</span>
        ) : null}
      </span>
      <ChevronsUpDown className="size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
    </button>
  );

  return (
    <UserMenu
      name={fullName}
      email={user.email}
      role={roleLabel}
      onLogout={logout}
      items={items}
      align="start"
      trigger={collapsed ? undefined : expandedTrigger}
    />
  );
}
