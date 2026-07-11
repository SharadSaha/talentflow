import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { toast } from '@/components/ui/sonner';
import { useDeleteJobMutation } from '@/features/hr/api/hrJobsApi';
import type { Job } from '@/types/job';
import { getApiErrorMessage } from '@/utils/api-error';

interface DeleteJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Destructive confirmation for permanently deleting a job. On success the jobs
 * list refreshes via RTK Query cache invalidation and the dialog closes.
 */
export function DeleteJobDialog({ job, open, onOpenChange }: DeleteJobDialogProps) {
  const [deleteJob, { isLoading }] = useDeleteJobMutation();

  const handleConfirm = async () => {
    try {
      await deleteJob(job.id).unwrap();
      toast.success('Job deleted.');
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
      title="Delete job"
      description={`"${job.title}" and its applicant data will be permanently removed. This action cannot be undone.`}
      confirmLabel="Delete job"
      onConfirm={handleConfirm}
      isConfirming={isLoading}
    />
  );
}
