import { type VariantProps, cva } from 'class-variance-authority';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/**
 * Alert style contract. Each variant tints its border, text, and background
 * from a single semantic token family. An optional leading icon is laid out in
 * a two-column grid alongside the title and description.
 */
export const alertVariants = cva(
  cn(
    'relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-lg border p-4',
    'has-[>svg]:grid-cols-[1.25rem_1fr] has-[>svg]:gap-x-3',
    '[&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:translate-y-0.5',
  ),
  {
    variants: {
      variant: {
        info: 'border-info/30 bg-info/10 text-info',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        danger: 'border-danger/30 bg-danger/10 text-danger',
        neutral: 'border-border bg-muted text-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

/**
 * A contextual message banner. Compose with `AlertTitle`, `AlertDescription`,
 * and an optional leading Lucide icon.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant, ...props },
  ref,
) {
  return (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  );
});

/** Heading line of an alert. */
export const AlertTitle = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertTitle({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('col-start-2 font-medium leading-tight', className)}
        {...props}
      />
    );
  },
);

/** Supporting body copy of an alert. */
export const AlertDescription = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AlertDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('col-start-2 text-small text-foreground-secondary', className)}
        {...props}
      />
    );
  },
);
