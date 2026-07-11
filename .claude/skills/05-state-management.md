# State Management

## Objective

Implement a scalable, predictable, and maintainable state management architecture using **Redux Toolkit** and **RTK Query**.

State should be separated into three categories:

1. Server State
2. Global Client State
3. Local Component State

Each category should use the appropriate solution. Avoid storing data in Redux that belongs elsewhere.

The architecture should minimize unnecessary re-renders, avoid duplicate state, and provide excellent developer experience.

---

# State Classification

Every piece of state should belong to exactly one category.

## Server State

Server state includes data that originates from the backend.

Examples

* Jobs
* Job Details
* Candidate Profiles
* HR Dashboard
* Applications
* Notifications
* User Profile
* Analytics

Always manage server state using **RTK Query**.

Never duplicate server state inside Redux slices.

Never manually synchronize API responses into Redux unless absolutely necessary.

---

## Global Client State

Contains application-wide UI state.

Examples

* Authenticated User
* JWT Session
* Theme
* Sidebar State
* Global Notifications
* Application Preferences

Use Redux Toolkit slices.

---

## Local Component State

Component-specific state should remain local.

Examples

* Dialog Open
* Dropdown Open
* Search Input
* Selected Tab
* Hover State
* Form Step
* Expanded Accordion

Use React hooks.

```tsx
const [isOpen, setIsOpen] = useState(false)
```

Never promote local state into Redux without a compelling reason.

---

# Store Structure

```text
store/

index.ts
hooks.ts
middleware.ts
rootReducer.ts
```

Feature slices belong inside their respective feature folder whenever possible.

Example

```text
features/

auth/
    authSlice.ts

theme/
    themeSlice.ts

notifications/
    notificationSlice.ts
```

---

# Redux Store

Only store truly global state.

Recommended slices

```text
auth

theme

notifications

app
```

Avoid large monolithic reducers.

Each slice should own a single concern.

---

# RTK Query

RTK Query is the single source of truth for all API communication.

Create one base API.

Example

```text
services/api/

baseApi.ts
```

Feature endpoints should inject into the base API.

Example

```text
services/api/

baseApi

↓

features/jobs/api/

↓

features/auth/api/

↓

features/profile/api/
```

Avoid creating multiple API instances.

---

# API Organization

Each feature owns its endpoints.

Example

```text
features/

jobs/

api/

jobsApi.ts

types/

services/
```

Do not place every endpoint inside one large file.

---

# Authentication

Authentication state belongs inside Redux.

Store

* Current User
* Authentication Status
* Role
* Token Metadata (if required)

Avoid storing sensitive information unnecessarily.

Prefer HttpOnly cookies for authentication in production.

If access tokens must exist in memory, never persist them to localStorage.

---

# Theme

Theme state belongs in Redux only if multiple application areas require centralized control.

Otherwise, use a dedicated Theme Provider.

Theme changes should persist across sessions.

---

# Notifications

Use a centralized notification slice.

Support

* Success
* Error
* Warning
* Information

Avoid managing toast visibility manually across multiple components.

---

# Selectors

Always create selectors.

Avoid directly accessing nested state throughout the application.

Example

```tsx
selectCurrentUser

selectTheme

selectIsAuthenticated
```

Selectors improve maintainability.

Memoize expensive selectors using createSelector.

---

# Typed Hooks

Never use Redux hooks directly.

Always expose typed hooks.

```tsx
useAppDispatch()

useAppSelector()
```

These should infer types automatically.

---

# Async Logic

RTK Query should handle

* fetching
* caching
* invalidation
* optimistic updates
* retries

Avoid writing custom async thunks for CRUD operations already handled by RTK Query.

Use createAsyncThunk only for workflows that do not naturally fit RTK Query.

Examples

* Initial application bootstrap
* Multi-step authentication flows
* Complex orchestration involving multiple endpoints

---

# Cache Management

Leverage RTK Query caching.

Configure

* cache tags
* invalidation
* polling only when required
* optimistic updates
* refetch strategies

Avoid manually refetching unless necessary.

Use cache invalidation instead.

---

# API Response Types

Every endpoint must define

Request Type

Response Type

Error Type

Example

```typescript
interface GetJobsResponse {
    jobs: Job[]
    total: number
    page: number
}
```

Never use implicit types.

Never use any.

---

# Optimistic Updates

Use optimistic updates only when they improve user experience.

Examples

* Save Job
* Bookmark
* Like
* Status Toggle

Rollback on failure.

---

# Forms

Form state belongs inside React Hook Form.

Never duplicate form state inside Redux.

Validation belongs to Zod.

Avoid useState for large forms.

---

# Pagination

Pagination state should generally remain local.

RTK Query should request paginated data.

Do not store large datasets globally.

---

# Search

Search input

Local State

Search Results

RTK Query

Debounce search requests.

Avoid storing transient search values globally.

---

# Filters

Page-specific filters

Local State

Application-wide filters

Redux only if shared across multiple pages.

---

# Middleware

Redux middleware should remain minimal.

Possible middleware

* Authentication refresh
* Analytics
* Logging
* Error reporting

Avoid adding middleware unless it solves a real architectural problem.

---

# Persistence

Persist only essential state.

Recommended

* Theme
* User Preferences

Avoid persisting

* API cache
* Forms
* Temporary UI state

---

# Performance

Avoid unnecessary global state.

Normalize data only if complexity justifies it.

Use memoized selectors.

Split slices by responsibility.

Leverage RTK Query cache instead of copying data.

Avoid excessive dispatches.

---

# Error Handling

Every API request should expose

Loading

Success

Error

Retry

Never leave loading indefinitely.

Display meaningful error messages.

---

# Folder Organization

Example

```text
features/

jobs/

api/

jobsApi.ts

components/

hooks/

pages/

services/

types/

constants/

schemas/
```

State management should remain inside the owning feature whenever possible.

---

# Naming Conventions

Slices

authSlice

themeSlice

notificationSlice

API

jobsApi

authApi

candidateApi

Hooks

useGetJobsQuery

useCreateJobMutation

Selectors

selectCurrentUser

selectTheme

selectUnreadNotifications

Actions

login

logout

toggleTheme

setSidebarCollapsed

---

# Testing

Test

Reducers

Selectors

RTK Query endpoints

Custom hooks

Middleware

Mock network requests during tests.

Ensure reducers remain pure.

---

# Anti-Patterns

Avoid

* Storing API responses in Redux slices
* Multiple API clients
* Global form state
* Business logic inside reducers
* Massive reducers
* Dispatching inside reusable UI components
* Duplicated server state
* Overusing createAsyncThunk
* Persisting sensitive authentication data
* Unnecessary global state

---

# Code Review Checklist

Before completing any feature verify

* Server state uses RTK Query
* Global state uses Redux Toolkit
* Local UI state uses React hooks
* No duplicated state
* Typed selectors used
* Typed hooks used
* RTK Query cache configured correctly
* No unnecessary async thunks
* No `any`
* Proper request and response types
* Loading, success, and error states implemented
* Optimistic updates rollback correctly
* Reducers remain pure
* State ownership is clear
* Production-ready architecture
