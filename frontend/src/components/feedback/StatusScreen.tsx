import type { ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StatusScreenProps {
  /** Icon component (e.g. a Lucide icon) rendered in the header badge. */
  icon?: ComponentType<{ className?: string }>;
  /** Short status code or eyebrow (e.g. "404"). */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Action buttons rendered below the description. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Full-height centered status screen used for system pages (404, unauthorized,
 * unexpected errors). Composed by those pages so their layout stays consistent.
 */
export function StatusScreen({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}: StatusScreenProps) {
  return (
    <div
      className={cn(
        'flex min-h-[70vh] w-full flex-col items-center justify-center px-6 text-center',
        className,
      )}
      role="alert"
    >
      {Icon ? (
        <span className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-muted text-foreground-secondary">
          <Icon className="size-6" />
        </span>
      ) : null}
      {eyebrow ? (
        <p className="text-small font-medium uppercase tracking-wide text-primary">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-h1 text-foreground">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-md text-body text-foreground-muted">{description}</p>
      ) : null}
      {actions ? (
        <div className="mt-6 flex items-center justify-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
