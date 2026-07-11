import { Bell, Building2, KeyRound, Palette, TriangleAlert, UserCircle, Users } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { ROUTES } from '@/constants/routes';
import { AccountSummarySection } from '@/features/settings/components/AccountSummarySection';
import { AppearanceSection } from '@/features/settings/components/AppearanceSection';
import { ChangePasswordForm } from '@/features/settings/components/ChangePasswordForm';
import { ComingSoonCard } from '@/features/settings/components/ComingSoonCard';
import { DangerZoneSection } from '@/features/settings/components/DangerZoneSection';
import { NotificationsSection } from '@/features/settings/components/NotificationsSection';
import { OrganizationForm } from '@/features/settings/components/OrganizationForm';
import { SettingsTabs, type SettingsTabItem } from '@/features/settings/components/SettingsTabs';
import { HR_NOTIFICATION_OPTIONS } from '@/features/settings/constants/settings.constants';

const TABS: SettingsTabItem[] = [
  { value: 'organization', label: 'Organization', icon: Building2, content: <OrganizationForm /> },
  {
    value: 'profile',
    label: 'Profile',
    icon: UserCircle,
    content: <AccountSummarySection profilePath={ROUTES.HR.PROFILE} />,
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    content: <NotificationsSection options={HR_NOTIFICATION_OPTIONS} />,
  },
  { value: 'security', label: 'Security', icon: KeyRound, content: <ChangePasswordForm /> },
  { value: 'appearance', label: 'Appearance', icon: Palette, content: <AppearanceSection /> },
  {
    value: 'team',
    label: 'Team',
    icon: Users,
    content: (
      <ComingSoonCard
        title="Team"
        description="Invite colleagues and manage recruiter access."
        icon={Users}
        detail="Inviting team members and managing roles will be available soon."
      />
    ),
  },
  { value: 'danger', label: 'Danger zone', icon: TriangleAlert, content: <DangerZoneSection /> },
];

/** HR settings page: organization, profile, notifications, security, appearance, and danger zone. */
export default function HrSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your organization, notifications, and account."
      />
      <SettingsTabs items={TABS} defaultValue="organization" ariaLabel="Settings sections" />
    </div>
  );
}
