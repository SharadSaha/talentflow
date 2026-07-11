import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { SettingsSection } from '@/features/settings/components/SettingsSection';

export interface ComingSoonCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  /** Short explanation of what this section will offer once available. */
  detail: string;
}

/**
 * A tasteful placeholder for settings areas that are not yet available. Presents
 * the section header with a "Coming soon" badge and a muted, disabled-looking
 * body so the intent is clear without implying broken functionality.
 */
export function ComingSoonCard({ title, description, icon, detail }: ComingSoonCardProps) {
  return (
    <SettingsSection
      title={title}
      description={description}
      icon={icon}
      actions={<Badge variant="neutral">Coming soon</Badge>}
    >
      <div
        aria-disabled="true"
        className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center"
      >
        <p className="text-small text-foreground-muted">{detail}</p>
      </div>
    </SettingsSection>
  );
}
