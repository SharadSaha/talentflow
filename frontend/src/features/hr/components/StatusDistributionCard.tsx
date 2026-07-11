import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_META, type ApplicationStatus } from '@/constants/application-status';
import type { ApplicationStatusBreakdown } from '@/types/dashboard';
import { formatNumber } from '@/utils/format';

interface StatusDistributionCardProps {
  breakdown: ApplicationStatusBreakdown;
  total: number;
}

/**
 * Lists every application status that has at least one applicant, with a badge,
 * a count, and a proportion bar relative to the total applicant pool.
 */
export function StatusDistributionCard({ breakdown, total }: StatusDistributionCardProps) {
  const entries = (Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[])
    .map((status) => ({ status, count: breakdown[status] }))
    .filter((entry) => entry.count > 0);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-h3">Application status distribution</h2>
        <CardDescription>How applicants are spread across every status.</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <ul className="space-y-4">
            {entries.map(({ status, count }) => {
              const meta = APPLICATION_STATUS_META[status];
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <li key={status} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge intent={meta.intent} label={meta.label} />
                    <span className="text-small font-semibold tabular-nums text-foreground">
                      {formatNumber(count)}
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    aria-label={`${meta.label}: ${percent}% of applicants`}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No applicants yet"
            description="Once candidates apply, their status distribution appears here."
          />
        )}
      </CardContent>
    </Card>
  );
}
