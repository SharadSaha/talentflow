import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Optional chart-token colour accent for a tag. */
export type TagColor = 'chart-1' | 'chart-2' | 'chart-3' | 'chart-4' | 'chart-5';

const COLOR_CLASS: Record<TagColor, string> = {
  'chart-1': 'bg-chart-1/10 text-chart-1',
  'chart-2': 'bg-chart-2/10 text-chart-2',
  'chart-3': 'bg-chart-3/10 text-chart-3',
  'chart-4': 'bg-chart-4/10 text-chart-4',
  'chart-5': 'bg-chart-5/10 text-chart-5',
};

export interface TagProps {
  children: ReactNode;
  /** Applies a chart-token accent colour instead of the muted default. */
  color?: TagColor;
  className?: string;
}

/** A simple, non-interactive label tag. */
export function Tag({ children, color, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs',
        color ? COLOR_CLASS[color] : 'bg-muted text-foreground-secondary',
        className,
      )}
    >
      {children}
    </span>
  );
}
