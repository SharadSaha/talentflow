import { useId, type ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Ids handed to the control so it can be wired to the row label and description. */
export interface SettingsRowControlProps {
  controlId: string;
  descriptionId?: string;
}

export interface SettingsRowProps {
  label: string;
  description?: string;
  /**
   * Renders the control on the trailing edge. Receives the generated ids so the
   * control can associate itself with the row's label (accessible by default).
   */
  control: (props: SettingsRowControlProps) => ReactNode;
  className?: string;
}

/**
 * A single labelled settings control: a label and optional description on the
 * leading edge, the control on the trailing edge. Generates the id/ARIA wiring
 * so every control is programmatically associated with its label.
 */
export function SettingsRow({ label, description, control, className }: SettingsRowProps) {
  const controlId = useId();
  const descriptionId = useId();
  const hasDescription = Boolean(description);

  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5 pr-2">
        <Label htmlFor={controlId} className="cursor-pointer">
          {label}
        </Label>
        {hasDescription ? (
          <p id={descriptionId} className="text-small text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">
        {control({ controlId, descriptionId: hasDescription ? descriptionId : undefined })}
      </div>
    </div>
  );
}
