import type { ReactNode } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DescriptionList, DescriptionListItem } from '@/components/ui/description-list';
import { EDUCATION_LEVEL_LABELS, PROFICIENCY_LEVEL_LABELS } from '@/constants/education';
import { SALARY_PERIOD } from '@/constants/job';
import type { CandidateProfile, ProfileEducation, ProfileSkill } from '@/types/profile';
import { getInitials } from '@/utils/format';
import { formatExperienceMonths, formatSalaryRange } from '@/utils/job-format';

const EMPTY = '—';

interface ProfileViewProps {
  profile: CandidateProfile;
}

/** Read-only presentation of a candidate's profile, grouped into sections. */
export function ProfileView({ profile }: ProfileViewProps) {
  const { user } = profile;
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const salary = formatSalaryRange(
    profile.expectedSalaryMin,
    profile.expectedSalaryMax,
    profile.salaryCurrency,
    SALARY_PERIOD.YEARLY,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <Avatar size="lg" className="size-14">
            <AvatarFallback className="text-base">{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-h3 text-foreground">{fullName}</h2>
              <Badge variant={profile.isOpenToWork ? 'success' : 'neutral'}>
                {profile.isOpenToWork ? 'Open to work' : 'Not looking'}
              </Badge>
            </div>
            <p className="text-small text-foreground-secondary">
              {profile.headline ?? 'No headline yet'}
            </p>
            <p className="text-small text-foreground-muted">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Section title="About">
        <p className="whitespace-pre-line text-sm text-foreground">
          {profile.about?.trim() ? profile.about : 'No summary added yet.'}
        </p>
      </Section>

      <Section title="Professional">
        <DescriptionList>
          <DescriptionListItem term="Current title">
            {display(profile.currentTitle)}
          </DescriptionListItem>
          <DescriptionListItem term="Current company">
            {display(profile.currentCompany)}
          </DescriptionListItem>
          <DescriptionListItem term="Total experience">
            {formatExperienceMonths(profile.totalExperienceMonths)}
          </DescriptionListItem>
          <DescriptionListItem term="Highest education">
            {profile.highestEducation ? EDUCATION_LEVEL_LABELS[profile.highestEducation] : EMPTY}
          </DescriptionListItem>
          <DescriptionListItem term="Expected salary">{salary ?? EMPTY}</DescriptionListItem>
          <DescriptionListItem term="Notice period">
            {profile.noticePeriodDays !== null ? `${profile.noticePeriodDays} days` : EMPTY}
          </DescriptionListItem>
          <DescriptionListItem term="Resume">
            {profile.resumeUrl ? (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link break-all"
              >
                View resume
              </a>
            ) : (
              EMPTY
            )}
          </DescriptionListItem>
        </DescriptionList>
      </Section>

      <Section title="Personal">
        <DescriptionList>
          <DescriptionListItem term="Phone">{display(profile.phone)}</DescriptionListItem>
          <DescriptionListItem term="Current location">
            {display(profile.currentLocation)}
          </DescriptionListItem>
          <DescriptionListItem term="Preferred location">
            {display(profile.preferredLocation)}
          </DescriptionListItem>
        </DescriptionList>
      </Section>

      <Section title="Skills">
        {profile.skills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <li key={skill.id}>
                <SkillBadge skill={skill} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-foreground-muted">No skills added yet.</p>
        )}
      </Section>

      <Section title="Education">
        {profile.education.length > 0 ? (
          <ul className="space-y-4">
            {profile.education.map((entry) => (
              <li key={entry.id}>
                <EducationItem entry={entry} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-small text-foreground-muted">No education added yet.</p>
        )}
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

/** A titled card section within the profile view. */
function Section({ title, children }: SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** A single read-only skill badge with its proficiency, when known. */
function SkillBadge({ skill }: { skill: ProfileSkill }) {
  const proficiency = skill.proficiency ? PROFICIENCY_LEVEL_LABELS[skill.proficiency] : null;
  return (
    <Badge variant="primary">
      {skill.name}
      {proficiency ? <span className="text-foreground-muted">· {proficiency}</span> : null}
    </Badge>
  );
}

/** A single read-only education entry. */
function EducationItem({ entry }: { entry: ProfileEducation }) {
  const period = formatEducationPeriod(entry.startYear, entry.endYear);
  const detail = [entry.degree, entry.fieldOfStudy].filter(Boolean).join(', ');

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-medium text-foreground">{entry.institution}</p>
      <p className="text-small text-foreground-secondary">
        {[EDUCATION_LEVEL_LABELS[entry.level], detail].filter(Boolean).join(' · ')}
      </p>
      {(period || entry.grade) && (
        <p className="text-caption text-foreground-muted">
          {[period, entry.grade ? `Grade: ${entry.grade}` : null].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}

/** Formats an education period as "2018 – 2022", "2018 – Present", or a year. */
function formatEducationPeriod(startYear: number | null, endYear: number | null): string {
  if (startYear === null && endYear === null) return '';
  if (startYear !== null && endYear !== null) return `${startYear} – ${endYear}`;
  if (startYear !== null) return `${startYear} – Present`;
  return String(endYear);
}

/** Returns the value or an em dash placeholder for empty fields. */
function display(value: string | null): string {
  return value?.trim() ? value : EMPTY;
}
