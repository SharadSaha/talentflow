/**
 * Job posting statuses. Mirrors the backend `JobStatus` enum.
 */
import type { BadgeIntent } from '@/types/status';

export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

interface StatusDescriptor {
  label: string;
  intent: BadgeIntent;
}

export const JOB_STATUS_META: Record<JobStatus, StatusDescriptor> = {
  [JOB_STATUS.DRAFT]: { label: 'Draft', intent: 'neutral' },
  [JOB_STATUS.PUBLISHED]: { label: 'Published', intent: 'success' },
  [JOB_STATUS.CLOSED]: { label: 'Closed', intent: 'danger' },
};
