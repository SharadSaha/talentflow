import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional illustrative icon (e.g. a Lucide component). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Primary message describing the empty condition. */
  title: string;
  /** Optional supporting explanation. */
  description?: string;
  /** Optional call-to-action rendered beneath the copy. */
  action?: React.ReactNode;
}

/**
 * A centered placeholder for empty collections or zero-result views. Announces
 * itself as a status region so assistive tech surfaces the empty condition.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { className, icon: Icon, title, description, action, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
      {...props}
    >
      {Icon && (
        <div className="rounded-full bg-muted p-3">
          <Icon className="size-6 text-foreground-muted" />
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <p className="text-body font-medium text-foreground">{title}</p>
        {description && <p className="max-w-sm text-small text-foreground-muted">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
});
