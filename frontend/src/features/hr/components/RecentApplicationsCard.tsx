import { Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_META } from '@/constants/application-status';
import { hrApplicantsPath } from '@/constants/routes';
import type { HrRecentApplication } from '@/types/hr-dashboard';
import { formatRelativeTime } from '@/utils/date';

interface RecentApplicationsCardProps {
  applications: HrRecentApplication[];
}

/** A single applicant row linking through to the job's applicants view. */
function ApplicationRow({ application }: { application: HrRecentApplication }) {
  const meta = APPLICATION_STATUS_META[application.status];

  return (
    <li>
      <Link
        to={hrApplicantsPath(application.jobId)}
        className="flex items-center justify-between gap-3 rounded-md px-2 py-3 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-foreground">
            {application.candidateName}
          </p>
          <p className="mt-0.5 truncate text-small text-foreground-muted">
            {application.jobTitle}
            <span aria-hidden="true"> · </span>
            <span>{formatRelativeTime(application.appliedAt)}</span>
          </p>
        </div>
        <StatusBadge intent={meta.intent} label={meta.label} className="shrink-0" />
      </Link>
    </li>
  );
}

/** Lists the most recent applications across the recruiter's jobs. */
export function RecentApplicationsCard({ applications }: RecentApplicationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3">Recent applications</h2>
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
            icon={Inbox}
            title="No applications yet"
            description="New applications to your jobs will show up here."
          />
        )}
      </CardContent>
    </Card>
  );
}
