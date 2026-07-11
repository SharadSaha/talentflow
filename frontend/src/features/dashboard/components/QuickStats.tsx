import { Award, Bookmark, FileText, Search } from 'lucide-react';

import { StatCard } from '@/components/ui/stat-card';
import { APPLICATION_STATUS } from '@/constants/application-status';
import type { CandidateDashboard } from '@/types/dashboard';
import { formatNumber } from '@/utils/format';

interface QuickStatsProps {
  applicationCounts: CandidateDashboard['applicationCounts'];
  savedCount: number;
}

/**
 * The four headline metrics. "In review" and "Offers" aggregate the relevant
 * lifecycle statuses so the candidate sees momentum at a glance.
 */
export function QuickStats({ applicationCounts, savedCount }: QuickStatsProps) {
  const { total, byStatus } = applicationCounts;

  const inReview =
    byStatus[APPLICATION_STATUS.UNDER_REVIEW] +
    byStatus[APPLICATION_STATUS.SHORTLISTED] +
    byStatus[APPLICATION_STATUS.INTERVIEW];

  const offers = byStatus[APPLICATION_STATUS.OFFERED] + byStatus[APPLICATION_STATUS.HIRED];

  return (
    <section aria-label="Overview" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total applications" value={formatNumber(total)} icon={FileText} />
      <StatCard label="In review" value={formatNumber(inReview)} icon={Search} />
      <StatCard label="Offers" value={formatNumber(offers)} icon={Award} />
      <StatCard label="Saved jobs" value={formatNumber(savedCount)} icon={Bookmark} />
    </section>
  );
}
