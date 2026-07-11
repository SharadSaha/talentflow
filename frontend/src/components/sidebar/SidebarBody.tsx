import { SidebarFooter } from '@/components/sidebar/SidebarFooter';
import { SidebarHeader } from '@/components/sidebar/SidebarHeader';
import { SidebarNav } from '@/components/sidebar/SidebarNav';
import { useNavigationConfig } from '@/hooks/useNavigationConfig';

interface SidebarBodyProps {
  collapsed: boolean;
  /** Whether the collapse toggle is available (desktop only). */
  collapsible: boolean;
}

/**
 * The full sidebar content — header, role-aware navigation, and footer — shared
 * by the permanent desktop sidebar and the mobile drawer. Navigation is derived
 * from the authenticated role's configuration.
 */
export function SidebarBody({ collapsed, collapsible }: SidebarBodyProps) {
  const config = useNavigationConfig();

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <SidebarHeader config={config} collapsed={collapsed} />
      <SidebarNav groups={config.groups} collapsed={collapsed} />
      <SidebarFooter config={config} collapsed={collapsed} collapsible={collapsible} />
    </div>
  );
}
