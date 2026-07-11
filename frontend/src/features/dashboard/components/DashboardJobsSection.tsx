import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { ROUTES } from '@/constants/routes';
import { JobCard } from '@/features/jobs/components/JobCard';
import type { Job } from '@/types/job';

/** How many jobs to surface per dashboard section. */
const MAX_JOBS = 4;

interface DashboardJobsSectionProps {
  title: string;
  description?: string;
  jobs: Job[];
  /** Message shown when there are no jobs to display. */
  emptyTitle: string;
  emptyDescription?: string;
}

/**
 * A titled section rendering a capped grid of {@link JobCard}s, falling back to
 * an empty state that points the candidate to the full job listing.
 */
export function DashboardJobsSection({
  title,
  description,
  jobs,
  emptyTitle,
  emptyDescription,
}: DashboardJobsSectionProps) {
  const visibleJobs = jobs.slice(0, MAX_JOBS);

  return (
    <section aria-label={title} className="space-y-4">
      <SectionHeader
        title={title}
        description={description}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to={ROUTES.CANDIDATE.JOBS}>View all</Link>
          </Button>
        }
      />
      {visibleJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.CANDIDATE.JOBS}>Browse jobs</Link>
            </Button>
          }
        />
      )}
    </section>
  );
}
