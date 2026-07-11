import { MapPin } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/format';

type OrganizationBadgeSize = 'sm' | 'md' | 'lg';

interface OrganizationBadgeSizeStyles {
  logo: string;
  fallback: string;
  name: string;
}

/** Per-size visual scale for the logo avatar and organization name. */
const SIZE_STYLES: Record<OrganizationBadgeSize, OrganizationBadgeSizeStyles> = {
  sm: { logo: 'size-8', fallback: 'text-[0.625rem]', name: 'text-small font-medium' },
  md: { logo: 'size-10', fallback: 'text-xs', name: 'text-body font-medium' },
  lg: { logo: 'size-14', fallback: 'text-base', name: 'text-h3' },
};

export interface OrganizationBadgeProps {
  /** Organization / employer name. */
  name: string;
  /** Logo image URL; falls back to the name's initials when absent. */
  logoUrl?: string | null;
  /** Optional location shown beneath the name. */
  location?: string | null;
  /** Visual scale of the badge. */
  size?: OrganizationBadgeSize;
  className?: string;
}

/**
 * A compact organization identity chip: logo (or initials) plus the employer
 * name and an optional location. Reused wherever a job's company or a user's
 * organization needs a consistent, recognisable presence. Presentational only.
 */
export function OrganizationBadge({
  name,
  logoUrl,
  location,
  size = 'md',
  className,
}: OrganizationBadgeProps) {
  const styles = SIZE_STYLES[size];

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2.5', className)}>
      <Avatar className={cn('shrink-0 rounded-md', styles.logo)}>
        {logoUrl ? <AvatarImage src={logoUrl} alt="" /> : null}
        <AvatarFallback className={cn('rounded-md', styles.fallback)}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <span className="flex min-w-0 flex-col leading-tight">
        <span className={cn('truncate text-foreground', styles.name)}>{name}</span>
        {location ? (
          <span className="inline-flex items-center gap-1 truncate text-caption text-foreground-muted">
            <MapPin className="size-3 shrink-0" aria-hidden="true" />
            {location}
          </span>
        ) : null}
      </span>
    </span>
  );
}
