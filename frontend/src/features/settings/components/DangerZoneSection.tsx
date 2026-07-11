import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from '@/components/ui/sonner';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { SettingsSection } from '@/features/settings/components/SettingsSection';

/**
 * A clearly-styled destructive settings area. The delete flow is fully wired
 * (confirmation dialog, accessible actions), but as the backend exposes no
 * account-deletion endpoint yet, confirming surfaces an informative toast rather
 * than mutating data.
 */
export function DangerZoneSection() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirmDelete = () => {
    setIsConfirmOpen(false);
    toast.info('Account deletion is not available in this environment yet.');
  };

  return (
    <>
      <SettingsSection
        title="Danger zone"
        description="Irreversible actions that affect your entire account."
        icon={TriangleAlert}
        tone="danger"
      >
        <SettingsRow
          label="Delete account"
          description="Permanently delete your account and all associated data. This cannot be undone."
          control={({ controlId, descriptionId }) => (
            <Button
              id={controlId}
              type="button"
              variant="destructive"
              aria-describedby={descriptionId}
              onClick={() => setIsConfirmOpen(true)}
            >
              Delete account
            </Button>
          )}
        />
      </SettingsSection>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete your account?"
        description="This permanently deletes your account and all associated data. This action cannot be undone."
        confirmLabel="Delete account"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
