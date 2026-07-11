import { UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { OrganizationBadge } from '@/components/OrganizationBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { USER_ROLE_LABELS } from '@/constants/roles';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/utils/format';

export interface AccountSummarySectionProps {
  /** Destination of the "View profile" link (role-specific profile route). */
  profilePath: string;
}

/**
 * A compact account summary sourced from the authenticated session, with a link
 * to the full profile page. Used on the settings "Profile" tab so account
 * details and the deeper profile view stay one click apart.
 */
export function AccountSummarySection({ profilePath }: AccountSummarySectionProps) {
  const { user, role } = useAuth();

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <SettingsSection
      title="Profile"
      description="Your TalentFlow account. Manage the full profile from the profile page."
      icon={UserCircle}
      actions={
        <Button asChild variant="outline">
          <Link to={profilePath}>View profile</Link>
        </Button>
      }
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-foreground">{fullName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-small text-foreground-muted">
            <span className="truncate">{user.email}</span>
            {role ? <Badge variant="primary">{USER_ROLE_LABELS[role]}</Badge> : null}
          </div>
          {user.organizationName ? (
            <OrganizationBadge name={user.organizationName} size="sm" className="mt-3" />
          ) : null}
        </div>
      </div>
    </SettingsSection>
  );
}
