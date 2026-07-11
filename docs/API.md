# API Reference

Base URL: `http://localhost:4000/api/v1`

## Conventions

- JSON request/response bodies.
- Bearer-token (JWT) authentication for protected routes: `Authorization: Bearer <accessToken>`.
- Registration creates **Candidate** accounts only. HR accounts are provisioned via the Prisma seed script.
- Role-based access control with two roles: `HR`, `CANDIDATE`.

### Success shape

```json
{ "success": true, "message": "...", "data": {} }
```

### Error shape

```json
{ "success": false, "message": "...", "errors": [{ "field": "email", "message": "..." }] }
```

`errors` carries field-level details for validation failures (HTTP 422) and is an empty array otherwise.

### Status codes

`200` OK · `201` Created · `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `422` Validation failed · `500` Internal Server Error.

### Paginated responses

List endpoints return the items in `data` plus a `meta` object:

```json
{ "success": true, "message": "...", "data": [], "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0, "hasNext": false, "hasPrevious": false } }
```

Common query params: `page`, `limit` (max 100), `sortBy`, `sortOrder` (`asc`/`desc`).

---

## Infrastructure

| Method | Endpoint  | Auth | Description          |
| ------ | --------- | ---- | -------------------- |
| `GET`  | `/health` | —    | Service health check |

---

## Authentication

### `POST /api/v1/auth/register`

Creates a new Candidate account and returns an access token.

- **Auth:** Public
- **Body:** `email`, `password`, `firstName`, `lastName`
  - `password` — min 8 chars, with at least one uppercase, one lowercase, one number, and one special character.
- **Responses:** `201` `{ user, accessToken }` · `409` email already registered · `422` validation failed

### `POST /api/v1/auth/login`

Authenticates a user and returns an access token.

- **Auth:** Public
- **Body:** `email`, `password`
- **Responses:** `200` `{ user, accessToken }` · `401` invalid credentials · `422` validation failed

### `GET /api/v1/auth/me`

Returns the currently authenticated user.

- **Auth:** Authenticated (HR or Candidate)
- **Responses:** `200` `{ user }` · `401` missing/invalid token

---

## Candidate Profile

A candidate can only view and edit **their own** profile. HR users receive `403`.

### `GET /api/v1/profile`

Returns the authenticated candidate's profile (with skills and education).

- **Auth:** Candidate only
- **Responses:** `200` `{ profile }` · `401` unauthenticated · `403` HR user · `404` profile not found

### `PATCH /api/v1/profile`

Updates the authenticated candidate's profile. Only whitelisted fields are accepted; unknown fields are rejected (`422`).

- **Auth:** Candidate only
- **Body (all optional, at least one required):** `headline`, `about`, `phone`, `currentLocation`, `preferredLocation`, `currentCompany`, `currentTitle`, `totalExperienceMonths`, `highestEducation`, `expectedSalaryMin`, `expectedSalaryMax`, `noticePeriodDays`, `isOpenToWork`, `resumeUrl`
- **Responses:** `200` `{ profile }` · `401` unauthenticated · `403` HR user · `404` profile not found · `422` validation failed

---

## Jobs

A job is "live" when `status = PUBLISHED` and it is not deleted. Only the HR
owner may edit/close/delete a job; deletion is a soft delete that preserves
applications.

### `POST /api/v1/jobs` — create a job _(HR)_

Body: `title`, `description`, `employmentType`, `experienceLevel`, `workMode`
(`ONSITE`/`REMOTE`/`HYBRID`), optional `location`, `minExperienceYears`,
`maxExperienceYears`, `salaryMin`, `salaryMax`, `salaryCurrency`, `salaryPeriod`,
`openings`, `status` (`DRAFT`/`PUBLISHED`, default `PUBLISHED`), and
`skills: [{ slug, isRequired? }]`. → `201 { job }`.

### `GET /api/v1/jobs` — browse live jobs _(Authenticated)_

Filters: `keyword` (title/description/skills/company/location), `location`,
`employmentType`, `experienceLevel`, `workMode`, `salaryMin`, `salaryMax`,
`skills` (csv), `company`. Sort: `createdAt`, `updatedAt`, `salary`, `title`,
`company`. → `200 { data: Job[], meta }`.

### `GET /api/v1/jobs/:id` — job details _(Authenticated)_

Live jobs are visible to anyone; draft/closed jobs only to the HR owner (else `404`).

### `PATCH /api/v1/jobs/:id` — edit or close a job _(HR owner)_

Any create field plus `status` (`DRAFT`/`PUBLISHED`/`CLOSED` — closing a job sets `CLOSED`). → `200 { job }`.

### `DELETE /api/v1/jobs/:id` — soft-delete a job _(HR owner)_ → `200 { id }`.

### `GET /api/v1/hr/jobs` — the HR user's own jobs (any status) _(HR)_ → `200 { data: Job[], meta }`.

---

## Applications

Status pipeline: `APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFERED →
HIRED`, with `REJECTED` reachable from any active state and `WITHDRAWN` set by
the candidate. Invalid transitions return `400`.

### `POST /api/v1/applications` — apply to a job _(Candidate)_

Body: `jobId`, optional `coverLetter`, `resumeUrl`. Rules: the job must be live
and not deleted; no duplicate applications; cannot apply to a job you posted.
→ `201 { application }` · `409` duplicate/inactive · `404` missing job.

### `GET /api/v1/applications/me` — the candidate's applications _(Candidate)_

Filter `status`; sort `createdAt`/`updatedAt`/`status`. → `200 { data, meta }`.

### `GET /api/v1/jobs/:id/applications` — applicants for a job _(HR owner)_

Filters: `status`, `minExperienceMonths`, `maxExperienceMonths`,
`currentLocation`, `preferredLocation`, `highestEducation`, `college`,
`currentCompany`, `skills` (csv), `keyword` (name/email/skills/company/college).
Sort adds `experience`. → `200 { data: Applicant[], meta }` · `403` if not the owner.

### `PATCH /api/v1/applications/:id/status` — advance an applicant _(HR owner)_

Body: `status` (one of `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `OFFERED`,
`HIRED`, `REJECTED`), optional `note`. → `200 { application }` · `400` invalid transition.

### `PATCH /api/v1/applications/:id/withdraw` — withdraw _(Candidate owner)_ → `200 { application }`.

---

## Dashboard

### `GET /api/v1/dashboard/candidate` _(Candidate)_

Returns `profileCompletion`, `applicationCounts { total, byStatus }`,
`recentApplications`, `recommendedJobs`, `recentJobs`, `savedCount`.

### `GET /api/v1/dashboard/hr` _(HR)_

Returns `totalJobs`, `activeJobs`, `closedJobs`, `totalApplicants`,
`applicantStatusBreakdown`, `recentApplications`, `recentJobs`, `topPerformingJob`.
