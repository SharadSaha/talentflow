# Frontend Architecture

## Objective

Build a scalable, maintainable, production-ready React application that follows modern frontend engineering practices.

The application should resemble the quality of products such as Linear, Vercel Dashboard and Stripe Dashboard in terms of architecture, consistency and developer experience.

Every feature should be modular, reusable and independently maintainable.

The architecture should support long-term growth without requiring major refactoring.

---

# Technology Stack

Use the following technologies throughout the project.

* React
* TypeScript
* Vite
* Tailwind CSS
* Redux Toolkit
* RTK Query
* React Router
* React Hook Form
* Zod
* Radix UI
* shadcn/ui
* Lucide React
* class-variance-authority (CVA)
* clsx
* tailwind-merge

Avoid introducing additional libraries unless there is a significant architectural benefit.

---

# Source Structure

Organize the application as follows.

```text
src/

app/
assets/
components/
components/ui/
config/
constants/
containers/
features/
hooks/
layouts/
lib/
middlewares/
pages/
providers/
reducers/
routes/
services/
store/
styles/
types/
utils/
```

Each directory has a single responsibility.

---

# app/

Contains application initialization.

Responsibilities

* App.tsx
* Router configuration
* Global providers
* Theme provider
* Redux provider
* Error boundary
* Application bootstrap

---

# assets/

Contains static assets.

Examples

* images
* illustrations
* fonts
* icons
* logos

---

# components/

Contains reusable business components.

Examples

* JobCard
* CandidateCard
* Navbar
* Sidebar
* UserMenu
* ProfileAvatar
* SearchBar
* FilterPanel
* Pagination
* EmptyState

Business components may compose generic UI components.

Business components should not contain page-level logic.

---

# components/ui/

Contains generic design system components.

Every component should be reusable across the application.

Examples

* Button
* Card
* Dialog
* Drawer
* Sheet
* Badge
* Avatar
* Input
* Textarea
* Select
* Checkbox
* RadioGroup
* Switch
* Tooltip
* Popover
* Tabs
* DropdownMenu
* Skeleton
* Spinner
* Toast
* Alert
* DataTable
* Breadcrumb
* Pagination
* Separator

These components should remain business-agnostic.

Never place business logic inside UI components.

---

# config/

Contains application configuration.

Examples

* routes
* api
* environment
* feature flags

---

# constants/

Contains application-wide constants.

Examples

* Roles
* Routes
* API endpoints
* Validation limits
* Pagination defaults
* Theme constants

Avoid hardcoding values elsewhere.

---

# containers/

Containers connect UI with business logic.

Responsibilities

* fetch data
* compose multiple components
* connect Redux
* invoke RTK Query
* manage page-specific state

Containers should contain minimal UI.

---

# features/

Every major feature owns its implementation.

Example

```text
features/

authentication/

candidate/

dashboard/

jobs/

profile/

hr/

notifications/
```

Each feature should contain

```text
feature/

components/

hooks/

pages/

services/

api/

types/

constants/

utils/

schemas/
```

Each feature owns its own business logic.

Avoid importing implementation details from another feature.

Shared functionality belongs in shared folders.

---

# hooks/

Contains reusable custom hooks.

Examples

* useDebounce
* usePagination
* useInfiniteScroll
* useDisclosure
* useIntersectionObserver
* useAuth
* useTheme

Hooks should encapsulate reusable behavior.

---

# layouts/

Contains reusable application layouts.

Examples

* DashboardLayout
* AuthLayout
* PublicLayout

Layouts should compose pages.

---

# lib/

Contains shared library helpers.

Examples

* axios instance
* date helpers
* formatter helpers
* utility wrappers

---

# middlewares/

Contains Redux middleware if required.

Examples

* logger
* analytics
* error reporting

Avoid unnecessary middleware.

---

# pages/

Contains route-level pages only.

Pages should primarily compose containers.

Avoid placing heavy business logic inside pages.

---

# providers/

Contains global providers.

Examples

* ThemeProvider
* QueryProvider
* ToastProvider

---

# reducers/

Contains Redux slices.

Examples

* authSlice
* userSlice
* themeSlice
* notificationSlice

Feature-specific slices should remain inside their respective feature unless globally shared.

---

# routes/

Contains

* protected routes
* public routes
* role-based guards
* route constants

Keep routing centralized.

---

# services/

Contains shared services.

Examples

* authentication
* storage
* analytics
* local storage
* cookie management

API requests should generally use RTK Query rather than standalone services.

---

# store/

Contains Redux store configuration.

Include

* configureStore
* typed hooks
* middleware configuration

Expose

* RootState
* AppDispatch
* useAppDispatch
* useAppSelector

---

# styles/

Contains

* global.css
* Tailwind entry
* theme variables
* animation utilities

Avoid component-specific CSS whenever Tailwind is sufficient.

---

# types/

Contains globally shared types.

Examples

* User
* Pagination
* ApiResponse
* ApiError

Feature-specific types should remain inside their feature.

---

# utils/

Contains pure utility functions.

Examples

* date
* string
* validation
* formatting
* pagination

Utilities should have no side effects.

---

# Component Guidelines

Each component should have one responsibility.

Separate

* presentation
* business logic
* API communication

Prefer composition over inheritance.

Extract repeated UI into reusable components.

Avoid deeply nested JSX.

Prefer descriptive prop names.

All props must have explicit interfaces.

---

# State Management

Follow these principles.

Use RTK Query for

* API requests
* server caching
* optimistic updates
* mutations

Use Redux only for client state.

Examples

* authenticated user
* theme
* notifications
* application preferences

Avoid duplicating server state inside Redux.

Use local component state for transient UI state.

Examples

* dialog open
* input value
* hover state

---

# Forms

Use

* React Hook Form
* Zod

Every form should have

* validation
* loading state
* disabled submit state
* error messages
* success feedback

Avoid uncontrolled form logic.

---

# API Layer

RTK Query should be the primary API abstraction.

Create one API slice.

Inject feature endpoints.

Example

```text
services/api/

baseApi

↓

features/jobs/api/

features/auth/api/

features/profile/api/
```

Avoid multiple API clients.

---

# Routing

Separate

Public routes

Protected routes

Role-based routes

Unauthorized routes

Avoid authentication logic inside page components.

Use route guards.

---

# Error Handling

Every asynchronous operation should handle

* loading
* success
* error

Never leave blank screens.

Provide meaningful empty states.

---

# Performance

Lazy load pages.

Memoize only when beneficial.

Virtualize long lists.

Debounce search inputs.

Avoid unnecessary renders.

Use React DevTools profiling before optimizing.

---

# Accessibility

Use semantic HTML.

Every button should be keyboard accessible.

Every form field should have labels.

Every modal should trap focus.

Every interactive element should have visible focus indicators.

---

# Responsive Design

Desktop-first design.

Support

* mobile
* tablet
* desktop
* large desktop

Avoid fixed widths.

Prefer flexible layouts.

---

# Naming Conventions

Components

PascalCase

Example

JobCard.tsx

Hooks

camelCase beginning with use

Example

useAuth.ts

Utilities

camelCase

Example

formatSalary.ts

Interfaces

Prefix with I only when it improves readability; otherwise prefer descriptive names such as JobCardProps or CandidateProfile.

Enums

PascalCase

Constants

UPPER_SNAKE_CASE only for compile-time constants.

---

# Code Review Checklist

Before completing any feature verify

* Component has one responsibility
* No business logic inside UI components
* No duplicated code
* Proper interfaces everywhere
* No any
* Uses RTK Query correctly
* Uses Redux appropriately
* Uses React Hook Form and Zod for forms
* Responsive layout
* Accessible interactions
* Loading, error and empty states implemented
* Imports organized
* Tailwind classes remain readable
* No unnecessary re-renders
* Production-ready quality
