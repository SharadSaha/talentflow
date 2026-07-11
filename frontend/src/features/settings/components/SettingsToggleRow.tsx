import { Switch } from '@/components/ui/switch';
import { SettingsRow } from '@/features/settings/components/SettingsRow';

export interface SettingsToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * The most common settings control: a labelled on/off toggle. Built on
 * {@link SettingsRow} so the switch is always associated with its label and
 * description. Used across notifications, privacy, and job-seeking preferences.
 */
export function SettingsToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: SettingsToggleRowProps) {
  return (
    <SettingsRow
      label={label}
      description={description}
      control={({ controlId, descriptionId }) => (
        <Switch
          id={controlId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-describedby={descriptionId}
        />
      )}
    />
  );
}
