import { Fragment } from 'react';

import type { NavigationGroup } from '@/config/navigation';
import { SidebarGroup } from '@/components/sidebar/SidebarGroup';

interface SidebarNavProps {
  groups: NavigationGroup[];
  collapsed: boolean;
}

/**
 * The primary navigation landmark. Renders each configured group; when
 * collapsed, groups are separated by a subtle divider in place of their labels.
 */
export function SidebarNav({ groups, collapsed }: SidebarNavProps) {
  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {collapsed && index > 0 ? (
            <div className="mx-auto my-1 h-px w-8 bg-sidebar-border" aria-hidden="true" />
          ) : null}
          <SidebarGroup group={group} collapsed={collapsed} />
        </Fragment>
      ))}
    </nav>
  );
}
