# Database & API Design

## Objective

Design a secure, scalable, and maintainable backend API backed by PostgreSQL using Prisma ORM. The API should follow RESTful principles, provide consistent request and response contracts, enforce strict validation, and be optimized for maintainability and performance.

The API should be predictable, type-safe, well-documented through code, and easy to extend as new features are introduced.

The database should be normalized where appropriate, maintain referential integrity, and avoid premature optimization while still following production-ready practices.

---

# Guiding Principles

* Database is the single source of truth.
* Every request must be validated.
* Every endpoint should have a predictable contract.
* Never expose database models directly.
* Separate persistence models from API contracts.
* Prefer consistency over cleverness.
* Optimize for readability and maintainability.
* Every API should be easily testable.

---

# Database

Use

* PostgreSQL
* Prisma ORM

Never access PostgreSQL directly using raw SQL unless Prisma cannot reasonably express the required query.

Always use Prisma Client.

---

# Database Structure

Every table should follow consistent conventions.

Required fields

```text
id
createdAt
updatedAt
```

Prefer

```text
String @id @default(uuid())
```

for identifiers.

Use Prisma-managed timestamps.

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

---

# Naming Conventions

Tables

Use singular model names.

```text
User

Job

Application

Company
```

Columns

Use camelCase.

Examples

```text
firstName

lastName

createdAt

updatedAt

jobTitle
```

Enums

Use PascalCase.

```text
UserRole

ApplicationStatus

JobType
```

Avoid abbreviations.

---

# Relationships

Use explicit Prisma relations.

Prefer

```text
User

↓

CandidateProfile

↓

Applications

↓

Job
```

Avoid duplicated data.

Use foreign keys.

Maintain referential integrity.

---

# Normalization

Normalize the database.

Avoid duplicated information.

Store references rather than repeated values.

Denormalize only when there is a measurable performance benefit.

---

# Indexes

Create indexes for

* foreign keys
* frequently filtered columns
* frequently sorted columns
* unique identifiers

Examples

```text
email

companyId

jobId

candidateId

status

createdAt
```

Avoid unnecessary indexes.

---

# Soft Deletes

Use soft deletes only where business requirements justify them.

Preferred approach

```text
deletedAt
```

rather than boolean flags.

Do not overuse soft deletes.

---

# Prisma

Use Prisma as the only ORM.

Repository layer should be the only layer interacting with Prisma Client.

Controllers and services must never access Prisma directly.

---

# Repository Pattern

Repositories encapsulate all database operations.

Responsibilities

* CRUD operations
* Pagination
* Filtering
* Sorting
* Transactions
* Query optimization

Repositories should not contain business rules.

---

# Transactions

Use Prisma transactions whenever multiple operations must succeed together.

Examples

* User registration
* Job application
* Job deletion with related records
* Profile creation

Never leave the database in a partially updated state.

---

# DTOs

Never expose Prisma models directly.

Create dedicated DTOs.

Examples

```text
CreateJobDto

UpdateJobDto

JobResponseDto

CandidateResponseDto
```

DTOs represent API contracts.

Entities represent persistence.

---

# Validation

Validate every request.

Use Zod.

Validate

* Request Body
* Query Parameters
* Route Parameters

Validation belongs before business logic.

Never trust frontend validation.

---

# API Design

Follow REST principles.

Use nouns.

Examples

```text
GET    /jobs

POST   /jobs

GET    /jobs/:id

PATCH  /jobs/:id

DELETE /jobs/:id
```

Avoid

```text
/createJob

/updateJob

/getJobs
```

---

# HTTP Status Codes

Use standard HTTP status codes.

Examples

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity

500 Internal Server Error

Avoid returning 200 for failed requests.

---

# Response Format

Every successful response should follow a consistent structure.

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {}
}
```

For paginated endpoints

```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 120,
    "totalPages": 12
  }
}
```

Error responses

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

Never return inconsistent response shapes.

---

# Pagination

Support pagination for all list endpoints.

Preferred approach

Offset pagination for this project.

Parameters

```text
page

pageSize
```

Provide pagination metadata.

Avoid returning thousands of rows.

---

# Filtering

Support filtering through query parameters.

Examples

```text
status

location

experience

employmentType

department
```

Filtering logic belongs in repositories.

---

# Sorting

Support sorting.

Example

```text
sortBy

sortOrder
```

Default

Newest first.

---

# Searching

Searching should support partial matching.

Search implementation belongs in repositories.

Debounce requests from the frontend.

---

# Authentication

Use JWT.

Support

Access Token

Refresh Token

Passwords must always be hashed using bcrypt.

Never store plaintext passwords.

Never expose password hashes.

---

# Authorization

Implement Role-Based Access Control.

Roles

HR

Candidate

Authorization must always happen in the backend.

Never rely on frontend permissions.

---

# Redis

Redis should remain optional but available.

Use Redis for

* Session management
* Refresh token storage
* Rate limiting
* Frequently accessed reference data
* Future caching needs

Do not cache prematurely.

Measure first.

---

# Error Handling

Create centralized error handling.

Map domain errors to HTTP responses.

Examples

ValidationError

AuthenticationError

AuthorizationError

ConflictError

NotFoundError

InternalServerError

Avoid throwing generic Error throughout the application.

---

# Logging

Log

* Incoming requests
* Unexpected exceptions
* Database failures
* Authentication failures

Never log

* Passwords
* JWT secrets
* Access tokens
* Refresh tokens
* Sensitive personal information

Use structured logging.

---

# Security

Always enable

Helmet

CORS

Compression

Rate Limiting

Input Validation

Secure Cookies (when applicable)

Protect against

* SQL Injection
* XSS
* Parameter Tampering
* Brute Force
* Mass Assignment
* Injection attacks

Never trust user input.

---

# Performance

Select only required fields.

Avoid SELECT * patterns.

Prevent N+1 queries.

Use indexes.

Paginate large datasets.

Avoid unnecessary joins.

Use transactions efficiently.

Cache only when beneficial.

---

# Type Safety

Every API endpoint should define

Request DTO

Response DTO

Validation Schema

Repository Return Type

Service Return Type

Never use

* any
* unknown
* implicit types

Use explicit interfaces.

---

# Documentation

Every endpoint should be easy to understand from the codebase.

Use descriptive names.

Document complex business rules through code organization rather than excessive comments.

---

# Future Scalability

The architecture should allow future addition of

* Email notifications
* Resume parsing
* AI-powered job matching
* Full-text search
* Background workers
* Event-driven workflows
* File uploads
* Audit logs
* Multi-tenancy

without major architectural changes.

---

# Code Review Checklist

Before completing any backend feature verify

* Database is normalized
* Proper relationships exist
* Repository pattern followed
* Controllers never access Prisma
* Services contain business logic
* Every request validated with Zod
* DTOs used instead of Prisma models
* REST conventions followed
* Consistent response structure
* Correct HTTP status codes
* Pagination implemented where applicable
* Filtering and sorting supported
* Authentication and authorization enforced
* No raw SQL unless justified
* No duplicated queries
* Transactions used where required
* Proper indexes added
* No `any`
* Strong TypeScript types everywhere
* Production-ready implementation
