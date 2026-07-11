import { Palette } from 'lucide-react';

import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { ThemePicker } from '@/features/settings/components/ThemePicker';

/**
 * Appearance settings. Lets the user choose light, dark, or system themes via the
 * visual {@link ThemePicker}. Shared unchanged between candidate and HR portals.
 */
export function AppearanceSection() {
  return (
    <SettingsSection
      title="Appearance"
      description="Choose how TalentFlow looks. System matches your device settings."
      icon={Palette}
    >
      <ThemePicker />
    </SettingsSection>
  );
}
