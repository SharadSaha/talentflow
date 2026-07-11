import { Building2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { hrApplicantsPath } from '@/constants/routes';
import type { Job } from '@/types/job';
import { formatNumber } from '@/utils/format';

interface TopPerformingJobCardProps {
  job: Job;
}

/**
 * Highlights the posting attracting the most applicants. Rendered with a primary
 * accent so it reads as a spotlight rather than a routine list item.
 */
export function TopPerformingJobCard({ job }: TopPerformingJobCardProps) {
  const applicants = job.applicationCount;

  return (
    <section aria-labelledby="hr-top-job-heading">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Trophy className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-caption font-medium uppercase tracking-wide text-primary">
                Top performing job
              </p>
              <h2 id="hr-top-job-heading" className="truncate text-h3">
                {job.title}
              </h2>
              <p className="flex items-center gap-1.5 text-small text-foreground-muted">
                <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{job.company.name}</span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">
                  {formatNumber(applicants)} {applicants === 1 ? 'applicant' : 'applicants'}
                </span>
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={hrApplicantsPath(job.id)}>View applicants</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
