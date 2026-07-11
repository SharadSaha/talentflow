import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { APPLICATION_STATUS, APPLICATION_STATUS_META } from '@/constants/application-status';
import type { ApplicationStatusBreakdown } from '@/types/dashboard';
import { formatNumber } from '@/utils/format';

interface HiringFunnelCardProps {
  breakdown: ApplicationStatusBreakdown;
}

/** Ordered pipeline stages shown in the funnel, top of pipeline first. */
const FUNNEL_STAGES = [
  APPLICATION_STATUS.APPLIED,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFERED,
  APPLICATION_STATUS.HIRED,
] as const;

/**
 * A horizontal-bar view of the recruiting pipeline. Each stage's bar is scaled
 * against the busiest stage so the drop-off between stages is easy to read. The
 * visible label and count carry the data; the bar is decorative.
 */
export function HiringFunnelCard({ breakdown }: HiringFunnelCardProps) {
  const stages = FUNNEL_STAGES.map((status) => ({
    status,
    label: APPLICATION_STATUS_META[status].label,
    count: breakdown[status],
  }));
  const max = Math.max(1, ...stages.map((stage) => stage.count));

  return (
    <Card className="bg-widget-glow shadow-elevation-low">
      <CardHeader>
        <h2 className="text-h3">Hiring funnel</h2>
        <CardDescription>Applicants at each stage of the pipeline.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {stages.map((stage) => {
            const width = `${Math.round((stage.count / max) * 100)}%`;
            return (
              <li key={stage.status} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-small font-medium text-foreground-secondary">
                    {stage.label}
                  </span>
                  <span className="text-small font-semibold tabular-nums text-foreground">
                    {formatNumber(stage.count)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-slow ease-emphasized"
                    style={{ width }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
