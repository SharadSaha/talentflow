import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BadgeIntent } from '@/types/status';

/** Maps a semantic status intent to the corresponding badge variant. */
const INTENT_VARIANT: Record<
  BadgeIntent,
  'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
> = {
  neutral: 'neutral',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
};

export interface StatusBadgeProps {
  /** Semantic intent driving the badge colour. */
  intent: BadgeIntent;
  /** Human-readable status label. */
  label: string;
  className?: string;
}

/** A badge that communicates a record's status with a leading status dot. */
export function StatusBadge({ intent, label, className }: StatusBadgeProps) {
  return (
    <Badge variant={INTENT_VARIANT[intent]} className={cn('gap-1.5', className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
