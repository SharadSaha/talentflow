import { SidebarCollapseButton } from '@/components/sidebar/SidebarCollapseButton';
import { SidebarUserSection } from '@/components/sidebar/SidebarUserSection';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import type { NavigationConfig } from '@/config/navigation';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

interface SidebarFooterProps {
  config: NavigationConfig;
  collapsed: boolean;
  /** Whether to show the desktop collapse toggle (hidden in the mobile drawer). */
  collapsible: boolean;
}

/** Bottom section: quick theme toggle, collapse control, and the user account menu. */
export function SidebarFooter({ config, collapsed, collapsible }: SidebarFooterProps) {
  const { toggleCollapsed } = useSidebar();

  return (
    <div className="mt-auto shrink-0 space-y-1 border-t border-sidebar-border p-2">
      <div className={cn('flex items-center gap-1', collapsed ? 'flex-col' : 'justify-between')}>
        <ThemeToggle />
        {collapsible ? (
          <SidebarCollapseButton collapsed={collapsed} onToggle={toggleCollapsed} />
        ) : null}
      </div>
      <SidebarUserSection collapsed={collapsed} config={config} />
    </div>
  );
}
