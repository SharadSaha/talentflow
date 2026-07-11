# Backend Architecture

## Objective

Build a production-ready backend that is modular, scalable, secure, testable, and easy to maintain.

The architecture should demonstrate clean separation of concerns while remaining pragmatic. Avoid overengineering, but ensure every layer has a well-defined responsibility.

The backend should be designed so that new features can be added with minimal impact on existing code.

---

# Technology Stack

Use the following technologies consistently throughout the backend.

* Node.js
* Express
* TypeScript
* PostgreSQL
* Prisma ORM
* Redis
* JWT Authentication
* Zod
* bcrypt
* dotenv
* Helmet
* CORS
* Compression
* Cookie Parser
* Express Rate Limit
* Morgan
* Jest
* Supertest

---

# Architectural Principles

Follow a layered architecture.

The request flow should always be:

```text
HTTP Request
      │
      ▼
Route
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

Controllers should never access Prisma directly.

Services should never know Express-specific objects.

Repositories should never contain business logic.

---

# Source Structure

```text
src/

app/
config/
common/
controllers/
routes/
services/
repositories/
middlewares/
validators/
dtos/
entities/
interfaces/
types/
utils/
constants/
errors/
auth/
database/
modules/
```

Each folder has one responsibility.

---

# app/

Application bootstrap.

Contains

* express initialization
* middleware registration
* routes registration
* error handler registration
* graceful shutdown
* health check

---

# config/

Application configuration.

Examples

* environment
* logger
* redis
* jwt
* cors
* rate limiting

No hardcoded configuration values.

---

# common/

Contains reusable backend components.

Examples

* response helpers
* pagination helpers
* shared DTOs
* reusable validation logic

---

# controllers/

Controllers are responsible for HTTP concerns only.

Responsibilities

* receive request
* validate request shape (or invoke validator)
* call service
* map service result to HTTP response
* set status codes
* return response

Controllers must not

* access Prisma
* contain business logic
* perform authentication logic
* perform authorization decisions
* manipulate database models

Controllers should remain thin.

---

# services/

Services contain all business logic.

Responsibilities

* authorization checks
* business rules
* workflow orchestration
* validation beyond schema validation
* calling repositories
* transactions
* external integrations

Services should not know anything about Express.

Services should be framework-independent.

---

# repositories/

Repositories encapsulate database access.

Responsibilities

* Prisma queries
* filtering
* pagination
* sorting
* transactions
* data persistence

Repositories must not

* contain business rules
* perform HTTP handling

Controllers should never import repositories directly.

---

# routes/

Routes should only define

* endpoint
* middleware
* controller

Example

```text
router.post(
"/jobs",
authenticate,
authorize(Role.HR),
validate(createJobSchema),
jobController.create
)
```

Routes should remain declarative.

---

# middlewares/

Contains reusable Express middleware.

Examples

* authenticate
* authorize
* validate
* errorHandler
* notFound
* requestLogger
* rateLimiter

Keep middleware focused.

---

# validators/

Contains Zod schemas.

Each endpoint should have

* request schema
* params schema
* query schema

Never trust frontend validation.

Every request should be validated.

---

# dtos/

DTOs define communication contracts.

Separate DTOs from database models.

Example

CreateJobDto

JobResponseDto

UpdateCandidateDto

Avoid exposing Prisma entities directly.

---

# entities/

Represents domain entities.

Examples

Job

Candidate

Application

User

Company

Keep entities independent of Express.

---

# interfaces/

Contains shared interfaces.

Examples

Repository interfaces

Service interfaces

External provider interfaces

Avoid concrete implementation dependencies where abstraction improves testability.

---

# types/

Contains shared backend types.

Examples

AuthenticatedRequest

JWTPayload

PaginationOptions

ApiResponse

ApiError

Feature-specific types should remain within their module.

---

# utils/

Pure helper functions.

Examples

date

pagination

token

encryption

formatting

validation

Utilities should have no side effects.

---

# constants/

Contains

* roles
* permissions
* status values
* limits
* regex patterns

Avoid magic strings.

---

# errors/

Create centralized error handling.

Examples

AppError

ValidationError

AuthenticationError

AuthorizationError

NotFoundError

ConflictError

InternalServerError

Errors should map consistently to HTTP status codes.

---

# auth/

Contains authentication-specific logic.

Examples

JWT

refresh tokens

password hashing

authentication middleware

authorization middleware

role guards

Keep authentication isolated from business modules.

---

# database/

Contains Prisma-specific configuration.

Examples

Prisma client

seed script

database helpers

migrations

Database configuration should remain centralized.

---

# modules/

Every business feature owns its implementation.

Example

```text
modules/

auth/

users/

jobs/

applications/

candidate/

hr/

dashboard/
```

Each module should contain

```text
module/

controller/

service/

repository/

routes/

dto/

schemas/

types/
```

Modules should be independent.

Avoid cross-module coupling.

---

# API Design

Follow REST principles.

Use nouns rather than verbs.

Examples

POST /jobs

GET /jobs

GET /jobs/:id

PATCH /jobs/:id

DELETE /jobs/:id

Avoid inconsistent endpoint naming.

---

# Validation

Validate every request.

Use Zod.

Validate

* body
* params
* query

Never trust frontend validation.

Reject invalid requests early.

---

# Authentication

Use JWT.

Support

* Access Token
* Refresh Token

Passwords must always be hashed using bcrypt.

Never store plain-text passwords.

Protect all private endpoints.

---

# Authorization

Implement Role-Based Access Control (RBAC).

Supported roles

* HR
* Candidate

Authorization must always happen on the backend.

Never rely on frontend permissions.

---

# Database

Use Prisma ORM exclusively.

Never write raw SQL unless absolutely necessary.

Use transactions where multiple operations must succeed together.

Implement

* createdAt
* updatedAt

Prefer UUIDs for identifiers.

Add indexes where appropriate.

Use soft deletes only where business requirements justify them.

---

# API Responses

Every successful response should follow a consistent shape.

Example

```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {}
}
```

Every error response should follow a consistent shape.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

Avoid inconsistent response structures.

---

# Logging

Use structured logging.

Log

* request start
* request end
* unexpected errors

Never log

* passwords
* JWT secrets
* access tokens
* refresh tokens

---

# Security

Always enable

* Helmet
* CORS
* Rate Limiting
* Input Validation
* Password Hashing

Protect against

* SQL Injection
* XSS
* Mass Assignment
* Brute Force Attacks
* Parameter Tampering

Use environment variables for all secrets.

---

# Performance

Implement

* pagination
* filtering
* sorting

Avoid N+1 queries.

Select only required fields.

Use Redis for caching where it provides measurable value (e.g., frequently accessed reference data, sessions, or rate limiting). Do not cache prematurely.

Keep database queries efficient.

---

# Testing

Every service should be independently testable.

Mock repositories instead of Prisma in unit tests.

Use Supertest for API integration tests.

Test

* controllers
* services
* validators
* authentication
* authorization
* repositories where appropriate

Cover both success and failure scenarios.

---

# Code Review Checklist

Before completing any backend feature verify

* Controllers contain no business logic
* Services contain business logic only
* Repositories contain database logic only
* No Prisma usage outside repositories
* All requests validated with Zod
* Strong TypeScript types everywhere
* No `any`
* Consistent API response structure
* Proper error handling
* Secure authentication and authorization
* Environment variables used for configuration
* No duplicated logic
* Meaningful logging
* Unit and integration tests added where appropriate
* Database queries optimized
* Production-ready implementation
