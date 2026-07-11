import { Download, PencilLine } from 'lucide-react';
import { useState } from 'react';

import { APPLICATION_STATUS_META } from '@/constants/application-status';
import { EDUCATION_LEVEL_LABELS } from '@/constants/education';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DescriptionList, DescriptionListItem } from '@/components/ui/description-list';
import { SectionHeader } from '@/components/ui/section-header';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusUpdateDialog } from '@/features/hr/components/StatusUpdateDialog';
import type { Applicant, ApplicantEducation } from '@/types/applicant';
import { formatDateTime } from '@/utils/date';
import { getInitials } from '@/utils/format';
import { formatExperienceMonths } from '@/utils/job-format';

export interface ApplicantDrawerProps {
  /** The applicant to display, or `null` when nothing is selected. */
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Renders an education entry's degree/field-of-study line, if present. */
function educationSubtitle(entry: ApplicantEducation): string | null {
  const parts = [entry.degree, entry.fieldOfStudy].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

/** Renders an education entry's year range, if present. */
function educationYears(entry: ApplicantEducation): string | null {
  if (entry.startYear && entry.endYear) return `${entry.startYear} – ${entry.endYear}`;
  if (entry.endYear) return `Until ${entry.endYear}`;
  if (entry.startYear) return `From ${entry.startYear}`;
  return null;
}

const EMPTY_VALUE = '—';

/**
 * A right-anchored drawer presenting an applicant's full profile: personal and
 * professional details, education, skills, the application itself, a résumé
 * link, and a lightweight status timeline. The footer opens the status-update
 * flow. Only fields present on the applicant are shown — nothing is fabricated.
 */
export function ApplicantDrawer({ applicant, open, onOpenChange }: ApplicantDrawerProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  if (!applicant) return null;

  const { candidate } = applicant;
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const statusMeta = APPLICATION_STATUS_META[applicant.status];
  const professionalTitle =
    candidate.currentTitle && candidate.currentCompany
      ? `${candidate.currentTitle} @ ${candidate.currentCompany}`
      : (candidate.currentTitle ?? candidate.currentCompany ?? EMPTY_VALUE);
  const educationLabel = candidate.highestEducation
    ? EDUCATION_LEVEL_LABELS[candidate.highestEducation]
    : EMPTY_VALUE;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-6 sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start gap-3 pr-8">
            <Avatar size="lg">
              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <SheetTitle>{fullName}</SheetTitle>
              {candidate.headline ? (
                <SheetDescription>{candidate.headline}</SheetDescription>
              ) : null}
              <div className="mt-1">
                <StatusBadge intent={statusMeta.intent} label={statusMeta.label} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6">
          <section className="flex flex-col gap-3">
            <SectionHeader title="Personal" />
            <DescriptionList>
              <DescriptionListItem term="Email">
                <a
                  href={`mailto:${candidate.email}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {candidate.email}
                </a>
              </DescriptionListItem>
              <DescriptionListItem term="Current location">
                {candidate.currentLocation ?? EMPTY_VALUE}
              </DescriptionListItem>
              <DescriptionListItem term="Preferred location">
                {candidate.preferredLocation ?? EMPTY_VALUE}
              </DescriptionListItem>
            </DescriptionList>
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <SectionHeader title="Professional" />
            <DescriptionList>
              <DescriptionListItem term="Current role">{professionalTitle}</DescriptionListItem>
              <DescriptionListItem term="Experience">
                {formatExperienceMonths(candidate.totalExperienceMonths)}
              </DescriptionListItem>
              <DescriptionListItem term="Highest education">{educationLabel}</DescriptionListItem>
            </DescriptionList>
          </section>

          {candidate.education.length > 0 ? (
            <>
              <Separator />
              <section className="flex flex-col gap-3">
                <SectionHeader title="Education" />
                <ul className="flex flex-col gap-3">
                  {candidate.education.map((entry) => {
                    const subtitle = educationSubtitle(entry);
                    const years = educationYears(entry);
                    return (
                      <li
                        key={entry.id}
                        className="flex flex-col gap-0.5 rounded-md border border-border-subtle p-3"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {entry.institution}
                        </span>
                        {subtitle ? (
                          <span className="text-small text-foreground-secondary">{subtitle}</span>
                        ) : null}
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline">{EDUCATION_LEVEL_LABELS[entry.level]}</Badge>
                          {years ? (
                            <span className="text-caption text-foreground-muted">{years}</span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          ) : null}

          {candidate.skills.length > 0 ? (
            <>
              <Separator />
              <section className="flex flex-col gap-3">
                <SectionHeader title="Skills" />
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill.id} variant="primary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          <Separator />

          <section className="flex flex-col gap-3">
            <SectionHeader title="Application" />
            <DescriptionList>
              <DescriptionListItem term="Applied">
                {formatDateTime(applicant.appliedAt)}
              </DescriptionListItem>
            </DescriptionList>
            {applicant.coverLetter ? (
              <div className="flex flex-col gap-1">
                <span className="text-small text-foreground-muted">Cover letter</span>
                <p className="whitespace-pre-line text-sm text-foreground">
                  {applicant.coverLetter}
                </p>
              </div>
            ) : null}
            {applicant.resumeUrl ? (
              <Button variant="outline" size="sm" className="self-start" asChild>
                <a href={applicant.resumeUrl} target="_blank" rel="noreferrer">
                  <Download aria-hidden="true" />
                  Download résumé
                </a>
              </Button>
            ) : null}
          </section>

          <Separator />

          <section className="flex flex-col gap-3">
            <SectionHeader title="Timeline" />
            <ol className="flex flex-col gap-3">
              <li className="flex items-center justify-between gap-3">
                <Badge variant="neutral">Applied</Badge>
                <span className="text-caption text-foreground-muted">
                  {formatDateTime(applicant.appliedAt)}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <StatusBadge intent={statusMeta.intent} label={statusMeta.label} />
                <span className="text-caption text-foreground-muted">
                  {formatDateTime(applicant.updatedAt)}
                </span>
              </li>
            </ol>
          </section>
        </div>

        <SheetFooter>
          <Button variant="primary" onClick={() => setStatusDialogOpen(true)}>
            <PencilLine aria-hidden="true" />
            Update status
          </Button>
        </SheetFooter>
      </SheetContent>

      <StatusUpdateDialog
        applicant={applicant}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
    </Sheet>
  );
}
