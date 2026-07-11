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

import { StatCard } from '@/components/ui/stat-card';
import { APPLICATION_STATUS } from '@/constants/application-status';
import type { HrDashboard } from '@/types/hr-dashboard';
import { formatNumber } from '@/utils/format';

interface HrStatGridProps {
  dashboard: HrDashboard;
}

/**
 * The headline metric tiles for the HR dashboard. Draft jobs are derived
 * (`totalJobs − activeJobs − closedJobs`) and the interview/offer/hire figures
 * come straight from the per-status applicant breakdown.
 */
export function HrStatGrid({ dashboard }: HrStatGridProps) {
  const { totalJobs, activeJobs, closedJobs, totalApplicants, applicantStatusBreakdown } =
    dashboard;
  const draftJobs = Math.max(0, totalJobs - activeJobs - closedJobs);

  const stats: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { label: 'Total jobs', value: totalJobs, icon: Briefcase },
    { label: 'Active jobs', value: activeJobs, icon: BriefcaseBusiness },
    { label: 'Closed jobs', value: closedJobs, icon: Archive },
    { label: 'Draft jobs', value: draftJobs, icon: FilePen },
    { label: 'Total applicants', value: totalApplicants, icon: Users },
    {
      label: 'Interviews',
      value: applicantStatusBreakdown[APPLICATION_STATUS.INTERVIEW],
      icon: CalendarClock,
    },
    {
      label: 'Offers',
      value: applicantStatusBreakdown[APPLICATION_STATUS.OFFERED],
      icon: Send,
    },
    {
      label: 'Hires',
      value: applicantStatusBreakdown[APPLICATION_STATUS.HIRED],
      icon: UserCheck,
    },
  ];

  return (
    <section aria-labelledby="hr-overview-heading">
      <h2 id="hr-overview-heading" className="sr-only">
        Key metrics
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={formatNumber(stat.value)}
            icon={stat.icon}
          />
        ))}
      </div>
    </section>
  );
}
