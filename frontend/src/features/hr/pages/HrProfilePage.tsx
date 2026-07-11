import { Mail, ShieldCheck } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { DescriptionList, DescriptionListItem } from '@/components/ui/description-list';
import { USER_ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/date';
import { getInitials } from '@/utils/format';

/**
 * HR account page. The backend exposes candidate profiles only, so this shows
 * the authenticated recruiter's read-only account details from the session.
 */
export default function HrProfilePage() {
  const { user, role } = useAuth();

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your TalentFlow account details." />

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="size-14">
            <AvatarFallback className="text-base">{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate">{fullName}</CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-small text-foreground-muted">
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3.5" aria-hidden="true" />
                {user.email}
              </span>
              {role ? (
                <Badge variant="primary" className="gap-1">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {USER_ROLE_LABELS[role]}
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DescriptionList>
            <DescriptionListItem term="First name">{user.firstName}</DescriptionListItem>
            <DescriptionListItem term="Last name">{user.lastName}</DescriptionListItem>
            <DescriptionListItem term="Email">{user.email}</DescriptionListItem>
            <DescriptionListItem term="Role">
              {role ? USER_ROLE_LABELS[role] : '—'}
            </DescriptionListItem>
            <DescriptionListItem term="Member since">
              {formatDate(user.createdAt)}
            </DescriptionListItem>
          </DescriptionList>
        </CardContent>
      </Card>
    </div>
  );
}
