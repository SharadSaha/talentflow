import { Briefcase } from 'lucide-react';
import { useId } from 'react';

import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import { EMPLOYMENT_TYPE, EMPLOYMENT_TYPE_OPTIONS, type EmploymentType } from '@/constants/job';
import { LocationTagInput } from '@/features/settings/components/LocationTagInput';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { SettingsToggleRow } from '@/features/settings/components/SettingsToggleRow';
import { useUserPreferences } from '@/features/settings/hooks/useUserPreferences';

const VALID_EMPLOYMENT_TYPES = new Set<string>(Object.values(EMPLOYMENT_TYPE));

/** Narrows raw multi-select values to the known employment-type union. */
function toEmploymentTypes(values: string[]): EmploymentType[] {
  return values.filter((value): value is EmploymentType => VALID_EMPLOYMENT_TYPES.has(value));
}

/**
 * Candidate job-seeking preferences persisted locally: open-to-work status,
 * preferred employment types, and preferred locations. Each change is saved
 * immediately through `useUserPreferences`.
 */
export function JobSeekingPreferencesSection() {
  const { preferences, updateSection } = useUserPreferences();
  const { jobSeeking } = preferences;
  const employmentTypesId = useId();
  const locationsId = useId();

  return (
    <SettingsSection
      title="Job preferences"
      description="Tell us what you are looking for so we can surface the most relevant roles."
      icon={Briefcase}
      contentClassName="space-y-6"
    >
      <SettingsToggleRow
        label="Open to work"
        description="Let recruiters know you are actively looking for new opportunities."
        checked={jobSeeking.isOpenToWork}
        onCheckedChange={(checked) => updateSection('jobSeeking', { isOpenToWork: checked })}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor={employmentTypesId}>Preferred employment types</Label>
        <MultiSelect
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={jobSeeking.employmentTypes}
          onValueChange={(values) =>
            updateSection('jobSeeking', { employmentTypes: toEmploymentTypes(values) })
          }
          placeholder="Select employment types…"
          searchPlaceholder="Search types…"
          className="max-w-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={locationsId}>Preferred locations</Label>
        <div className="max-w-md">
          <LocationTagInput
            inputId={locationsId}
            value={jobSeeking.preferredLocations}
            onChange={(locations) => updateSection('jobSeeking', { preferredLocations: locations })}
          />
        </div>
      </div>
    </SettingsSection>
  );
}
