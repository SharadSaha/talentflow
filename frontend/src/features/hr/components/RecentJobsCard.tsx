import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { JOB_STATUS_META } from '@/constants/job-status';
import { hrApplicantsPath, ROUTES } from '@/constants/routes';
import type { Job } from '@/types/job';
import { formatNumber } from '@/utils/format';

interface RecentJobsCardProps {
  jobs: Job[];
}

/** A single job row linking through to that job's applicants. */
function JobRow({ job }: { job: Job }) {
  const meta = JOB_STATUS_META[job.status];
  const applicants = job.applicationCount;

  return (
    <li>
      <Link
        to={hrApplicantsPath(job.id)}
        className="flex items-center justify-between gap-3 rounded-md px-2 py-3 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-foreground">{job.title}</p>
          <p className="mt-0.5 truncate text-small text-foreground-muted">
            {formatNumber(applicants)} {applicants === 1 ? 'applicant' : 'applicants'}
          </p>
        </div>
        <StatusBadge intent={meta.intent} label={meta.label} className="shrink-0" />
      </Link>
    </li>
  );
}

/** Lists the recruiter's most recently posted jobs. */
export function RecentJobsCard({ jobs }: RecentJobsCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <h2 className="text-h3">Recent jobs</h2>
        {jobs.length > 0 ? (
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.HR.JOBS}>View all</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {jobs.length > 0 ? (
          <ul className="divide-y divide-border-subtle">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Create your first posting to start receiving applicants."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.HR.JOB_NEW}>Create job</Link>
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
