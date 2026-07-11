import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackButton } from '@/components/navigation/BackButton';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from '@/components/ui/sonner';
import { ROUTES } from '@/constants/routes';
import { useCreateJobMutation } from '@/features/hr/api/hrJobsApi';
import { JobForm } from '@/features/hr/components/JobForm';
import {
  EMPTY_JOB_FORM_VALUES,
  type JobFormValues,
  toCreateJobRequest,
} from '@/features/hr/schemas/job.schema';
import { getApiErrorMessage } from '@/utils/api-error';

/** Create-job page: a blank job form that saves a draft or publishes immediately. */
export default function CreateJobPage() {
  const navigate = useNavigate();
  const [createJob, { isLoading }] = useCreateJobMutation();
  const [isDirty, setIsDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async (
    values: JobFormValues,
    status?: 'DRAFT' | 'PUBLISHED',
  ): Promise<void> => {
    try {
      await createJob(toCreateJobRequest(values, status ?? 'DRAFT')).unwrap();
      toast.success('Job created.');
      navigate(ROUTES.HR.JOBS);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleCancel = (): void => {
    if (isDirty) {
      setConfirmOpen(true);
    } else {
      navigate(ROUTES.HR.JOBS);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create job"
        description="Draft a new role, then save it or publish it for candidates."
        breadcrumb={<BackButton fallback={ROUTES.HR.JOBS} label="Back to jobs" />}
      />

      <JobForm
        mode="create"
        defaultValues={EMPTY_JOB_FORM_VALUES}
        submitting={isLoading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDirtyChange={setIsDirty}
      />

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Discard this job?"
        description="You have unsaved changes. Leaving now will discard them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={() => navigate(ROUTES.HR.JOBS)}
      />
    </div>
  );
}
