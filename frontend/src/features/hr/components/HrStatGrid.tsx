import {
  Archive,
  Briefcase,
  BriefcaseBusiness,
  CalendarClock,
  FilePen,
  Send,
  UserCheck,
  Users,
} from 'lucide-react';

import { MetricWidget, type MetricAccent } from '@/components/ui/metric-widget';
import { APPLICATION_STATUS } from '@/constants/application-status';
import type { HrDashboard } from '@/types/hr-dashboard';
import { formatNumber } from '@/utils/format';

interface HrStatGridProps {
  dashboard: HrDashboard;
}

interface HrMetric {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: MetricAccent;
}

/**
 * The headline metric widgets for the HR dashboard. Draft jobs are derived
 * (`totalJobs − activeJobs − closedJobs`) and the interview/offer/hire figures
 * come straight from the per-status applicant breakdown.
 */
export function HrStatGrid({ dashboard }: HrStatGridProps) {
  const { totalJobs, activeJobs, closedJobs, totalApplicants, applicantStatusBreakdown } =
    dashboard;
  const draftJobs = Math.max(0, totalJobs - activeJobs - closedJobs);

  const stats: HrMetric[] = [
    {
      label: 'Total jobs',
      value: totalJobs,
      hint: 'Across your workspace',
      icon: Briefcase,
      accent: 'primary',
    },
    {
      label: 'Active jobs',
      value: activeJobs,
      hint: 'Live and accepting applicants',
      icon: BriefcaseBusiness,
      accent: 'success',
    },
    {
      label: 'Closed jobs',
      value: closedJobs,
      hint: 'No longer accepting',
      icon: Archive,
      accent: 'info',
    },
    {
      label: 'Draft jobs',
      value: draftJobs,
      hint: 'Awaiting publication',
      icon: FilePen,
      accent: 'warning',
    },
    {
      label: 'Total applicants',
      value: totalApplicants,
      hint: 'All-time submissions',
      icon: Users,
      accent: 'primary',
    },
    {
      label: 'Interviews',
      value: applicantStatusBreakdown[APPLICATION_STATUS.INTERVIEW],
      hint: 'Currently in progress',
      icon: CalendarClock,
      accent: 'info',
    },
    {
      label: 'Offers',
      value: applicantStatusBreakdown[APPLICATION_STATUS.OFFERED],
      hint: 'Extended to candidates',
      icon: Send,
      accent: 'warning',
    },
    {
      label: 'Hires',
      value: applicantStatusBreakdown[APPLICATION_STATUS.HIRED],
      hint: 'Successfully filled',
      icon: UserCheck,
      accent: 'success',
    },
  ];

  return (
    <section aria-labelledby="hr-overview-heading">
      <h2 id="hr-overview-heading" className="sr-only">
        Key metrics
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <MetricWidget
            key={stat.label}
            label={stat.label}
            value={formatNumber(stat.value)}
            hint={stat.hint}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>
    </section>
  );
}
