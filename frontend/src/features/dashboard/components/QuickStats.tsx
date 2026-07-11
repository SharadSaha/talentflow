import { Award, Bookmark, FileText, Radar } from 'lucide-react';

import { MetricWidget, type MetricAccent } from '@/components/ui/metric-widget';
import { APPLICATION_STATUS } from '@/constants/application-status';
import type { CandidateDashboard } from '@/types/dashboard';
import { formatNumber } from '@/utils/format';

interface QuickStatsProps {
  applicationCounts: CandidateDashboard['applicationCounts'];
  savedCount: number;
}

interface CandidateMetric {
  label: string;
  value: number;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: MetricAccent;
}

/**
 * The four headline candidate metrics as rich widgets. "In review" and "Offers"
 * aggregate the relevant lifecycle statuses so momentum is visible at a glance.
 */
export function QuickStats({ applicationCounts, savedCount }: QuickStatsProps) {
  const { total, byStatus } = applicationCounts;

  const inReview =
    byStatus[APPLICATION_STATUS.UNDER_REVIEW] +
    byStatus[APPLICATION_STATUS.SHORTLISTED] +
    byStatus[APPLICATION_STATUS.INTERVIEW];

  const offers = byStatus[APPLICATION_STATUS.OFFERED] + byStatus[APPLICATION_STATUS.HIRED];

  const metrics: CandidateMetric[] = [
    {
      label: 'Total applications',
      value: total,
      hint: 'All-time submissions',
      icon: FileText,
      accent: 'primary',
    },
    {
      label: 'In review',
      value: inReview,
      hint: 'Actively being considered',
      icon: Radar,
      accent: 'info',
    },
    {
      label: 'Offers',
      value: offers,
      hint: 'Offers and hires',
      icon: Award,
      accent: 'success',
    },
    {
      label: 'Saved jobs',
      value: savedCount,
      hint: 'Ready to revisit',
      icon: Bookmark,
      accent: 'warning',
    },
  ];

  return (
    <section aria-label="Overview" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricWidget
          key={metric.label}
          label={metric.label}
          value={formatNumber(metric.value)}
          hint={metric.hint}
          icon={metric.icon}
          accent={metric.accent}
        />
      ))}
    </section>
  );
}
