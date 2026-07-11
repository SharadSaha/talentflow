/**
 * Sorting/search constants shared across list endpoints. Allowed sort fields are
 * whitelisted per resource so a client can never sort by an arbitrary column.
 */
export const SORT_ORDERS = ['asc', 'desc'] as const;
export const DEFAULT_SORT_ORDER = 'desc' as const;

/** Sort fields exposed for jobs. `salary` maps to `salaryMin`, `company` to the company name. */
export const JOB_SORT_FIELDS = ['createdAt', 'updatedAt', 'salary', 'title', 'company'] as const;
export const DEFAULT_JOB_SORT_FIELD = 'createdAt' as const;

/** Sort fields exposed for a candidate's own applications. */
export const APPLICATION_SORT_FIELDS = ['createdAt', 'updatedAt', 'status'] as const;
export const DEFAULT_APPLICATION_SORT_FIELD = 'createdAt' as const;

/** Sort fields exposed for the HR applicant board. `experience` maps to the candidate's total experience. */
export const APPLICANT_SORT_FIELDS = ['createdAt', 'updatedAt', 'status', 'experience'] as const;
export const DEFAULT_APPLICANT_SORT_FIELD = 'createdAt' as const;
