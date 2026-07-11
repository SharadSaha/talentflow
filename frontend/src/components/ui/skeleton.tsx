import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * A pulsing placeholder used to reserve layout space while content loads.
 * Size and shape are controlled entirely through `className`.
 */
export const Skeleton = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Skeleton({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('animate-pulse rounded-md bg-skeleton', className)} {...props} />
    );
  },
);
