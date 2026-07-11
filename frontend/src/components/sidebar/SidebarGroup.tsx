import type { NavigationGroup } from '@/config/navigation';
import { SidebarItem } from '@/components/sidebar/SidebarItem';

interface SidebarGroupProps {
  group: NavigationGroup;
  collapsed: boolean;
}

/** A labelled group of navigation items. The label is hidden when collapsed. */
export function SidebarGroup({ group, collapsed }: SidebarGroupProps) {
  return (
    <div>
      {group.label && !collapsed ? (
        <p className="px-3 pb-1 pt-3 text-caption font-medium uppercase tracking-wider text-foreground-muted">
          {group.label}
        </p>
      ) : null}
      <ul className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <SidebarItem key={item.key} item={item} collapsed={collapsed} />
        ))}
      </ul>
    </div>
  );
}
