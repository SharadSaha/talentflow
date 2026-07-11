# Engineering Standards

## Objective

This project is being built as a production-quality software system as part of an engineering assessment. Every implementation should prioritize maintainability, readability, scalability, security, performance, and correctness over writing code as quickly as possible.

The goal is not merely to build a working application, but to demonstrate strong software engineering practices expected from an experienced full-stack engineer.

Every design and implementation decision should optimize for long-term maintainability.

---

# Core Principles

Always think like a Staff Software Engineer reviewing code for production.

Every file should have a clear responsibility.

Every module should be easy to understand without requiring knowledge of unrelated parts of the system.

Avoid clever solutions when a simpler solution is equally effective.

Readable code is preferred over shorter code.

Favor explicitness over implicit behavior.

Every implementation should be self-documenting through good naming rather than comments.

---

# Clean Code

Follow Clean Code principles throughout the project.

### Naming

Names should describe intent.

Avoid abbreviations unless universally understood.

Good examples

* JobApplicationService
* CandidateProfileController
* JobListingCard
* updateCandidateProfile
* getPublishedJobs

Avoid names like

* data
* temp
* obj
* val
* util
* helper1
* manager2

Boolean variables should read naturally.

Good examples

* isAuthenticated
* hasPermission
* canEditJob
* shouldRedirect

---

### Functions

Functions should perform one responsibility.

Prefer functions under approximately 40–60 lines.

Avoid deeply nested conditionals.

Prefer early returns.

Prefer extracting reusable logic into helper functions.

Avoid functions that both fetch data and manipulate UI.

Avoid side effects unless expected.

---

### Components

React components should focus on rendering.

Business logic should be extracted into hooks or services.

Large components should be broken into reusable child components.

Avoid components exceeding approximately 200 lines unless there is strong justification.

---

### Files

Every file should have one primary responsibility.

Avoid "miscellaneous" utility files containing unrelated functions.

Utility modules should be grouped by domain.

Example

utils/

* date.ts
* validation.ts
* pagination.ts
* formatting.ts

instead of

utils.ts

---

# SOLID Principles

Follow SOLID where applicable.

Especially:

Single Responsibility Principle

Each class, component, service, and hook should have one responsibility.

Open/Closed Principle

Design modules to allow extension without modification.

Dependency Inversion

High-level modules should depend on abstractions rather than implementations whenever appropriate.

---

# DRY

Do not duplicate logic.

Extract reusable code into

* custom hooks
* utilities
* reusable UI components
* shared services
* helper functions

However, avoid over-abstraction.

Duplicating three simple lines is often preferable to introducing unnecessary complexity.

---

# KISS

Keep implementations simple.

Avoid unnecessary design patterns.

Do not introduce complexity for hypothetical future requirements.

Build only what the current feature requires while keeping the architecture extensible.

---

# TypeScript Standards

Type safety is mandatory.

Never disable TypeScript.

Never use

* any
* @ts-ignore
* @ts-nocheck

Avoid unknown unless interacting with external libraries.

Prefer strongly typed interfaces.

Use interfaces for object contracts.

Use type aliases for

* unions
* mapped types
* utility types

Prefer discriminated unions over boolean flags.

Always type

* component props
* hook return values
* API responses
* Redux state
* RTK Query endpoints
* service return types
* controller inputs
* DTOs

Never rely on implicit any.

Enable strict mode.

---

# Error Handling

Never silently swallow errors.

Never leave empty catch blocks.

Handle expected failures gracefully.

Throw meaningful custom errors where appropriate.

Backend responses should always return consistent error shapes.

Unexpected errors should be logged.

Never expose stack traces to clients.

---

# Logging

Avoid console.log in production code.

Use a centralized logging mechanism.

Differentiate

* info
* warn
* error

Logs should provide useful debugging context.

Never log secrets.

---

# Code Organization

Keep imports organized.

Order imports as

1. External libraries
2. Internal modules
3. Relative imports
4. Styles

Remove unused imports immediately.

Prefer absolute imports using project aliases whenever possible.

---

# Documentation

Write self-documenting code.

Use comments only when explaining

* business rules
* architectural decisions
* non-obvious implementation details

Never comment obvious code.

Bad

// Increment i

Good

// Prisma transaction ensures candidate creation and audit logging remain atomic.

---

# Constants

Avoid magic numbers.

Avoid hardcoded strings.

Extract reusable values into constants.

Examples

* routes
* API endpoints
* role names
* pagination defaults
* validation limits

---

# Environment Variables

Never hardcode

* secrets
* JWT keys
* database credentials
* Redis URLs
* API keys

All configuration should come from environment variables.

Provide sensible defaults only for local development where appropriate.

---

# Security

Always assume user input is untrusted.

Validate every request.

Sanitize inputs where necessary.

Escape output where appropriate.

Never trust client-side validation.

Protect authenticated routes.

Enforce authorization at the backend.

Hash passwords using bcrypt.

Use secure JWT practices.

Prevent common vulnerabilities.

* SQL Injection
* XSS
* CSRF (if applicable)
* Injection attacks
* Mass assignment
* Open redirects

---

# Performance

Avoid unnecessary renders.

Memoize expensive computations only when beneficial.

Prefer server-side pagination.

Avoid unnecessary database queries.

Batch operations where possible.

Avoid N+1 query problems.

Lazy load large UI sections where appropriate.

Optimize bundle size.

---

# Accessibility

Accessibility is mandatory.

Every interactive element must be keyboard accessible.

Use semantic HTML.

Provide labels.

Provide focus states.

Use ARIA only when semantic HTML is insufficient.

Maintain proper color contrast.

---

# Responsive Design

Mobile responsiveness is required.

Use a desktop-first experience while ensuring usability across all common screen sizes.

Avoid fixed widths.

Use responsive layouts.

---

# Testing Philosophy

Every feature should be designed to be testable.

Prefer dependency injection where practical.

Business logic should be isolated from framework code.

Tests should be deterministic.

Avoid brittle snapshot testing.

Test behavior rather than implementation.

---

# Git Standards

Follow Conventional Commits.

Examples

feat(auth): implement login flow

fix(api): resolve pagination issue

refactor(jobs): simplify filtering logic

test(hr): add controller unit tests

docs: update project setup

chore: configure Docker Compose

Commit frequently.

Each commit should represent one logical change.

---

# Review Checklist

Before considering any implementation complete, verify:

* No TypeScript errors
* No ESLint warnings
* No unused variables
* No dead code
* No duplicated logic
* No `any`
* No disabled lint rules
* Proper interfaces everywhere
* Consistent naming
* Clean folder organization
* Responsive UI
* Accessible components
* Proper loading states
* Proper error states
* Proper empty states
* Proper validation
* Secure implementation
* Reusable abstractions where appropriate
* Tests added for critical logic
* Docker compatibility maintained
* Environment variables documented
* Code is production-ready

Every contribution should improve the quality of the codebase rather than simply add functionality.
