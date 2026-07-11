import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from '@/components/ui/sonner';
import { useWithdrawApplicationMutation } from '@/features/applications/api/applicationsApi';
import type { Application } from '@/types/application';
import { getApiErrorMessage } from '@/utils/api-error';

export interface WithdrawApplicationDialogProps {
  /** The application to withdraw, or `null` when no dialog target is selected. */
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * A destructive confirmation dialog for withdrawing an application. The withdraw
 * mutation already invalidates the applications, dashboard, and job caches, so
 * the list refreshes automatically once the server confirms the change.
 */
export function WithdrawApplicationDialog({
  application,
  open,
  onOpenChange,
}: WithdrawApplicationDialogProps) {
  const [withdrawApplication, { isLoading }] = useWithdrawApplicationMutation();

  if (!application) return null;

  const handleConfirm = async (): Promise<void> => {
    try {
      await withdrawApplication(application.id).unwrap();
      toast.success('Application withdrawn.');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title="Withdraw application?"
      description={`This withdraws your application for ${application.job.title} at ${application.job.company.name}. This action can't be undone.`}
      confirmLabel="Withdraw application"
      cancelLabel="Keep application"
      isConfirming={isLoading}
      onConfirm={handleConfirm}
    />
  );
}
