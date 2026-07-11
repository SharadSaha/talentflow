import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Short metric name shown above the value. */
  label: string;
  /** The headline figure. Accepts a node so formatted numbers can be passed. */
  value: React.ReactNode;
  /** Optional leading icon (e.g. a Lucide component). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional supporting caption beneath the value. */
  description?: string;
}

/**
 * A compact metric tile: a label, a prominent value, and an optional icon and
 * caption. Purely presentational — callers supply already-formatted values.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { className, label, value, icon: Icon, description, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('rounded-lg border border-border bg-card p-5', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-small font-medium text-foreground-muted">{label}</p>
        {Icon ? (
          <span className="rounded-md bg-primary/10 p-1.5 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-h2 font-semibold tabular-nums text-foreground">{value}</p>
      {description ? (
        <p className="mt-1 text-caption text-foreground-muted">{description}</p>
      ) : null}
    </div>
  );
});
