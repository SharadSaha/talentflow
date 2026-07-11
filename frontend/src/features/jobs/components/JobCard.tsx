import { Briefcase, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { candidateJobDetailsPath } from '@/constants/routes';
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, WORK_MODE_LABELS } from '@/constants/job';
import { cn } from '@/lib/utils';
import type { Job } from '@/types/job';
import { formatRelativeTime } from '@/utils/date';
import { getInitials } from '@/utils/format';
import { formatSalaryRange } from '@/utils/job-format';

interface JobCardProps {
  job: Job;
  /** `grid` (default) is a vertical card; `list` is a wide horizontal row. */
  layout?: 'grid' | 'list';
  className?: string;
}

/** A small labelled metadata item (icon + text). */
function MetaItem({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-small text-foreground-muted">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

/**
 * Reusable job summary card linking to the job details page. Shared by the
 * browse grid/list and the dashboard so job presentation stays consistent.
 * Presentational only — no data fetching.
 */
export function JobCard({ job, layout = 'grid', className }: JobCardProps) {
  const salary = formatSalaryRange(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryPeriod,
  );
  const postedAt = job.publishedAt ?? job.createdAt;
  const topSkills = job.skills.slice(0, 4);

  return (
    <Link
      to={candidateJobDetailsPath(job.id)}
      className={cn(
        'group block rounded-lg border border-border bg-card p-5 shadow-elevation-low outline-none transition-[transform,border-color,box-shadow] duration-normal ease-emphasized',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevation-medium focus-visible:ring-2 focus-visible:ring-ring',
        layout === 'list' && 'sm:flex sm:items-start sm:gap-5',
        className,
      )}
    >
      <div className={cn('flex items-start gap-3', layout === 'list' && 'sm:flex-1')}>
        <Avatar className="size-10 rounded-md">
          {job.company.logoUrl ? (
            <AvatarImage src={job.company.logoUrl} alt={job.company.name} />
          ) : null}
          <AvatarFallback className="rounded-md text-xs">
            {getInitials(job.company.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
            {job.title}
          </h3>
          <p className="truncate text-small text-foreground-secondary">{job.company.name}</p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <MetaItem icon={MapPin}>
              {job.location ? `${job.location} · ` : ''}
              {WORK_MODE_LABELS[job.workMode]}
            </MetaItem>
            <MetaItem icon={Briefcase}>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</MetaItem>
            <MetaItem icon={Clock}>{formatRelativeTime(postedAt)}</MetaItem>
          </div>

          {topSkills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topSkills.map((skill) => (
                <Badge key={skill.id} variant="outline">
                  {skill.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'mt-4 flex items-center justify-between gap-2',
          layout === 'list' && 'sm:mt-0 sm:flex-col sm:items-end sm:justify-start sm:text-right',
        )}
      >
        {salary ? (
          <span className="text-sm font-semibold text-foreground">{salary}</span>
        ) : (
          <span className="text-small text-foreground-muted">Salary undisclosed</span>
        )}
        <Badge variant="neutral">{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</Badge>
      </div>
    </Link>
  );
}
