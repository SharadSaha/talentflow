import { useGetMyApplicationsQuery } from '@/features/applications/api/applicationsApi';
import type { Application } from '@/types/application';

/** The candidate's application relative to a specific job, if one exists. */
export interface JobApplicationStatus {
  /** The matching application, or `undefined` when the candidate has not applied. */
  application: Application | undefined;
  /** Whether the candidate's applications are still loading. */
  isLoading: boolean;
}

/**
 * Resolves whether the current candidate has already applied to a given job.
 *
 * The job-details endpoint carries no application info, so this reads the
 * candidate's own applications and matches on `job.id`. Applying invalidates the
 * applications cache, so the result refreshes automatically after a submission.
 */
export function useJobApplicationStatus(jobId: string): JobApplicationStatus {
  const { data, isLoading } = useGetMyApplicationsQuery({ limit: 100 });

  const application = data?.items.find((item) => item.job.id === jobId);

  return { application, isLoading };
}
