import * as ProgressPrimitive from '@radix-ui/react-progress';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>;

/**
 * A determinate progress bar. The filled indicator animates via `translateX`
 * so the fill grows smoothly as `value` (0–100) changes.
 */
export const Progress = forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  function Progress({ className, value, ...props }, ref) {
    const clamped = Math.min(100, Math.max(0, value ?? 0));

    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={value}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-muted', className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="size-full flex-1 bg-primary transition-transform duration-slow ease-emphasized"
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);
