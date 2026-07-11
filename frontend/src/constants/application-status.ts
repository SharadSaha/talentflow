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

/** Statuses from which a candidate may withdraw. Mirrors the backend rule. */
const WITHDRAWABLE_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  APPLICATION_STATUS.APPLIED,
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFERED,
]);

/** Whether a candidate may withdraw an application in the given status. */
export function isWithdrawable(status: ApplicationStatus): boolean {
  return WITHDRAWABLE_STATUSES.has(status);
}

/** Status filter options (all statuses) for the applied-jobs page. */
export const APPLICATION_STATUS_FILTER_OPTIONS: { value: ApplicationStatus; label: string }[] = (
  Object.keys(APPLICATION_STATUS_META) as ApplicationStatus[]
).map((status) => ({
  value: status,
  label: APPLICATION_STATUS_META[status].label,
}));

/**
 * Statuses an HR user may set via the status-update endpoint. `APPLIED` is the
 * initial state and `WITHDRAWN` is candidate-only, so neither is HR-settable.
 * Mirrors the backend `HR_SETTABLE_STATUSES`.
 */
export const HR_SETTABLE_STATUSES = [
  APPLICATION_STATUS.UNDER_REVIEW,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.INTERVIEW,
  APPLICATION_STATUS.OFFERED,
  APPLICATION_STATUS.HIRED,
  APPLICATION_STATUS.REJECTED,
] as const;

/**
 * Allowed HR-driven status transitions, mirroring the backend state machine.
 * The pipeline flows APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFERED
 * → HIRED, with REJECTED reachable from any active state; terminal states admit
 * no changes. Used to offer only valid next statuses in the UI (the backend
 * remains the source of truth).
 */
const HR_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [APPLICATION_STATUS.APPLIED]: [
    APPLICATION_STATUS.UNDER_REVIEW,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.UNDER_REVIEW]: [
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW,
    APPLICATION_STATUS.REJECTED,
  ],
  [APPLICATION_STATUS.SHORTLISTED]: [APPLICATION_STATUS.INTERVIEW, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.INTERVIEW]: [APPLICATION_STATUS.OFFERED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.OFFERED]: [APPLICATION_STATUS.HIRED, APPLICATION_STATUS.REJECTED],
  [APPLICATION_STATUS.HIRED]: [],
  [APPLICATION_STATUS.REJECTED]: [],
  [APPLICATION_STATUS.WITHDRAWN]: [],
};

/** The valid next statuses an HR user may move an application to. */
export function getHrNextStatuses(current: ApplicationStatus): ApplicationStatus[] {
  return HR_TRANSITIONS[current];
}
