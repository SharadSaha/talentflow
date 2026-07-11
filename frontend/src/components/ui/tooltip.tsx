import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** Wraps a subtree so its tooltips share timing configuration. */
export const TooltipProvider = TooltipPrimitive.Provider;

/** Root state container for a single tooltip. */
export const Tooltip = TooltipPrimitive.Root;

/** The element that reveals the tooltip on hover or focus. */
export const TooltipTrigger = TooltipPrimitive.Trigger;

export type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

/**
 * The floating label shown for a `Tooltip`. Portal-rendered and animated,
 * positioned a short distance from its trigger.
 */
export const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-lg',
          'data-[state=delayed-open]:animate-scale-in data-[state=instant-open]:animate-scale-in',
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
});
