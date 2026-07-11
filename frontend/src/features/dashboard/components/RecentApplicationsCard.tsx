import { Building2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_META } from '@/constants/application-status';
import { candidateJobDetailsPath, ROUTES } from '@/constants/routes';
import type { Application } from '@/types/application';
import { formatRelativeTime } from '@/utils/date';

interface RecentApplicationsCardProps {
  applications: Application[];
}

/** A single recent-application row linking through to the job details page. */
function ApplicationRow({ application }: { application: Application }) {
  const meta = APPLICATION_STATUS_META[application.status];

  return (
    <li>
      <Link
        to={candidateJobDetailsPath(application.job.id)}
        className="flex items-center justify-between gap-3 rounded-md px-2 py-3 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-foreground">{application.job.title}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-small text-foreground-muted">
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            {application.job.company.name}
            <span aria-hidden="true">·</span>
            <span>{formatRelativeTime(application.appliedAt)}</span>
          </p>
        </div>
        <StatusBadge intent={meta.intent} label={meta.label} className="shrink-0" />
      </Link>
    </li>
  );
}

/** Lists the candidate's most recent applications with their current status. */
export function RecentApplicationsCard({ applications }: RecentApplicationsCardProps) {
  return (
    <Card className="shadow-elevation-low">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Recent applications</CardTitle>
        {applications.length > 0 ? (
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.CANDIDATE.APPLICATIONS}>View all</Link>
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <ul className="divide-y divide-border-subtle">
            {applications.map((application) => (
              <ApplicationRow key={application.id} application={application} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Start applying to jobs and track their progress here."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.CANDIDATE.JOBS}>Browse jobs</Link>
              </Button>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
