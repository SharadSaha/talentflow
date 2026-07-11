import { ApplicationStatus } from '@/generated/prisma/enums';

/**
 * Statuses an HR user may set via the status-update endpoint. `APPLIED` is the
 * initial state and `WITHDRAWN` is candidate-only, so neither is HR-settable.
 */
export const HR_SETTABLE_STATUSES = [
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFERED,
  ApplicationStatus.HIRED,
  ApplicationStatus.REJECTED,
] as const;

/** Non-terminal statuses from which a candidate may withdraw. */
const WITHDRAWABLE_STATUSES: ReadonlySet<ApplicationStatus> = new Set([
  ApplicationStatus.APPLIED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.SHORTLISTED,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFERED,
]);

/**
 * Allowed HR-driven status transitions. The pipeline flows
 * APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFERED → HIRED, with
 * REJECTED reachable from any active state. Terminal states admit no changes.
 */
const HR_TRANSITIONS: Record<ApplicationStatus, ReadonlySet<ApplicationStatus>> = {
  [ApplicationStatus.APPLIED]: new Set([
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
  ]),
  [ApplicationStatus.UNDER_REVIEW]: new Set([
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
  ]),
  [ApplicationStatus.SHORTLISTED]: new Set([
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
  ]),
  [ApplicationStatus.INTERVIEW]: new Set([ApplicationStatus.OFFERED, ApplicationStatus.REJECTED]),
  [ApplicationStatus.OFFERED]: new Set([ApplicationStatus.HIRED, ApplicationStatus.REJECTED]),
  [ApplicationStatus.HIRED]: new Set(),
  [ApplicationStatus.REJECTED]: new Set(),
  [ApplicationStatus.WITHDRAWN]: new Set(),
};

/** Returns whether an HR user may move an application from `from` to `to`. */
export function canHrTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return HR_TRANSITIONS[from].has(to);
}

/** Returns whether a candidate may withdraw an application in the given status. */
export function isWithdrawable(status: ApplicationStatus): boolean {
  return WITHDRAWABLE_STATUSES.has(status);
}
