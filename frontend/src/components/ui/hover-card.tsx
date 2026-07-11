import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** Root state container for a hover card. */
export const HoverCard = HoverCardPrimitive.Root;

/** The element that reveals the hover card on pointer hover or focus. */
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export type HoverCardContentProps = React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Content
>;

/**
 * The floating preview surface shown when hovering a `HoverCardTrigger`.
 * Portal-rendered, animated on open, and positioned near its trigger.
 */
export const HoverCardContent = forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(function HoverCardContent({ className, align = 'center', sideOffset = 8, ...props }, ref) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg outline-none',
          'data-[state=open]:animate-scale-in',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
});
