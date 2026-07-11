<div align="center">

# 🧭 TalentFlow

**A modern, full-stack recruitment platform connecting HR teams and candidates.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Monorepo Folder Structure](#-monorepo-folder-structure)
- [Database Design](#-database-design)
- [Environment Variables](#-environment-variables)
- [Getting Started — Docker](#-getting-started--docker)
- [Getting Started — Local Development](#-getting-started--local-development)
- [Testing, Linting, Formatting, Type-check & Build](#-testing-linting-formatting-type-check--build)
- [API Overview](#-api-overview)
- [Test Credentials](#-test-credentials)
- [Seed Data](#-seed-data)
- [Screenshots](#-screenshots)
- [Troubleshooting](#-troubleshooting)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## 🎯 Project Overview

**TalentFlow** is a two-sided job portal built as a TypeScript monorepo. It pairs a
**React 19 + Vite single-page app** with an **Express 5 + Prisma 7 REST API** backed by
**PostgreSQL**, all containerised with Docker Compose for one-command startup.

The platform serves two personas, each with a dedicated portal, layout, and role-guarded
routes:

- **Candidates** — browse and filter live jobs, view rich job details, apply with a cover
  letter, track application status, and manage a detailed professional profile.
- **HR / Recruiters** — post, edit, publish, close, and soft-delete jobs; review and filter
  applicants per job; and advance candidates through the hiring pipeline.

The codebase follows a strict, layered backend architecture
(**routes → controllers → services → repositories → Prisma**), a feature-sliced frontend,
end-to-end TypeScript with no `any`, Zod validation on both tiers, and JWT + RBAC auth.

---

## ✨ Key Features

### 👤 Candidate Features

| Feature | Description |
| ------- | ----------- |
| **Career Hub dashboard** | Personalised landing view of activity and recommended actions (`/candidate/dashboard`). |
| **Browse jobs** | Paginated, filterable listing of live (published) jobs (`/candidate/jobs`). |
| **Advanced job filters** | Filter by employment type, experience level, location type, location, and salary — every filter maps to an indexed DB column. |
| **Job details** | Full posting view with company, skills, salary, and an inline apply flow (`/candidate/jobs/:id`). |
| **Apply to jobs** | One application per job (enforced by a DB unique constraint), with an optional cover letter and resume URL snapshot. |
| **My Applications** | Track every application and its live pipeline status (`/candidate/applications`). |
| **Withdraw applications** | Candidates can withdraw their own applications. |
| **Profile management** | Headline, about, contact, location/salary preferences, skills, and education history (`/candidate/profile`). |
| **Settings** | Account preferences and theme (`/candidate/settings`). |

### 🏢 HR Features

| Feature | Description |
| ------- | ----------- |
| **Hiring Hub dashboard** | Aggregated recruiting metrics for the signed-in recruiter (`/hr/dashboard`). |
| **Jobs management** | View and manage all of the recruiter's own jobs across every status (`/hr/jobs`). |
| **Create job** | Draft/publish a posting with skills, salary band, openings, and experience range (`/hr/jobs/new`). |
| **Edit & close job** | Update a posting or move it to `CLOSED` (`/hr/jobs/:id/edit`). |
| **Soft delete** | Jobs are soft-deleted (`deletedAt`) so applicant history is never orphaned. |
| **Applicants board** | List and filter applicants per job (`/hr/applicants`). |
| **Status workflow** | Advance applicants through `APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFERED → HIRED / REJECTED`, with an append-only audit trail. |
| **HR profile & settings** | Recruiter profile tied to a company, plus settings (`/hr/profile`, `/hr/settings`). |

### 🔐 Auth & RBAC

| Capability | Detail |
| ---------- | ------ |
| **JWT authentication** | Stateless bearer tokens signed with `JWT_SECRET`, sent via `Authorization: Bearer <token>`. |
| **Password hashing** | Passwords hashed with **bcrypt** (12 salt rounds in the seed). |
| **Candidate self-registration** | `POST /auth/register` publicly creates a **Candidate** account. |
| **Role-based access control** | An `authorize(role)` middleware gates every protected route by `UserRole` (`HR` / `CANDIDATE`). |
| **Route guards (frontend)** | `GuestRoute`, `ProtectedRoute`, and `RoleRoute` mirror the backend RBAC, with role-namespaced `/candidate` and `/hr` areas. |
| **Ownership checks** | HR can only manage their own jobs/applicants; candidates only their own profile/applications. |
| **Hardening** | Helmet security headers, CORS allow-list, request rate limiting, and gzip compression. |

---

## 🧰 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **Frontend framework** | React 19 · Vite 8 · TypeScript 5 |
| **Styling / UI** | Tailwind CSS 4 · Radix UI primitives · `class-variance-authority` · Lucide icons · Framer Motion |
| **State & data** | Redux Toolkit · RTK Query (single API slice, tag-based cache invalidation) |
| **Routing** | React Router 7 (lazy, code-split routes) |
| **Forms & validation** | React Hook Form · Zod · `@hookform/resolvers` |
| **Frontend testing** | Vitest · Testing Library · jsdom |
| **Backend runtime** | Node.js 20+ · Express 5 · TypeScript 5 |
| **ORM & database** | Prisma 7 (`prisma-client` generator) · PostgreSQL 17 · `@prisma/adapter-pg` |
| **Auth & security** | JSON Web Tokens · bcrypt · Helmet · CORS · `express-rate-limit` |
| **Validation** | Zod (request `body`/`params`/`query` schemas via a `validate` middleware) |
| **Caching / infra** | Redis 7 (client provisioned) · compression · morgan logging · cookie-parser |
| **Backend testing** | Jest · Supertest · ts-jest |
| **Tooling** | ESLint · Prettier · Husky · lint-staged · tsx · nodemon · `@faker-js/faker` |
| **Containers** | Docker (multi-stage builds) · Docker Compose · nginx (SPA serving) |

---

## 🏛️ Architecture

### Layered request flow

The backend enforces a strict, unidirectional layering. Each request passes through
cross-cutting middleware, then flows down the layers and back:

```mermaid
flowchart LR
    Browser["🌐 React SPA<br/>(RTK Query / Axios)"]
    subgraph API["Express API (/api/v1)"]
        direction TB
        MW["Middleware<br/>Helmet · CORS · RateLimit<br/>authenticate · authorize · validate(Zod)"]
        RT["Routes"]
        CT["Controllers"]
        SV["Services<br/>(business logic)"]
        RP["Repositories<br/>(data access)"]
        MW --> RT --> CT --> SV --> RP
    end
    Prisma["Prisma Client 7"]
    PG[("🐘 PostgreSQL 17")]
    Redis[("⚡ Redis 7")]

    Browser -- "HTTPS / JSON" --> MW
    RP --> Prisma --> PG
    SV -. cache .-> Redis
    PG --> Prisma --> RP --> SV --> CT -- "JSON response" --> Browser
```

### Docker service topology

```mermaid
flowchart TB
    User["👤 Browser"]
    subgraph net["talentflow bridge network"]
        FE["frontend<br/>nginx : 80<br/>(React SPA)"]
        BE["backend<br/>Express : 4000<br/>/health"]
        DB[("postgres : 5432<br/>volume: postgres_data")]
        RD[("redis : 6379<br/>volume: redis_data")]
    end

    User -- "http://localhost:8080" --> FE
    User -- "http://localhost:4000/api/v1" --> BE
    FE -. depends_on .-> BE
    BE -- "postgres:5432" --> DB
    BE -- "redis:6379" --> RD
    BE -. depends_on (healthcheck) .-> DB
    BE -. depends_on (healthcheck) .-> RD
```

> The **browser** reaches the API through the host-published port
> (`http://localhost:4000/api/v1`). **Container-to-container** traffic uses service names
> (`postgres`, `redis`) on the shared `talentflow` network.

---

## 🗂️ Monorepo Folder Structure

```
talentflow/
├── frontend/                     # React + Vite SPA
│   ├── src/
│   │   ├── app/                  # App root & providers wiring
│   │   ├── components/           # Shared UI (ui/, navigation/, sidebar/, feedback/…)
│   │   ├── config/               # env.ts (typed build-time env)
│   │   ├── constants/            # routes, roles, etc.
│   │   ├── features/             # Feature slices: auth, jobs, applications,
│   │   │                         #   dashboard, hr, profile, settings, landing
│   │   ├── hooks/                # Reusable hooks (e.g. useModuleSearch)
│   │   ├── layouts/              # AuthLayout, CandidateLayout, HRLayout, AppShell
│   │   ├── routes/               # route-config.tsx + Guest/Protected/Role routes
│   │   ├── services/             # api/ (RTK Query base), auth/, storage/
│   │   ├── store/ · reducers/    # Redux Toolkit store & slices
│   │   └── ...
│   ├── Dockerfile                # Multi-stage build → nginx
│   ├── nginx.conf                # SPA fallback, asset caching, /healthz
│   └── .env.example
├── backend/                      # Express + TypeScript API
│   ├── src/
│   │   ├── app.ts · server.ts    # App factory & HTTP bootstrap
│   │   ├── config/               # Typed env loading
│   │   ├── constants/            # Route path & validation constants
│   │   ├── auth/                 # authenticate & authorize middleware
│   │   ├── middlewares/          # validate (Zod), error-handler, not-found
│   │   ├── modules/              # Feature modules (routes/controller/service/schemas):
│   │   │                         #   auth, jobs, applications, candidate-profile, dashboard
│   │   ├── routes/               # v1 router aggregation
│   │   ├── common/ · errors/     # Shared schemas & typed errors
│   │   ├── database/ · utils/    # Prisma client & helpers
│   │   └── generated/prisma/     # Generated Prisma client (committed output dir)
│   ├── prisma/
│   │   ├── schema.prisma         # Data model
│   │   └── seed.ts               # Deterministic Faker seed
│   ├── Dockerfile                # Multi-stage build → Node 22 runtime
│   └── .env.example
├── docker/                       # Container docs & shared assets
├── docs/                         # API.md · ARCHITECTURE.md
├── docker-compose.yml            # Orchestrates all four services
├── run-local.sh                  # Local dev orchestration script (npm run dev)
├── .env.example                  # Optional Compose overrides
└── package.json                  # Root: Husky + lint-staged + workspace scripts
```

---

## 🗄️ Database Design

The schema is a normalized, production-oriented relational model. Authentication identity
(`User`) is separated from role-specific data (`CandidateProfile` / `HrProfile`); shared
vocabularies (`Company`, `Skill`) are stored once and referenced. Primary keys are
time-ordered **UUIDv7**, and every model carries `createdAt` / `updatedAt`.

```mermaid
erDiagram
    User ||--o| CandidateProfile : "1:1"
    User ||--o| HrProfile : "1:1"
    User ||--o{ Job : "posts"
    User ||--o{ ApplicationStatusEvent : "changes"

    HrProfile }o--|| Company : "recruits for"
    Company ||--o{ Job : "owns"

    Job ||--o{ JobSkill : "has"
    Skill ||--o{ JobSkill : "tagged in"
    Job ||--o{ Application : "receives"

    CandidateProfile ||--o{ CandidateSkill : "has"
    Skill ||--o{ CandidateSkill : "claimed by"
    CandidateProfile ||--o{ EducationEntry : "has"
    CandidateProfile ||--o{ Application : "submits"

    Application ||--o{ ApplicationStatusEvent : "audit trail"

    User {
        string id PK
        string email UK
        string passwordHash
        UserRole role
        boolean isActive
    }
    CandidateProfile {
        string id PK
        string userId UK
        string headline
        int totalExperienceMonths
        EducationLevel highestEducation
        boolean isOpenToWork
    }
    HrProfile {
        string id PK
        string userId UK
        string companyId FK
        string designation
    }
    Company {
        string id PK
        string name UK
        string slug UK
        CompanySize size
        string industry
    }
    Skill {
        string id PK
        string name UK
        string slug UK
    }
    Job {
        string id PK
        string companyId FK
        string postedById FK
        string title
        EmploymentType employmentType
        ExperienceLevel experienceLevel
        LocationType locationType
        JobStatus status
        datetime deletedAt
    }
    JobSkill {
        string id PK
        string jobId FK
        string skillId FK
        boolean isRequired
    }
    CandidateSkill {
        string id PK
        string candidateProfileId FK
        string skillId FK
        ProficiencyLevel proficiency
    }
    EducationEntry {
        string id PK
        string candidateProfileId FK
        string institution
        EducationLevel level
    }
    Application {
        string id PK
        string jobId FK
        string candidateProfileId FK
        ApplicationStatus status
        string coverLetter
    }
    ApplicationStatusEvent {
        string id PK
        string applicationId FK
        ApplicationStatus status
        string changedById FK
    }
```

**Enums:** `UserRole`, `EmploymentType`, `ExperienceLevel`, `LocationType`, `SalaryPeriod`,
`JobStatus`, `ApplicationStatus`, `EducationLevel`, `ProficiencyLevel`, `CompanySize`.

Key constraints: unique `(jobId, candidateProfileId)` prevents duplicate applications;
unique `(jobId, skillId)` and `(candidateProfileId, skillId)` on the join tables; composite
indexes power the primary browse query (`status, deletedAt, createdAt`) and the HR applicant
board (`jobId, status`).

---

## 🔐 Environment Variables

Secrets are **never** committed. Each package ships a `.env.example` — copy it to `.env` and
fill in real values.

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
| -------- | ----------- | ----------------- |
| `NODE_ENV` | Runtime environment (`development` / `test` / `production`) | `development` |
| `PORT` | Port the Express server listens on | `4000` |
| `CORS_ORIGIN` | Comma-separated allowed CORS origins (frontend URL) | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) | `postgresql://talentflow:talentflow@localhost:5432/talentflow?schema=public` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret used to sign/verify JWTs (use `openssl rand -hex 32`) | `replace-with-a-long-random-secret` |
| `JWT_EXPIRES_IN` | Access token lifetime | `1d` |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window per client | `100` |

> When running under Docker Compose, `DATABASE_URL` uses the service host `postgres` and
> `REDIS_URL` uses `redis` (see the commented lines in `backend/.env.example`).

### Frontend (`frontend/.env`)

Only variables prefixed with `VITE_` are exposed to the client bundle. They are baked in at
**build time**.

| Variable | Description | Example / Default |
| -------- | ----------- | ----------------- |
| `VITE_API_BASE_URL` | Base URL of the versioned backend API | `http://localhost:4000/api/v1` |
| `VITE_APP_NAME` | Application display name | `TalentFlow` |

### Root Compose overrides (`.env`, optional)

`docker-compose.yml` has defaults for everything, so a root `.env` is **not required**.
Override any of: `POSTGRES_USER/PASSWORD/DB/PORT`, `REDIS_PORT`, `NODE_ENV`, `BACKEND_PORT`,
`CORS_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_PORT`, `VITE_API_BASE_URL`,
`VITE_APP_NAME`.

> ⚠️ **Note:** `docker-compose.yml` currently passes `VITE_API_BASE_URL=http://localhost:4000/api`
> (without the `/v1` suffix), while the API and the frontend default both expect
> `http://localhost:4000/api/v1`. If the Dockerised SPA cannot reach the API, set
> `VITE_API_BASE_URL=http://localhost:4000/api/v1` in a root `.env` before building.

---

## 🐳 Getting Started — Docker

The **entire stack** (frontend, backend, PostgreSQL, Redis) starts with a single command —
no extra configuration required:

```bash
docker compose up --build
```

This will:

1. Start **PostgreSQL 17** and **Redis 7** with health checks and named volumes
   (`postgres_data`, `redis_data`).
2. Build and start the **backend** (multi-stage Node 22 image) once the datastores are
   healthy. It exposes `/health`.
3. Build and start the **frontend** (multi-stage build → **nginx** serving the SPA) once the
   backend is up.

| Service | URL / Port |
| ------- | ---------- |
| Frontend (nginx SPA) | http://localhost:8080 |
| Backend API | http://localhost:4000 |
| API base | http://localhost:4000/api/v1 |
| Health check | http://localhost:4000/health |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

Common commands:

```bash
docker compose up --build          # build images and start everything
docker compose up --build -d       # ...in the background (detached)
docker compose logs -f backend     # tail a service's logs
docker compose down                # stop and remove containers
docker compose down -v             # ...and delete volumes (wipes the database)
```

> **Migrations & seed:** the Compose stack starts the compiled server directly. Applying
> Prisma migrations (`prisma migrate deploy`) and running the seed against the containerised
> database are done via the backend tooling (see below) — e.g. exec into the backend
> container or point a local `DATABASE_URL` at `localhost:5432` and run
> `npm --prefix backend run prisma:deploy && npm --prefix backend run prisma:seed`.

---

## 💻 Getting Started — Local Development

Run the frontend and backend directly on your machine (best for active development).
Requires **Node.js ≥ 20** (see `.nvmrc` → `20`) and a running **PostgreSQL** instance
(Redis optional). The quickest way to get the datastores is:

```bash
docker compose up -d postgres redis
```

**1. Clone & install**

```bash
git clone <repo-url> talentflow
cd talentflow
npm run install:all        # installs root + frontend + backend deps and Git hooks
```

**2. Configure environment**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**3. Set up the database**

```bash
npm --prefix backend run prisma:generate     # generate the Prisma client
npm --prefix backend run prisma:migrate      # create & apply dev migrations
npm --prefix backend run prisma:seed         # seed a large deterministic dataset
```

**4. Start the dev servers**

```bash
npm run dev                # orchestrated start (run-local.sh)
# ...or run each package individually:
npm run dev:backend        # backend  → http://localhost:4000
npm run dev:frontend       # frontend → http://localhost:5173
```

| Service | URL |
| ------- | --- |
| Frontend (Vite dev) | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| API base | http://localhost:4000/api/v1 |
| Health | http://localhost:4000/health |

---

## 🧪 Testing, Linting, Formatting, Type-check & Build

Run per package with `npm --prefix <frontend|backend> run <script>`.

### Frontend

| Task | Command |
| ---- | ------- |
| Unit tests | `npm --prefix frontend run test` |
| Tests (watch) | `npm --prefix frontend run test:watch` |
| Coverage | `npm --prefix frontend run test:coverage` |
| Lint / fix | `npm --prefix frontend run lint` · `lint:fix` |
| Format | `npm --prefix frontend run format` |
| Type-check | `npm --prefix frontend run typecheck` |
| Production build | `npm --prefix frontend run build` (→ preview with `npm --prefix frontend run preview`) |

### Backend

| Task | Command |
| ---- | ------- |
| Unit / integration tests | `npm --prefix backend run test` (Jest + Supertest, `--runInBand`) |
| Tests (watch) | `npm --prefix backend run test:watch` |
| Lint / fix | `npm --prefix backend run lint` · `lint:fix` |
| Format | `npm --prefix backend run format` |
| Type-check | `npm --prefix backend run typecheck` |
| Production build | `npm --prefix backend run build` (→ run with `npm --prefix backend run start`) |
| Prisma | `prisma:generate` · `prisma:migrate` · `prisma:deploy` · `prisma:reset` · `prisma:studio` · `prisma:seed` |

### Root

| Task | Command |
| ---- | ------- |
| Install everything | `npm run install:all` |
| Lint both packages | `npm run lint` |
| Format whole repo | `npm run format` |
| Dev (orchestrated) | `npm run dev` |

---

## 📡 API Overview

All endpoints are versioned under **`/api/v1`**. Authenticated routes require a JWT bearer
token (`Authorization: Bearer <token>`); role columns indicate the required `UserRole`.

Base URL: `http://localhost:4000/api/v1` · Health: `GET /health` (unversioned)

### Auth — `/auth`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/auth/register` | Public | Register a new **Candidate** account |
| `POST` | `/auth/login` | Public | Authenticate and receive an access token |
| `GET` | `/auth/me` | Authenticated | Fetch the current authenticated user |

### Candidate Profile — `/profile`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/profile` | Candidate | Get the signed-in candidate's profile |
| `PATCH` | `/profile` | Candidate | Update the signed-in candidate's profile |

### Jobs — `/jobs`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/jobs` | HR | Create a job posting |
| `GET` | `/jobs` | Authenticated | Browse live jobs (filter + paginate) |
| `GET` | `/jobs/:id` | Authenticated | Job details (non-live jobs visible to owner only) |
| `PATCH` | `/jobs/:id` | HR (owner) | Edit or close a job |
| `DELETE` | `/jobs/:id` | HR (owner) | Soft-delete a job |
| `GET` | `/jobs/:id/applications` | HR (owner) | List applicants for a job |

### HR Jobs — `/hr`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/hr/jobs` | HR | List the signed-in HR user's own jobs (any status) |

### Applications — `/applications`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/applications` | Candidate | Apply to a job |
| `GET` | `/applications/me` | Candidate | List the candidate's own applications |
| `PATCH` | `/applications/:id/status` | HR (owner) | Update an applicant's pipeline status |
| `PATCH` | `/applications/:id/withdraw` | Candidate (owner) | Withdraw an application |

### Dashboard — `/dashboard`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/dashboard/candidate` | Candidate | Candidate dashboard aggregates |
| `GET` | `/dashboard/hr` | HR | HR dashboard aggregates |

> See [`docs/API.md`](docs/API.md) for the evolving detailed reference.

---

## 🔑 Test Credentials

The seed provisions well-known demo accounts (passwords are bcrypt-hashed):

| Role | Email | Password |
| ---- | ----- | -------- |
| **HR** | `admin@test.com` | `Admin@1234` |
| **Candidate** | `candidate@test.com` | `Candidate@1234` |
| Named secondary HR / Candidate | `<name>@test.com` | `Password@123` |

The primary HR account recruits for the **Acme Cloud** company (slug `acme-cloud`) and owns a
full board of demo jobs; the primary candidate has a spread of applications for demoing the
pipeline.

---

## 🌱 Seed Data

`backend/prisma/seed.ts` generates a large, realistic, and **fully deterministic** dataset so
every screen has meaningful content and filters/pagination/search are exercised at scale.

| Entity | Approx. volume |
| ------ | -------------- |
| Companies | ~50 |
| Skills | ~300 |
| HR users (with `HrProfile`) | ~100 |
| Candidate users (with `CandidateProfile`, skills & education) | ~500 |
| **Total users** | **~600** |
| Jobs (across companies / authors, with skills) | ~500 |
| Applications (long-tail spread, each with a status-event audit trail) | ~3,000 |

**Determinism:** all randomness flows through a single seeded Faker instance
(`faker.seed(20260101)`) anchored to a fixed reference date (`2026-01-01`), so repeated runs
produce byte-identical data — reproducible demos and stable screenshots. Rows are minted with
pre-generated UUIDv7 ids and inserted with batched `createMany`; the shared demo password is
hashed once and reused for performance.

Run it with `npm --prefix backend run prisma:seed` (or `npx prisma db seed`).

---

## 🖼️ Screenshots

> Replace the placeholder paths below with real captures (e.g. under `docs/screenshots/`).

| | |
| --- | --- |
| ![Landing page](docs/screenshots/landing.png)<br/>**Landing page** | ![Candidate dashboard](docs/screenshots/candidate-dashboard.png)<br/>**Candidate dashboard (Career Hub)** |
| ![Browse jobs](docs/screenshots/browse-jobs.png)<br/>**Browse jobs** | ![Job details](docs/screenshots/job-details.png)<br/>**Job details** |
| ![HR dashboard](docs/screenshots/hr-dashboard.png)<br/>**HR dashboard (Hiring Hub)** | ![Applicants](docs/screenshots/applicants.png)<br/>**Applicants board** |
| ![Settings](docs/screenshots/settings.png)<br/>**Settings** | |

---

## 🛠️ Troubleshooting

| Symptom | Likely cause & fix |
| ------- | ------------------ |
| **Port already in use** (`5173` / `4000` / `8080` / `5432` / `6379`) | Another process/container holds the port. Stop it, or override via env: `BACKEND_PORT`, `FRONTEND_PORT`, `POSTGRES_PORT`, `REDIS_PORT` in a root `.env`. |
| **Backend can't connect to the database** | Postgres isn't ready yet, or `DATABASE_URL` is wrong. Compose gates the backend on the Postgres health check; locally, ensure Postgres is running and the host/port/credentials in `backend/.env` match. |
| **`PrismaClientInitializationError` / missing client** | Run `npm --prefix backend run prisma:generate` (and apply migrations with `prisma:migrate` / `prisma:deploy`). The client is generated into `backend/src/generated/prisma`. |
| **Dockerised frontend can't reach the API** | Build-time `VITE_API_BASE_URL` must include `/api/v1`. Set `VITE_API_BASE_URL=http://localhost:4000/api/v1` in a root `.env` and rebuild the frontend image. |
| **CORS errors in the browser** | Ensure `CORS_ORIGIN` on the backend matches the frontend origin (`http://localhost:5173` locally, `http://localhost:8080` under Docker). |
| **Node version errors** | Use Node **≥ 20** (`.nvmrc` → `20`; Docker images use Node 22). Run `nvm use`. |
| **Seed fails with "DATABASE_URL is not set"** | Export/define `DATABASE_URL` (via `backend/.env`) before running the seed. |
| **Rate-limited (HTTP 429)** | The API rate-limits per window. Raise `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` for local testing. |

---

## ⚠️ Known Limitations

- **Resume upload is a URL only** — `resumeUrl` fields exist on `CandidateProfile` and
  `Application`, but no file-upload/storage pipeline is implemented.
- **Redis is provisioned but not yet wired into request handling** — the client dependency
  and `REDIS_URL` are in place; caching/session use is a hook for the future.
- **Public registration creates candidates only** — HR accounts are provisioned via the seed
  (there is no public HR self-registration endpoint on the backend).
- **Notifications / email** are not implemented.
- **Compose does not auto-run migrations/seed** — the containerised backend runs the compiled
  server directly; database migration + seeding are manual steps.
- **`VITE_API_BASE_URL` mismatch in Compose** — see the note in
  [Environment Variables](#-environment-variables).
- **No CI/CD pipeline** is included in the repository.

---

## 🚀 Future Improvements

- [ ] File-based resume upload & storage (S3-compatible).
- [ ] Redis-backed caching for browse/list endpoints and rate limiting.
- [ ] Email / in-app notifications for application status changes.
- [ ] Company Pages and richer employer branding (schema already supports it).
- [ ] Candidate ↔ job match scoring (join tables already carry `isRequired` / `proficiency`).
- [ ] Interview scheduling built on the `ApplicationStatusEvent` timeline.
- [ ] OpenAPI/Swagger spec generated from the Zod schemas.
- [ ] CI/CD pipeline with automated tests, image builds, and deployments.

---

## 📄 License

Released under the [MIT License](LICENSE).

<div align="center">
<sub>Built with ❤️ — TalentFlow</sub>
</div>
