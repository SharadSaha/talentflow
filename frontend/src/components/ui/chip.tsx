import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ChipProps {
  label: ReactNode;
  /** When provided, renders a remove button that invokes this callback. */
  onRemove?: () => void;
  /** Optional leading icon element. */
  icon?: ReactNode;
  className?: string;
}

/** A compact, optionally removable token — used for active filters/selections. */
export function Chip({ label, onRemove, icon, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-foreground',
        className,
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={typeof label === 'string' ? `Remove ${label}` : 'Remove'}
          className="-mr-1 flex items-center justify-center rounded-full text-foreground-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}
