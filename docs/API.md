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

`200` OK · `201` Created · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `422` Validation failed · `500` Internal Server Error.

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

## Planned endpoints

- [ ] `GET  /api/v1/jobs`, `POST /api/v1/jobs` _(HR)_
- [ ] `POST /api/v1/applications` _(Candidate)_
- [ ] HR dashboard, applicant search & filters
- [ ] ...
