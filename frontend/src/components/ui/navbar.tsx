import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** Sticky top navigation bar. */
export const Navbar = forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'header'>>(
  function Navbar({ className, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur',
          className,
        )}
        {...props}
      />
    );
  },
);

/** Primary title/branding slot within the navbar. */
export const NavbarTitle = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function NavbarTitle({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 text-sm font-semibold text-foreground', className)}
        {...props}
      />
    );
  },
);

/** Right-aligned actions region within the navbar. */
export const NavbarActions = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function NavbarActions({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('ml-auto flex items-center gap-2', className)} {...props} />
    );
  },
);
