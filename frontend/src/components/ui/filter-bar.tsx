import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** A presentational container that lays out a row of filter controls. */
export const FilterBar = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  function FilterBar({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="group"
        className={cn('flex flex-wrap items-center gap-2', className)}
        {...props}
      />
    );
  },
);

/** A muted label describing a group of filters. */
export const FilterBarLabel = forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  function FilterBarLabel({ className, ...props }, ref) {
    return (
      <span ref={ref} className={cn('text-small text-foreground-muted', className)} {...props} />
    );
  },
);
