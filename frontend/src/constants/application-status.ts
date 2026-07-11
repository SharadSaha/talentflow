/**
 * Application lifecycle statuses. Mirrors the backend `ApplicationStatus` enum.
 * `intent` maps each status to a semantic badge variant for consistent display.
 */
import type { BadgeIntent } from '@/types/status';

export const APPLICATION_STATUS = {
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  OFFERED: 'OFFERED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type ApplicationStatus = (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

interface StatusDescriptor {
  label: string;
  intent: BadgeIntent;
}

export const APPLICATION_STATUS_META: Record<ApplicationStatus, StatusDescriptor> = {
  [APPLICATION_STATUS.APPLIED]: { label: 'Applied', intent: 'neutral' },
  [APPLICATION_STATUS.UNDER_REVIEW]: { label: 'Under review', intent: 'info' },
  [APPLICATION_STATUS.SHORTLISTED]: { label: 'Shortlisted', intent: 'info' },
  [APPLICATION_STATUS.INTERVIEW]: { label: 'Interview', intent: 'warning' },
  [APPLICATION_STATUS.OFFERED]: { label: 'Offered', intent: 'success' },
  [APPLICATION_STATUS.HIRED]: { label: 'Hired', intent: 'success' },
  [APPLICATION_STATUS.REJECTED]: { label: 'Rejected', intent: 'danger' },
  [APPLICATION_STATUS.WITHDRAWN]: { label: 'Withdrawn', intent: 'neutral' },
};
