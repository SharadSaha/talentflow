import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

/** Back link to the HR jobs list, shown above the page title. */
function BackLink() {
  return (
    <Link
      to={ROUTES.HR.JOBS}
      className="inline-flex w-fit items-center gap-1.5 rounded-md text-small font-medium text-foreground-secondary outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to jobs
    </Link>
  );
}

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
        breadcrumb={<BackLink />}
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
