import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** Semantic breadcrumb navigation landmark. */
export const Breadcrumb = forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'nav'>>(
  function Breadcrumb({ ...props }, ref) {
    return <nav ref={ref} aria-label="Breadcrumb" {...props} />;
  },
);

/** Ordered list of breadcrumb items. */
export const BreadcrumbList = forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  function BreadcrumbList({ className, ...props }, ref) {
    return (
      <ol
        ref={ref}
        className={cn(
          'flex flex-wrap items-center gap-1.5 text-small text-foreground-muted',
          className,
        )}
        {...props}
      />
    );
  },
);

/** A single breadcrumb segment. */
export const BreadcrumbItem = forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return (
      <li ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...props} />
    );
  },
);

interface BreadcrumbLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  /** Render as the child element (e.g. a router link) via Radix `Slot`. */
  asChild?: boolean;
}

/** A navigable breadcrumb link. */
export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        className={cn('text-foreground-muted transition-colors hover:text-foreground', className)}
        {...props}
      />
    );
  },
);

/** The current page — the non-interactive terminal breadcrumb. */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  function BreadcrumbPage({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn('font-medium text-foreground', className)}
        {...props}
      />
    );
  },
);

/** Visual separator between breadcrumb items. */
export const BreadcrumbSeparator = forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  function BreadcrumbSeparator({ className, children, ...props }, ref) {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex', className)}
        {...props}
      >
        {children ?? <ChevronRight className="size-3.5 text-foreground-muted" />}
      </li>
    );
  },
);

/** Overflow indicator for collapsed breadcrumb trails. */
export const BreadcrumbEllipsis = forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(function BreadcrumbEllipsis({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-5 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-3.5 text-foreground-muted" />
      <span className="sr-only">More</span>
    </span>
  );
});
