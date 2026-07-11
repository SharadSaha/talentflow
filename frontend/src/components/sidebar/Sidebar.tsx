import { SidebarBody } from '@/components/sidebar/SidebarBody';
import { useSidebar } from '@/hooks/useSidebar';
import { cn } from '@/lib/utils';

/**
 * The permanent desktop sidebar. Animates its width between expanded and mini
 * (collapsed) modes; hidden below the `md` breakpoint, where the mobile drawer
 * takes over. Collapse state is persisted via the sidebar provider.
 */
export function Sidebar() {
  const { collapsed } = useSidebar();

  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        'hidden shrink-0 border-r border-sidebar-border md:flex',
        'transition-[width] duration-normal ease-emphasized motion-reduce:transition-none',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <SidebarBody collapsed={collapsed} collapsible />
    </aside>
  );
}
