import { Link } from 'react-router-dom';

import { Logo } from '@/components/branding/Logo';
import { env } from '@/config/env';
import type { NavigationConfig } from '@/config/navigation';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  config: NavigationConfig;
  collapsed: boolean;
}

/**
 * Sidebar header: the brand logo (linking home) with a workspace subtitle that
 * identifies the current role's workspace. Collapses to the icon badge only.
 */
export function SidebarHeader({ config, collapsed }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex h-14 shrink-0 items-center border-b border-sidebar-border px-3',
        collapsed && 'justify-center px-0',
      )}
    >
      <Link
        to={config.homeRoute}
        aria-label={`${env.appName} home`}
        className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
      >
        <Logo iconOnly />
        {!collapsed ? (
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-foreground">{env.appName}</span>
            {config.workspaceLabel ? (
              <span className="truncate text-caption text-foreground-muted">
                {config.workspaceLabel}
              </span>
            ) : null}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
