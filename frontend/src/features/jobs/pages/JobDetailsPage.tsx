import { Briefcase, CalendarDays, Clock, MapPin, TrendingUp, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';

import { BackButton } from '@/components/navigation/BackButton';
import { OrganizationBadge } from '@/components/OrganizationBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_META } from '@/constants/application-status';
import { EMPLOYMENT_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS, WORK_MODE_LABELS } from '@/constants/job';
import { JOB_STATUS } from '@/constants/job-status';
import { ROUTES } from '@/constants/routes';
import { ApplyDialog } from '@/features/jobs/components/ApplyDialog';
import { useGetJobQuery } from '@/features/jobs/api/jobsApi';
import { useJobApplicationStatus } from '@/features/jobs/hooks/useJobApplicationStatus';
import { useDisclosure } from '@/hooks/useDisclosure';
import type { Application } from '@/types/application';
import type { Job } from '@/types/job';
import { formatDate } from '@/utils/date';
import { formatExperienceRange, formatSalaryRange } from '@/utils/job-format';

/** A single icon + text metadata item in the header meta row. */
function MetaItem({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-small text-foreground-secondary">
      <Icon className="size-4 shrink-0 text-foreground-muted" aria-hidden={true} />
      {children}
    </span>
  );
}

/** A single label/value fact in the apply-card summary. */
function ApplyFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption text-foreground-muted">{label}</dt>
      <dd className="text-small font-medium text-foreground">{value}</dd>
    </div>
  );
}

/** The apply panel: reflects existing application, closed roles, or an apply CTA. */
function ApplyCard({ job, application }: { job: Job; application: Application | undefined }) {
  const applyDialog = useDisclosure();

  const salary = formatSalaryRange(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryPeriod,
  );
  const isOpenForApplications = job.status === JOB_STATUS.PUBLISHED;

  return (
    <Card className="bg-widget-glow shadow-elevation-medium lg:sticky lg:top-6">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1">
          {salary ? (
            <span className="text-h3 text-foreground">{salary}</span>
          ) : (
            <span className="text-body text-foreground-muted">Salary undisclosed</span>
          )}
          <span className="text-small text-foreground-muted">
            {EMPLOYMENT_TYPE_LABELS[job.employmentType]} · {WORK_MODE_LABELS[job.workMode]}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border-subtle bg-muted/30 p-3">
          <ApplyFact label="Experience" value={EXPERIENCE_LEVEL_LABELS[job.experienceLevel]} />
          <ApplyFact
            label="Openings"
            value={`${job.openings} ${job.openings === 1 ? 'seat' : 'seats'}`}
          />
          <ApplyFact label="Work mode" value={WORK_MODE_LABELS[job.workMode]} />
          <ApplyFact label="Applicants" value={`${job.applicationCount} applied`} />
        </dl>

        {application ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-small text-foreground-secondary">
              <span>Application status</span>
              <StatusBadge
                intent={APPLICATION_STATUS_META[application.status].intent}
                label={APPLICATION_STATUS_META[application.status].label}
              />
            </div>
            <Button disabled className="w-full">
              You&apos;ve applied
            </Button>
          </div>
        ) : isOpenForApplications ? (
          <Button className="w-full" onClick={applyDialog.open}>
            Apply now
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-small text-foreground-muted">
              This role is no longer accepting applications.
            </p>
            <Button disabled className="w-full">
              Apply now
            </Button>
          </div>
        )}
      </CardContent>

      <ApplyDialog
        open={applyDialog.isOpen}
        onOpenChange={applyDialog.setOpen}
        jobId={job.id}
        jobTitle={job.title}
      />
    </Card>
  );
}

/** Splits the job's skills into required and optional badge groups. */
function SkillsCard({ job }: { job: Job }) {
  const requiredSkills = job.skills.filter((skill) => skill.isRequired);
  const optionalSkills = job.skills.filter((skill) => !skill.isRequired);

  if (job.skills.length === 0) return null;

  return (
    <Card className="shadow-elevation-low">
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {requiredSkills.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-caption font-medium uppercase tracking-wide text-foreground-muted">
              Required
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((skill) => (
                <Badge key={skill.id} variant="primary">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {optionalSkills.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-caption font-medium uppercase tracking-wide text-foreground-muted">
              Nice to have
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {optionalSkills.map((skill) => (
                <Badge key={skill.id} variant="outline">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** The job header card: company logo, title, company name, and metadata. */
function JobHeaderCard({ job }: { job: Job }) {
  const experience = formatExperienceRange(job.minExperienceYears, job.maxExperienceYears);
  const salary = formatSalaryRange(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryPeriod,
  );
  const postedAt = job.publishedAt ?? job.createdAt;

  return (
    <Card className="bg-widget-glow shadow-elevation-low">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-3">
          <h1 className="text-h1 text-foreground">{job.title}</h1>
          <OrganizationBadge
            name={job.company.name}
            logoUrl={job.company.logoUrl}
            location={job.company.location}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <MetaItem icon={MapPin}>
            {job.location ? `${job.location} · ` : ''}
            {WORK_MODE_LABELS[job.workMode]}
          </MetaItem>
          <MetaItem icon={Briefcase}>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</MetaItem>
          <MetaItem icon={TrendingUp}>
            {EXPERIENCE_LEVEL_LABELS[job.experienceLevel]}
            {experience ? ` · ${experience}` : ''}
          </MetaItem>
          {salary ? <MetaItem icon={Clock}>{salary}</MetaItem> : null}
          <MetaItem icon={Users}>
            {job.openings} {job.openings === 1 ? 'opening' : 'openings'}
          </MetaItem>
          <MetaItem icon={CalendarDays}>Posted {formatDate(postedAt)}</MetaItem>
          <MetaItem icon={Users}>
            {job.applicationCount} {job.applicationCount === 1 ? 'applicant' : 'applicants'}
          </MetaItem>
        </div>
      </CardContent>
    </Card>
  );
}

/** Skeleton preserving the details layout while the job loads. */
function JobDetailsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden={true}>
      <Skeleton className="h-5 w-28" />
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-2/3" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-10 rounded-md" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Error state with a retry action and a route back to browsing. */
function JobDetailsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <BackButton fallback={ROUTES.CANDIDATE.JOBS} label="Back to jobs" />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-h2 text-foreground">We couldn&apos;t load this job</h1>
            <p className="text-small text-foreground-muted">
              Something went wrong while fetching the job details. Please try again.
            </p>
          </div>
          <Button onClick={onRetry}>Try again</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Candidate-facing job details page with an inline apply workflow. */
export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError, refetch } = useGetJobQuery(id ?? '', { skip: !id });
  const { application } = useJobApplicationStatus(job?.id ?? '');

  if (!id) {
    return <JobDetailsError onRetry={() => undefined} />;
  }

  if (isLoading) {
    return <JobDetailsSkeleton />;
  }

  if (isError || !job) {
    return <JobDetailsError onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <BackButton fallback={ROUTES.CANDIDATE.JOBS} label="Back to jobs" />

      <JobHeaderCard job={job} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="shadow-elevation-low">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-body text-foreground-secondary">
                {job.description}
              </p>
            </CardContent>
          </Card>

          <SkillsCard job={job} />
        </div>

        <aside aria-label="Application">
          <ApplyCard job={job} application={application} />
        </aside>
      </div>
    </div>
  );
}
