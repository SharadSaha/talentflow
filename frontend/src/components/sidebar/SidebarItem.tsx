import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import { SidebarBadge, SidebarDot } from '@/components/sidebar/SidebarBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NavigationItem } from '@/config/navigation';
import { useActiveRoute } from '@/hooks/useActiveRoute';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  item: NavigationItem;
  /** Icon-only (mini) rendering with a hover tooltip. */
  collapsed: boolean;
}

/**
 * A single navigation entry. Highlights on the active route (exact or nested),
 * supports badges/dots, coming-soon and disabled states, and — when collapsed —
 * renders icon-only with an accessible hover tooltip. The active accent bar
 * animates in subtly (disabled under reduced motion).
 */
export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const isActive = useActiveRoute(item.to, item.end);
  const prefersReducedMotion = useReducedMotion();
  const Icon = item.icon;

  const accentBar =
    isActive &&
    (prefersReducedMotion ? (
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
      />
    ) : (
      <motion.span
        aria-hidden="true"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-0 top-1/2 h-5 w-0.5 origin-center -translate-y-1/2 rounded-full bg-primary"
      />
    ));

  const rowClass = cn(
    'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm outline-none',
    'transition-colors duration-fast ease-emphasized',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
    collapsed && 'justify-center px-0',
    isActive
      ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
    item.disabled && 'pointer-events-none opacity-50',
  );

  const label = <span className={cn('flex-1 truncate', collapsed && 'sr-only')}>{item.title}</span>;

  const trailing = collapsed ? (
    (item.dot || item.badge !== undefined || item.comingSoon) && (
      <span className="absolute right-1.5 top-1.5">
        <SidebarDot label={`${item.title} has updates`} />
      </span>
    )
  ) : (
    <>
      {item.badge !== undefined ? <SidebarBadge>{item.badge}</SidebarBadge> : null}
      {item.comingSoon ? <SidebarBadge muted>Soon</SidebarBadge> : null}
      {item.dot ? <SidebarDot label={`${item.title} has updates`} /> : null}
    </>
  );

  const body = (
    <>
      {accentBar}
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {label}
      {trailing}
    </>
  );

  const row = item.disabled ? (
    <span className={rowClass} role="link" aria-disabled="true">
      {body}
    </span>
  ) : (
    <Link to={item.to} className={rowClass} aria-current={isActive ? 'page' : undefined}>
      {body}
    </Link>
  );

  if (!collapsed) {
    return <li>{row}</li>;
  }

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>{row}</TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-0.5">
          <span className="font-medium">{item.title}</span>
          {item.description ? (
            <span className="text-foreground-muted">{item.description}</span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}
