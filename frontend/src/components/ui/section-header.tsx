import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned action controls. */
  actions?: ReactNode;
  className?: string;
}

/** A compact heading block for sections within a page or card. */
export function SectionHeader({ title, description, actions, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-h3">{title}</h3>
        {description ? <p className="text-small text-foreground-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
