import { Waypoints } from 'lucide-react';

import { env } from '@/config/env';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Hides the wordmark, showing only the icon (e.g. a collapsed sidebar). */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Application wordmark: a primary-tinted icon badge plus the app name. Purely
 * presentational and used across public, auth, and app shells for a consistent
 * brand anchor.
 */
export function Logo({ iconOnly = false, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Waypoints className="size-4" aria-hidden="true" />
      </span>
      {!iconOnly ? (
        <span className="text-base font-semibold tracking-tight text-foreground">
          {env.appName}
        </span>
      ) : null}
    </span>
  );
}
