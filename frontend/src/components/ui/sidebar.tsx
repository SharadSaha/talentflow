import { Slot, Slottable } from '@radix-ui/react-slot';
import type { ComponentType } from 'react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

interface SidebarProps extends React.ComponentPropsWithoutRef<'aside'> {
  /** Collapses the sidebar to an icon rail. */
  collapsed?: boolean;
}

/** The application sidebar shell. Animates width when collapsing. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { className, collapsed = false, ...props },
  ref,
) {
  return (
    <aside
      ref={ref}
      data-collapsed={collapsed || undefined}
      className={cn(
        'flex h-full flex-col border-r border-sidebar-border bg-sidebar',
        'transition-[width] duration-normal ease-emphasized',
        collapsed ? 'w-16' : 'w-60',
        className,
      )}
      {...props}
    />
  );
});

/** Top region of the sidebar, typically for branding. */
export const SidebarHeader = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function SidebarHeader({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('flex h-14 items-center gap-2 px-3', className)} {...props} />
    );
  },
);

/** Scrollable main region of the sidebar. */
export const SidebarContent = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function SidebarContent({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('flex-1 overflow-y-auto px-3 py-2', className)} {...props} />
    );
  },
);

/** Bottom region of the sidebar, typically for user/account controls. */
export const SidebarFooter = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function SidebarFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('mt-auto border-t border-sidebar-border p-3', className)}
        {...props}
      />
    );
  },
);

/** Navigation landmark grouping sidebar nav items. */
export const SidebarNav = forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'nav'>>(
  function SidebarNav({ className, ...props }, ref) {
    return <nav ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />;
  },
);

interface SidebarNavItemProps extends React.ComponentPropsWithoutRef<'a'> {
  /** Leading icon component (e.g. a Lucide icon). */
  icon: ComponentType<{ className?: string }>;
  /** Visible label; hidden (but kept accessible) when collapsed. */
  label: string;
  /** Marks the item as the current destination. */
  active?: boolean;
  /** Whether the item is in a collapsed sidebar. */
  collapsed?: boolean;
  /** Render as the child element (e.g. a router link) via Radix `Slot`. */
  asChild?: boolean;
}

/** A single sidebar navigation entry. */
export const SidebarNavItem = forwardRef<HTMLAnchorElement, SidebarNavItemProps>(
  function SidebarNavItem(
    {
      className,
      icon: Icon,
      label,
      active = false,
      collapsed = false,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) {
    const Comp = asChild ? Slot : 'a';
    const content = (
      <>
        <Icon className="size-4 shrink-0" />
        <span className={cn('truncate', collapsed && 'sr-only')}>{label}</span>
      </>
    );

    return (
      <Comp
        ref={ref}
        title={collapsed ? label : undefined}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
          'hover:bg-sidebar-accent',
          active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
          collapsed && 'justify-center px-0',
          className,
        )}
        {...props}
      >
        {/*
         * When `asChild`, `children` is the consumer's element (e.g. a router
         * <Link>); `Slottable` marks it as the slot target so Radix merges our
         * props onto it and renders the icon + label inside it. Without
         * `asChild`, we render a plain anchor with the same content.
         */}
        {asChild ? (
          <>
            {content}
            <Slottable>{children}</Slottable>
          </>
        ) : (
          content
        )}
      </Comp>
    );
  },
);
