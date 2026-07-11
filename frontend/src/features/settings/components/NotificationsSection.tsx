import { Bell } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { SettingsToggleRow } from '@/features/settings/components/SettingsToggleRow';
import { useUserPreferences } from '@/features/settings/hooks/useUserPreferences';
import type { NotificationOption } from '@/features/settings/types/preferences.types';

export interface NotificationsSectionProps {
  /** The notification rows to render (role-specific configuration). */
  options: NotificationOption[];
}

/**
 * Notification preferences. Renders a config-driven list of toggles persisted
 * locally via `useUserPreferences`. Reused by both portals with a different
 * `options` list. Changes persist immediately (no explicit save needed).
 */
export function NotificationsSection({ options }: NotificationsSectionProps) {
  const { preferences, updateSection } = useUserPreferences();

  return (
    <SettingsSection
      title="Notifications"
      description="Decide which emails and alerts TalentFlow sends you."
      icon={Bell}
      contentClassName="space-y-0"
    >
      {options.map((option, index) => (
        <div key={option.key}>
          {index > 0 ? <Separator className="my-4" /> : null}
          <SettingsToggleRow
            label={option.label}
            description={option.description}
            checked={preferences.notifications[option.key]}
            onCheckedChange={(checked) => updateSection('notifications', { [option.key]: checked })}
          />
        </div>
      ))}
    </SettingsSection>
  );
}
