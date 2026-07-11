import { cn } from '@/lib/utils';

interface SidebarBadgeProps {
  /** Numeric count or short label. */
  children: React.ReactNode;
  /** Muted styling for informational badges (e.g. "Soon"). */
  muted?: boolean;
  className?: string;
}

/** A compact count/label badge shown alongside a sidebar item (expanded mode). */
export function SidebarBadge({ children, muted = false, className }: SidebarBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums',
        muted ? 'bg-muted text-foreground-muted' : 'bg-primary/15 text-primary',
        className,
      )}
    >
      {children}
    </span>
  );
}

interface SidebarDotProps {
  /** Accessible description of what the dot indicates. */
  label: string;
  className?: string;
}

/** A small notification dot used when the sidebar is collapsed or as an accent. */
export function SidebarDot({ label, className }: SidebarDotProps) {
  return (
    <span className={cn('relative flex size-2', className)} role="status" aria-label={label}>
      <span className="absolute inline-flex size-full rounded-full bg-primary/40" />
      <span className="relative inline-flex size-2 rounded-full bg-primary" />
    </span>
  );
}
