# Project Guidelines

## Objective

This project should demonstrate the engineering standards expected from a production-ready SaaS application rather than an interview assignment.

Every implementation should prioritize maintainability, scalability, readability, performance, security, accessibility, and developer experience.

Whenever multiple valid approaches exist, choose the one that results in a cleaner architecture, better separation of concerns, stronger type safety, and improved long-term maintainability.

The project should be built with the mindset that multiple engineers will work on it over several years.

---

# General Engineering Philosophy

Think beyond making the feature work.

Every implementation should answer the following questions:

* Is this maintainable?
* Is this scalable?
* Is it type-safe?
* Is it secure?
* Is it reusable?
* Is it testable?
* Would another engineer immediately understand it?

Avoid quick fixes.

Avoid technical debt unless absolutely necessary.

---

# Coding Standards

Always follow

* Clean Code
* SOLID Principles
* DRY
* KISS
* Separation of Concerns

Never optimize prematurely.

Never overengineer simple requirements.

Favor readability over cleverness.

---

# Folder Ownership

Every folder should own a specific responsibility.

Avoid creating miscellaneous folders.

Examples of good ownership

```text
features/jobs/

features/auth/

components/ui/

services/api/

utils/date/
```

Avoid

```text
helpers/

misc/

commonStuff/
```

---

# Naming Conventions

Use meaningful names.

Components

```text
JobCard

CandidateProfile

ApplicationTimeline
```

Functions

```text
createJob

updateCandidateProfile

fetchApplications
```

Variables

```text
selectedJob

currentUser

filteredCandidates
```

Avoid

```text
data

item

obj

value

temp

test
```

Names should explain intent.

---

# Imports

Order imports consistently.

1. External packages
2. Internal modules
3. Relative imports
4. Styles

Prefer project path aliases instead of long relative paths.

Avoid circular dependencies.

---

# Comments

Write self-documenting code.

Only add comments when explaining

* business rules
* architectural decisions
* complex algorithms

Never comment obvious code.

Bad

```ts
// Increment counter
counter++
```

Good

```ts
// Candidate can only withdraw an application before HR reviews it.
```

---

# Git Workflow

Use Conventional Commits.

Examples

```text
feat(auth): implement login endpoint

feat(jobs): add job filtering

fix(api): resolve pagination issue

refactor(profile): simplify update workflow

test(auth): add login service tests

docs: improve setup instructions

chore: configure docker compose
```

Commit frequently.

Each commit should represent one logical change.

Avoid massive commits.

---

# Branching

Use feature branches.

Examples

```text
feature/authentication

feature/job-management

feature/applications

feature/profile

fix/login-validation
```

Keep branches focused.

---

# Environment Variables

Never hardcode

* Secrets
* Passwords
* JWT Keys
* Database URLs
* Redis URLs
* API Keys

Provide

```text
.env.example
```

for every application.

Document every environment variable.

---

# Docker

Docker must remain a first-class citizen.

The application should always run successfully using

```bash
docker compose up --build
```

No manual steps should be required beyond those documented in the README.

Ensure

* Named volumes
* Internal networking
* Proper container health
* Environment variable support

---

# Documentation

Maintain a high-quality README.

Include

* Project Overview
* Features
* Architecture
* Tech Stack
* Setup
* Local Development
* Docker Setup
* Folder Structure
* Seed Credentials
* Environment Variables
* API Overview
* Future Improvements
* Known Limitations

Documentation should remain synchronized with implementation.

---

# Logging

Use centralized logging.

Never leave debugging logs.

Remove

```ts
console.log()
```

before final submission.

Log only meaningful information.

Never log sensitive information.

---

# Error Handling

Every error should be handled gracefully.

Frontend

* User-friendly messages
* Retry actions where appropriate
* Error boundaries

Backend

* Consistent API responses
* Centralized error handling
* Proper HTTP status codes

Never expose stack traces.

---

# Accessibility

Accessibility is mandatory.

Support

* Keyboard navigation
* Screen readers
* Focus management
* Semantic HTML
* Proper labels
* Sufficient color contrast

Every interactive component should be accessible.

---

# Responsive Design

Support

* Mobile
* Tablet
* Desktop
* Large Desktop

Avoid horizontal scrolling.

Layouts should adapt naturally.

---

# Performance

Optimize for perceived performance.

Examples

* Code splitting
* Lazy loading
* Route-based chunking
* Memoization where appropriate
* Pagination
* Virtualization for large lists
* Optimistic UI updates

Do not optimize blindly.

Measure before optimizing.

---

# Security

Security should be considered throughout development.

Implement

* Input validation
* Password hashing
* Authentication
* Authorization
* Rate limiting
* Helmet
* CORS
* Secure cookies (where applicable)

Prevent

* SQL Injection
* XSS
* CSRF (when cookie-based authentication is used)
* Mass Assignment
* Brute Force attacks

Never trust user input.

---

# API Standards

Maintain consistent API design.

Every endpoint should

* Validate input
* Return consistent responses
* Return correct HTTP status codes
* Handle errors gracefully
* Be fully typed

Follow REST conventions.

---

# Database Standards

Use Prisma exclusively.

Repositories should own database access.

Use

* Pagination
* Sorting
* Filtering
* Transactions where necessary

Optimize queries.

Avoid unnecessary joins.

---

# Frontend Standards

Follow the established design system.

Use

* shadcn/ui
* Radix UI
* Tailwind CSS
* CSS Variables
* CVA

Never hardcode colors.

Always use reusable UI components.

Prefer composition over duplication.

---

# Backend Standards

Controllers

HTTP only.

Services

Business logic only.

Repositories

Database only.

Validation

Zod only.

Authentication

Centralized.

Authorization

Role-based.

---

# State Management

Server State

RTK Query.

Global State

Redux Toolkit.

Local State

React Hooks.

Never duplicate state.

---

# Testing

Every new feature should include appropriate tests.

Prioritize

* Services
* Utilities
* Validation
* Authentication
* Critical user flows

Run tests before every commit.

Fix flaky tests immediately.

---

# Code Review Mindset

Before marking any task complete, ask

* Is the implementation simpler than before?
* Is there duplicated code?
* Can this component be reused?
* Is this feature easy to test?
* Does the naming make sense?
* Are types explicit?
* Is the API consistent?
* Is the UI consistent?
* Is this production-ready?

Refactor if the answer is "no."

---

# Pull Request Checklist

Before every pull request or major commit verify

* Project builds successfully
* Docker build succeeds
* TypeScript has zero errors
* ESLint passes
* Tests pass
* README updated if needed
* Environment variables documented
* No console.log statements
* No commented-out code
* No dead code
* No unused imports
* No duplicated logic
* Responsive layout verified
* Accessibility verified
* Error handling implemented
* Loading states implemented
* Empty states implemented
* Security considerations addressed

---

# Submission Checklist

Before final submission verify

* Application runs locally
* `docker compose up --build` works on a clean environment
* README is complete and accurate
* Demo credentials are seeded
* Database migrations are included
* Docker Compose starts all services correctly
* Screenshots are added to the README (if available)
* Commit history is clean and meaningful
* Code is consistently formatted
* Linting and tests pass
* The application demonstrates production-quality engineering practices

---

# Definition of Success

A successful submission should feel like a real SaaS product rather than an interview prototype.

The codebase should demonstrate:

* Clean architecture
* Excellent code organization
* Strong TypeScript usage
* High reusability
* Consistent design language
* Secure backend practices
* Reliable testing
* Comprehensive documentation
* Seamless Docker experience
* Thoughtful user experience

Every feature should leave the codebase in a better state than it was before.
