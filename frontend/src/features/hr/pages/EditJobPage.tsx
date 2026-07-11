import { skipToken } from '@reduxjs/toolkit/query';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/sonner';
import { ROUTES } from '@/constants/routes';
import { useUpdateJobMutation } from '@/features/hr/api/hrJobsApi';
import { JobForm } from '@/features/hr/components/JobForm';
import {
  type JobFormValues,
  jobToFormValues,
  toUpdateJobRequest,
} from '@/features/hr/schemas/job.schema';
import { useGetJobQuery } from '@/features/jobs/api/jobsApi';
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

/** Skeleton that mirrors the job form's section-card layout while loading. */
function JobFormSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1, 2].map((section) => (
        <Card key={section}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((field) => (
              <div key={field} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Edit-job page: prefills the shared form from an existing job and saves updates. */
export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading, isError, refetch } = useGetJobQuery(id ?? skipToken);
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();
  const [isDirty, setIsDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async (
    values: JobFormValues,
    status?: 'DRAFT' | 'PUBLISHED',
  ): Promise<void> => {
    if (!id) return;
    try {
      await updateJob({ id, data: toUpdateJobRequest(values, status) }).unwrap();
      toast.success('Job updated.');
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
        title="Edit job"
        description="Update the role's details, then save your changes."
        breadcrumb={<BackLink />}
      />

      {isLoading ? (
        <JobFormSkeleton />
      ) : isError || !job ? (
        <Card>
          <CardContent className="pt-5">
            <EmptyState
              icon={AlertTriangle}
              title="Couldn't load this job"
              description="Something went wrong while fetching the job. Please try again."
              action={
                <Button variant="outline" onClick={() => refetch()}>
                  Try again
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <JobForm
          mode="edit"
          defaultValues={jobToFormValues(job)}
          submitting={isUpdating}
          currentStatus={job.status}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDirtyChange={setIsDirty}
        />
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Discard your changes?"
        description="You have unsaved changes. Leaving now will discard them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        variant="destructive"
        onConfirm={() => navigate(ROUTES.HR.JOBS)}
      />
    </div>
  );
}
