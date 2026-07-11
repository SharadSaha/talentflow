import { Bookmark, Briefcase, Clock, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { candidateJobDetailsPath } from '@/constants/routes';
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, WORK_MODE_LABELS } from '@/constants/job';
import { useJobBookmarks } from '@/features/jobs/hooks/useJobBookmarks';
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

/** Jobs published within this window are flagged as new. */
const NEW_JOB_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The reference "now", captured once when the module loads. Freshness is a
 * coarse 7-day badge, so pinning the clock at load keeps render pure (no
 * per-render `Date.now()`) without any perceptible loss of accuracy.
 */
const REFERENCE_NOW = Date.now();

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
 * Reusable job summary card. Uses a stretched-link overlay so the whole card
 * navigates while a bookmark control stays independently interactive. Feedback
 * is conveyed through elevation, border, and background — never a scale
 * transform — for a calm, premium feel. Presentational only.
 */
export function JobCard({ job, layout = 'grid', className }: JobCardProps) {
  const { isBookmarked, toggle } = useJobBookmarks();
  const bookmarked = isBookmarked(job.id);

  const salary = formatSalaryRange(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryPeriod,
  );
  const postedAt = job.publishedAt ?? job.createdAt;
  const topSkills = job.skills.slice(0, 4);
  const isNew = REFERENCE_NOW - new Date(postedAt).getTime() < NEW_JOB_WINDOW_MS;

  const handleToggleBookmark = () => {
    const nowBookmarked = toggle(job.id);
    toast.success(nowBookmarked ? 'Saved to your bookmarks' : 'Removed from your bookmarks');
  };

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-card shadow-elevation-low',
        'transition-[border-color,box-shadow,background-color] duration-normal ease-emphasized',
        'hover:border-primary/30 hover:bg-surface-hover/40 hover:shadow-elevation-medium',
        'focus-within:border-primary/40',
        className,
      )}
    >
      {/* Accent strip — subtle at rest, intensifies on hover/focus. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[3px] bg-primary/0 transition-colors duration-normal ease-emphasized group-hover:bg-primary/50 group-focus-within:bg-primary/60"
      />

      {/* Stretched navigation target covering the card. */}
      <Link
        to={candidateJobDetailsPath(job.id)}
        className="absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="sr-only">View {job.title}</span>
      </Link>

      {/* Bookmark stays above the stretched link. */}
      <button
        type="button"
        onClick={handleToggleBookmark}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? `Remove ${job.title} from bookmarks` : `Save ${job.title}`}
        className={cn(
          'absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-md border border-transparent text-foreground-muted transition-colors duration-fast ease-emphasized',
          'hover:border-border hover:bg-surface-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          bookmarked && 'text-primary',
        )}
      >
        <Bookmark className={cn('size-4', bookmarked && 'fill-current')} aria-hidden="true" />
      </button>

      <div className={cn('p-5', layout === 'list' && 'sm:flex sm:items-start sm:gap-5')}>
        <div
          className={cn('flex items-start gap-3 pr-9', layout === 'list' && 'sm:flex-1 sm:pr-0')}
        >
          <Avatar className="size-11 rounded-md">
            {job.company.logoUrl ? (
              <AvatarImage src={job.company.logoUrl} alt={job.company.name} />
            ) : null}
            <AvatarFallback className="rounded-md text-xs">
              {getInitials(job.company.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                {job.title}
              </h3>
              {isNew ? (
                <Badge variant="primary" className="shrink-0 gap-1">
                  <Sparkles className="size-3" aria-hidden="true" />
                  New
                </Badge>
              ) : null}
            </div>
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
            'mt-4 flex items-center justify-between gap-2 border-t border-border-subtle pt-4',
            layout === 'list' &&
              'sm:mt-0 sm:flex-col sm:items-end sm:justify-start sm:border-l sm:border-t-0 sm:pl-5 sm:pt-9 sm:text-right',
          )}
        >
          {salary ? (
            <span className="text-sm font-semibold text-foreground">{salary}</span>
          ) : (
            <span className="text-small text-foreground-muted">Salary undisclosed</span>
          )}
          <Badge variant="neutral">{EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}</Badge>
        </div>
      </div>
    </article>
  );
}
