import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { APPLICATION_STATUS_META, type ApplicationStatus } from '@/constants/application-status';
import type { ApplicationStatusBreakdown } from '@/types/dashboard';
import { formatNumber } from '@/utils/format';

interface StatusSummaryCardProps {
  byStatus: ApplicationStatusBreakdown;
}

/** Lists each application status the candidate currently has, with counts. */
export function StatusSummaryCard({ byStatus }: StatusSummaryCardProps) {
  const entries = (Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[])
    .map((status) => ({ status, count: byStatus[status] }))
    .filter((entry) => entry.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application status</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <ul className="space-y-1">
            {entries.map(({ status, count }) => {
              const meta = APPLICATION_STATUS_META[status];
              return (
                <li
                  key={status}
                  className="flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-surface-hover"
                >
                  <StatusBadge intent={meta.intent} label={meta.label} />
                  <span className="text-body font-semibold tabular-nums text-foreground">
                    {formatNumber(count)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="No applications yet"
            description="Your application statuses will appear here once you apply."
          />
        )}
      </CardContent>
    </Card>
  );
}
