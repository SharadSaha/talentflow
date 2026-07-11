import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_META } from '@/constants/application-status';
import { cn } from '@/lib/utils';
import type { Application } from '@/types/application';
import { formatDate, formatRelativeTime } from '@/utils/date';

export interface ApplicationStatusTimelineProps {
  /** The application whose lifecycle is being summarised. */
  application: Application;
  className?: string;
}

/**
 * A compact vertical timeline for a single application. The backend exposes only
 * `appliedAt`, `updatedAt`, and the current `status` (no per-event history), so
 * this renders exactly two verifiable milestones — when the application was
 * submitted and its current status — without fabricating intermediate events.
 */
export function ApplicationStatusTimeline({
  application,
  className,
}: ApplicationStatusTimelineProps) {
  const statusMeta = APPLICATION_STATUS_META[application.status];

  return (
    <ol className={cn('flex flex-col', className)}>
      <li className="flex gap-3">
        <div className="flex flex-col items-center" aria-hidden="true">
          <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
          <span className="w-px flex-1 bg-border" />
        </div>
        <div className="flex flex-col gap-0.5 pb-6">
          <p className="text-small font-medium text-foreground">Applied</p>
          <p className="text-caption text-foreground-muted">{formatDate(application.appliedAt)}</p>
        </div>
      </li>

      <li className="flex gap-3">
        <div className="flex flex-col items-center" aria-hidden="true">
          <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" />
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <p className="text-small font-medium text-foreground">Current status</p>
          <StatusBadge intent={statusMeta.intent} label={statusMeta.label} />
          <p className="text-caption text-foreground-muted">
            Updated {formatRelativeTime(application.updatedAt)}
          </p>
        </div>
      </li>
    </ol>
  );
}
