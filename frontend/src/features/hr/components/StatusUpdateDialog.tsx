import { useState } from 'react';

import {
  APPLICATION_STATUS_META,
  getHrNextStatuses,
  type ApplicationStatus,
} from '@/constants/application-status';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useUpdateApplicationStatusMutation } from '@/features/hr/api/hrApplicantsApi';
import type { Applicant } from '@/types/applicant';
import { getApiErrorMessage } from '@/utils/api-error';

export interface StatusUpdateDialogProps {
  /** The applicant whose status is being changed. */
  applicant: Applicant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Advances an applicant through the hiring pipeline. Offers only the valid next
 * statuses (per the backend state machine); terminal states admit no changes.
 * An optional note is attached to the transition.
 */
export function StatusUpdateDialog({ applicant, open, onOpenChange }: StatusUpdateDialogProps) {
  const [updateStatus, { isLoading }] = useUpdateApplicationStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [note, setNote] = useState('');

  const nextStatuses = getHrNextStatuses(applicant.status);
  const isFinal = nextStatuses.length === 0;
  const currentMeta = APPLICATION_STATUS_META[applicant.status];

  // Reset the form whenever the dialog opens for a (possibly new) applicant, using
  // React's render-phase reset pattern to avoid a synchronous effect.
  const openKey = open ? applicant.id : null;
  const [lastOpenKey, setLastOpenKey] = useState<string | null>(openKey);
  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    setSelectedStatus('');
    setNote('');
  }

  const handleConfirm = async () => {
    if (!selectedStatus || isLoading) return;
    try {
      await updateStatus({
        applicationId: applicant.id,
        status: selectedStatus,
        note: note.trim() ? note.trim() : undefined,
      }).unwrap();
      toast.success('Status updated.');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update status</DialogTitle>
          <DialogDescription>
            Move this application to its next stage. The candidate is notified of the change.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-small text-foreground-muted">Current status</span>
            <StatusBadge intent={currentMeta.intent} label={currentMeta.label} />
          </div>

          {isFinal ? (
            <p className="rounded-md border border-border-subtle bg-muted px-3 py-2 text-small text-foreground-secondary">
              This application is in a final state and cannot be changed.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="status-update-next">New status</Label>
                <Select
                  value={selectedStatus || undefined}
                  onValueChange={(value) => setSelectedStatus(value as ApplicationStatus)}
                >
                  <SelectTrigger id="status-update-next" aria-label="New status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {nextStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {APPLICATION_STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="status-update-note">Note (optional)</Label>
                <Textarea
                  id="status-update-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add context for this decision…"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isFinal || !selectedStatus}
          >
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
