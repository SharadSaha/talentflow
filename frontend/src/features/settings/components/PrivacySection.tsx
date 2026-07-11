import { ShieldCheck } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { PRIVACY_OPTIONS } from '@/features/settings/constants/settings.constants';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { SettingsToggleRow } from '@/features/settings/components/SettingsToggleRow';
import { useUserPreferences } from '@/features/settings/hooks/useUserPreferences';

/**
 * Candidate privacy settings. Config-driven visibility toggles persisted locally
 * through `useUserPreferences`.
 */
export function PrivacySection() {
  const { preferences, updateSection } = useUserPreferences();

  return (
    <SettingsSection
      title="Privacy"
      description="Control who can see your profile and how you appear in search."
      icon={ShieldCheck}
      contentClassName="space-y-0"
    >
      {PRIVACY_OPTIONS.map((option, index) => (
        <div key={option.key}>
          {index > 0 ? <Separator className="my-4" /> : null}
          <SettingsToggleRow
            label={option.label}
            description={option.description}
            checked={preferences.privacy[option.key]}
            onCheckedChange={(checked) => updateSection('privacy', { [option.key]: checked })}
          />
        </div>
      ))}
    </SettingsSection>
  );
}
