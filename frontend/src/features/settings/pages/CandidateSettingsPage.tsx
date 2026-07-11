import { Bell, Briefcase, KeyRound, Link2, Palette, ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { AppearanceSection } from '@/features/settings/components/AppearanceSection';
import { ChangePasswordForm } from '@/features/settings/components/ChangePasswordForm';
import { ComingSoonCard } from '@/features/settings/components/ComingSoonCard';
import { JobSeekingPreferencesSection } from '@/features/settings/components/JobSeekingPreferencesSection';
import { NotificationsSection } from '@/features/settings/components/NotificationsSection';
import { PrivacySection } from '@/features/settings/components/PrivacySection';
import { SettingsTabs, type SettingsTabItem } from '@/features/settings/components/SettingsTabs';
import { CANDIDATE_NOTIFICATION_OPTIONS } from '@/features/settings/constants/settings.constants';

const TABS: SettingsTabItem[] = [
  {
    value: 'preferences',
    label: 'Preferences',
    icon: Briefcase,
    content: <JobSeekingPreferencesSection />,
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    content: <NotificationsSection options={CANDIDATE_NOTIFICATION_OPTIONS} />,
  },
  { value: 'privacy', label: 'Privacy', icon: ShieldCheck, content: <PrivacySection /> },
  { value: 'appearance', label: 'Appearance', icon: Palette, content: <AppearanceSection /> },
  { value: 'security', label: 'Security', icon: KeyRound, content: <ChangePasswordForm /> },
  {
    value: 'connected',
    label: 'Connected accounts',
    icon: Link2,
    content: (
      <ComingSoonCard
        title="Connected accounts"
        description="Link third-party accounts to speed up applications."
        icon={Link2}
        detail="Connecting accounts like Google, GitHub, and LinkedIn will be available soon."
      />
    ),
  },
];

/** Candidate settings page: preferences, notifications, privacy, appearance, and security. */
export default function CandidateSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your preferences, privacy, and account." />
      <SettingsTabs items={TABS} defaultValue="preferences" ariaLabel="Settings sections" />
    </div>
  );
}
