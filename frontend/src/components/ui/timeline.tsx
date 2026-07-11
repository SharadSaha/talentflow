import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

/** Vertical container for a sequence of chronological events. */
export const Timeline = forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  function Timeline({ className, ...props }, ref) {
    return <ol ref={ref} className={cn('flex flex-col', className)} {...props} />;
  },
);

export interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Headline for the event. */
  title: string;
  /** Optional time or relative-time label for the event. */
  timestamp?: string;
  /** Optional supporting detail. */
  description?: string;
  /** Optional marker icon (e.g. a Lucide component). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Suppresses the connecting line for the final item. */
  isLast?: boolean;
}

/**
 * A single event on a `Timeline`. Renders a dot (or icon) marker connected by a
 * vertical rule, alongside the event's title, timestamp, and description.
 */
export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem(
  { className, title, timestamp, description, icon: Icon, isLast = false, children, ...props },
  ref,
) {
  return (
    <li ref={ref} className={cn('relative flex gap-3', className)} {...props}>
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full',
            Icon ? 'bg-muted text-foreground-secondary' : 'bg-primary',
          )}
          aria-hidden="true"
        >
          {Icon ? (
            <Icon className="size-3.5" />
          ) : (
            <span className="size-2 rounded-full bg-primary" />
          )}
        </span>
        {!isLast && <span className="w-px flex-1 border-l border-border" aria-hidden="true" />}
      </div>
      <div className={cn('flex flex-col gap-0.5', isLast ? 'pb-0' : 'pb-6')}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {timestamp && <span className="text-caption text-foreground-muted">{timestamp}</span>}
        </div>
        {description && <p className="text-small text-foreground-secondary">{description}</p>}
        {children}
      </div>
    </li>
  );
});
