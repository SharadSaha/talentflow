import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { JOB_STATUS, JOB_STATUS_META, type JobStatus } from '@/constants/job-status';
import type { HrDashboard } from '@/types/hr-dashboard';
import { formatNumber } from '@/utils/format';

interface JobsStatusCardProps {
  dashboard: HrDashboard;
}

/**
 * A compact breakdown of the recruiter's postings by lifecycle status. Draft is
 * derived from the totals since the dashboard only reports active and closed.
 */
export function JobsStatusCard({ dashboard }: JobsStatusCardProps) {
  const { totalJobs, activeJobs, closedJobs } = dashboard;
  const draftJobs = Math.max(0, totalJobs - activeJobs - closedJobs);

  const rows: { status: JobStatus; count: number }[] = [
    { status: JOB_STATUS.PUBLISHED, count: activeJobs },
    { status: JOB_STATUS.CLOSED, count: closedJobs },
    { status: JOB_STATUS.DRAFT, count: draftJobs },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3">Jobs by status</h2>
        <CardDescription>Your postings across their lifecycle.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {rows.map(({ status, count }) => {
            const meta = JOB_STATUS_META[status];
            const percent = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
            return (
              <li key={status} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <StatusBadge intent={meta.intent} label={meta.label} />
                  <span className="text-small font-semibold tabular-nums text-foreground">
                    {formatNumber(count)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-slow ease-emphasized"
                    style={{ width: `${percent}%` }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
