import { forwardRef } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import { Sparkline } from '@/components/ui/sparkline';
import { cn } from '@/lib/utils';

/** Visual accent applied to the icon chip and sparkline. */
export type MetricAccent = 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface MetricTrend {
  direction: TrendDirection;
  /** Pre-formatted delta, e.g. "+12%". */
  value: string;
  /** Optional comparison caption, e.g. "vs. last week". */
  label?: string;
}

export interface MetricWidgetProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  /** Supporting caption beneath the value. */
  hint?: string;
  trend?: MetricTrend;
  /** Optional mini trend visualisation. */
  sparkline?: number[];
  accent?: MetricAccent;
}

const ACCENT_STYLES: Record<MetricAccent, { chip: string; spark: string }> = {
  primary: { chip: 'bg-primary/10 text-primary', spark: 'text-primary' },
  success: { chip: 'bg-success/10 text-success', spark: 'text-success' },
  warning: { chip: 'bg-warning/15 text-warning', spark: 'text-warning' },
  danger: { chip: 'bg-danger/10 text-danger', spark: 'text-danger' },
  info: { chip: 'bg-info/10 text-info', spark: 'text-info' },
};

const TREND_STYLES: Record<TrendDirection, { icon: typeof ArrowUpRight; className: string }> = {
  up: { icon: ArrowUpRight, className: 'text-success' },
  down: { icon: ArrowDownRight, className: 'text-danger' },
  neutral: { icon: Minus, className: 'text-foreground-muted' },
};

/**
 * A richer replacement for the plain stat tile: icon, metric, trend delta,
 * comparison caption, and an optional sparkline. Presentational only — callers
 * pass already-formatted values and deltas.
 */
export const MetricWidget = forwardRef<HTMLDivElement, MetricWidgetProps>(function MetricWidget(
  { className, label, value, icon: Icon, hint, trend, sparkline, accent = 'primary', ...props },
  ref,
) {
  const accentStyle = ACCENT_STYLES[accent];
  const trendStyle = trend ? TREND_STYLES[trend.direction] : null;
  const TrendIcon = trendStyle?.icon;

  return (
    <div
      ref={ref}
      className={cn(
        'surface-widget surface-widget-interactive group relative overflow-hidden p-5',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-small font-medium text-foreground-muted">{label}</p>
        {Icon ? (
          <span
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-md transition-transform duration-normal ease-emphasized group-hover:scale-105',
              accentStyle.chip,
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-h2 font-semibold tabular-nums text-foreground">{value}</p>
        {sparkline && sparkline.length > 1 ? (
          <Sparkline data={sparkline} className={cn('h-8 w-20 shrink-0', accentStyle.spark)} />
        ) : null}
      </div>

      {trend || hint ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          {trend && TrendIcon ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-small font-medium tabular-nums',
                trendStyle?.className,
              )}
            >
              <TrendIcon className="size-3.5" aria-hidden="true" />
              {trend.value}
            </span>
          ) : null}
          {hint || trend?.label ? (
            <span className="text-caption text-foreground-muted">{hint ?? trend?.label}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
