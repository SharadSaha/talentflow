<div align="center">

# 🧭 TalentFlow

**An enterprise, full-stack recruitment platform connecting HR organizations and candidates.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-RTK_Query-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)](https://render.com)
[![Neon](https://img.shields.io/badge/DB-Neon-00E599?logo=postgresql&logoColor=white)](https://neon.tech)
[![Upstash](https://img.shields.io/badge/Cache-Upstash-00E9A3?logo=upstash&logoColor=white)](https://upstash.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Database Design](#-database-design)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Local Setup](#-local-setup)
- [Docker Setup](#-docker-setup)
- [Production Deployment](#-production-deployment)
- [Testing](#-testing)
- [Docker Commands](#-docker-commands)
- [Available Scripts](#-available-scripts)
- [Health Endpoint](#-health-endpoint)
- [API Overview](#-api-overview)
- [Test Credentials](#-test-credentials)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🎯 Project Overview

**TalentFlow** is a two-sided job portal built as a TypeScript monorepo and prepared for
**cloud deployment**. It pairs a **React 19 + Vite single-page app** (deployed to **Vercel**)
with an **Express 5 + Prisma 7 REST API** (deployed to **Render**), backed by a **Neon**
serverless PostgreSQL database and an optional **Upstash** Redis instance.

The platform serves two personas, each with a dedicated portal, layout, and role-guarded
routes:

- **Candidates** — browse and filter live jobs, view rich job details, apply with a cover
  letter, track application status, and manage a detailed professional profile.
- **HR / Recruiters** — belong to an **organization (Company)**, post/edit/publish/close and
  soft-delete jobs under that organization, review and filter applicants per job, and advance
  candidates through the hiring pipeline.

The codebase follows a strict, layered backend architecture
(**routes → controllers → services → repositories → Prisma**), a feature-sliced frontend,
end-to-end TypeScript with no `any`, Zod validation on both tiers, and JWT + RBAC auth.

> **Docker is for local development only.** The Compose stack spins up the full environment on
> your machine; the production topology (Vercel / Render / Neon / Upstash) is described in
> [Production Deployment](#-production-deployment) and is **not** containerized.

---

## ✨ Features

### 👤 Candidate Features

| Feature | Description |
| ------- | ----------- |
| **Career Hub dashboard** | Personalised activity view and aggregates (`GET /dashboard/candidate`, `/candidate/dashboard`). |
| **Browse jobs** | Paginated, filterable listing of live (`PUBLISHED`) jobs (`/candidate/jobs`). |
| **Advanced job filters** | Filter by employment type, experience level, work mode, location, salary range, skills, company, and keyword — each maps to an indexed DB column or normalized join. |
| **Job details** | Full posting view with company, skills, and salary, plus an inline apply flow (`/candidate/jobs/:id`). |
| **Apply to jobs** | One application per job (enforced by a DB unique constraint), with an optional cover letter and resume-URL snapshot. |
| **My Applications** | Track every application and its live pipeline status (`GET /applications/me`, `/candidate/applications`). |
| **Withdraw applications** | Candidates can withdraw their own applications (`PATCH /applications/:id/withdraw`). |
| **Profile management** | Headline, about, contact, location/salary preferences, skills, and education history (`/candidate/profile`). |
| **Settings** | Account preferences and theme (`/candidate/settings`). |

### 🏢 HR Features

| Feature | Description |
| ------- | ----------- |
| **Hiring Hub dashboard** | Aggregated recruiting metrics for the signed-in recruiter (`GET /dashboard/hr`, `/hr/dashboard`). |
| **Jobs management** | View and manage the recruiter's own jobs across every status (`GET /hr/jobs`, `/hr/jobs`). |
| **Create job** | Draft or publish a posting with skills, salary band, openings, and experience range (`POST /jobs`, `/hr/jobs/new`). |
| **Edit & close job** | Update a posting or move it to `CLOSED` (`PATCH /jobs/:id`, `/hr/jobs/:id/edit`). |
| **Soft delete** | Jobs are soft-deleted (`deletedAt`) so applicant history is never orphaned (`DELETE /jobs/:id`). |
| **Applicants board** | List and filter applicants per job, or across all of the recruiter's jobs (`GET /jobs/:id/applications`, `GET /applications/hr-applicants`, `/hr/applicants`). |
| **Status workflow** | Advance applicants through `APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFERED → HIRED / REJECTED / WITHDRAWN`, with an append-only audit trail (`PATCH /applications/:id/status`). |
| **HR profile & settings** | Recruiter profile tied to an organization, plus settings (`/hr/profile`, `/hr/settings`). |

### 🏛️ Organization Management

TalentFlow is **organization-aware**. In the data model a **`Company` is the Organization**:
recruiters do not act as lone individuals but as members of an employer.

| Concept | Where it lives | Detail |
| ------- | -------------- | ------ |
| **HR belongs to an organization** | `HrProfile.companyId → Company` | Every HR account is linked (1:1 profile) to exactly one organization. Deleting a company is `Restrict`-guarded while HR profiles reference it. |
| **Org-scoped jobs** | `Job.companyId → Company` | When an HR user creates a job, the service resolves their organization (`findHrCompanyIdByUserId`) and stamps `Job.companyId` — the posting is owned by the organization, not just the person. |
| **Org-scoped visibility & authorization** | HR modules | The HR dashboard, jobs list, and applicant board are all scoped to the recruiter's **organization** — the company id is always derived server-side from the authenticated HR's `HrProfile.companyId`. A recruiter sees (and can edit/delete) every job posted by any teammate in the same organization, and **never** another organization's jobs, applicants, or analytics. Client-provided organization ids are never trusted. |
| **HR self-registration with organization** | `POST /auth/register` (`role: 'HR'`) | Registering as HR requires a non-empty `organizationName`; the backend find-or-creates the `Company` and links the new `HrProfile`. |
| **Seeded multi-org demo** | `prisma/seed.ts` | Ten real organizations back the demo recruiters. **SkyPoint Technologies** has two recruiters (`hr1`, `hr3`) who each post jobs, so `hr1` sees `hr3`'s jobs (same org) but not **Vertex Labs** (`hr2`) — making cross-organization separation directly demonstrable. |

### 🔑 Authentication

| Capability | Detail |
| ---------- | ------ |
| **JWT (stateless)** | Bearer tokens signed with `JWT_SECRET`, sent via `Authorization: Bearer <token>`; lifetime controlled by `JWT_EXPIRES_IN`. |
| **Password hashing** | Passwords hashed with **bcrypt**. |
| **Self-registration (candidate + HR)** | `POST /auth/register` creates a **Candidate** by default, or an **HR** account (with a mandatory `organizationName`) when `role: 'HR'` is supplied. |
| **Login / current user** | `POST /auth/login` returns an access token; `GET /auth/me` returns the authenticated user. |
| **Auth rate limiting** | A stricter limiter (`AUTH_RATE_LIMIT_*`) guards `/auth/login` and `/auth/register` against brute-force and enumeration. |

### 🛡️ Authorization / RBAC

| Capability | Detail |
| ---------- | ------ |
| **Role-based access control** | An `authorize(role)` middleware gates every protected route by `UserRole` (`HR` / `CANDIDATE`). |
| **`authenticate` middleware** | Verifies the JWT and attaches the typed `AuthUser` to the request. |
| **Organization-scoped authorization** | HR access is scoped to their organization: `assertOwnedJob` authorizes by `job.companyId === hrCompanyId` (derived from the authenticated HR), so a recruiter can only view/edit/delete jobs and applicants within their own organization. Candidates can only touch their own profile/applications. |
| **Route guards (frontend)** | `GuestRoute`, `ProtectedRoute`, and `RoleRoute` mirror the backend RBAC, with role-namespaced `/candidate` and `/hr` areas. |
| **Hardening** | Helmet security headers, CORS allow-list, global + auth rate limiting, gzip compression, and a 1 MB JSON body cap. |

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
        SV["Services<br/>(business logic, RBAC, ownership)"]
        RP["Repositories<br/>(data access)"]
        MW --> RT --> CT --> SV --> RP
    end
    Prisma["Prisma Client 7"]
    PG[("🐘 PostgreSQL")]
    Redis[("⚡ Redis (optional)")]

    Browser -- "HTTPS / JSON" --> MW
    RP --> Prisma --> PG
    SV -. cache (provisioned) .-> Redis
    PG --> Prisma --> RP --> SV --> CT -- "JSON response" --> Browser
```

### Deployment topology (production / cloud)

```mermaid
flowchart TB
    User["👤 Browser"]

    subgraph Vercel["▲ Vercel (Static SPA)"]
        FE["TalentFlow Frontend<br/>React + Vite build<br/>VITE_API_BASE_URL → Render"]
    end

    subgraph Render["🟢 Render (Web Service)"]
        BE["TalentFlow Backend<br/>Express 5 · Prisma 7<br/>GET /health"]
    end

    subgraph Neon["🟩 Neon (Serverless Postgres)"]
        DB[("PostgreSQL<br/>DATABASE_URL · sslmode=require")]
    end

    subgraph Upstash["🟦 Upstash (Serverless Redis)"]
        RD[("Redis<br/>REDIS_URL · rediss:// (optional)")]
    end

    User -- "HTTPS" --> FE
    FE -- "HTTPS / JSON  (/api/v1)" --> BE
    BE -- "TLS Postgres" --> DB
    BE -. "TLS Redis (optional)" .-> RD
```

> **Local development uses Docker Compose** (Postgres + Redis + backend + frontend); the cloud
> topology above replaces those local containers with managed services. See
> [Docker Setup](#-docker-setup) and [Production Deployment](#-production-deployment).

---

## 🗄️ Database Design

The schema is a normalized, production-oriented relational model. Authentication identity
(`User`) is separated from role-specific data (`CandidateProfile` / `HrProfile`); shared
vocabularies (`Company`, `Skill`) are stored once and referenced. Primary keys are
time-ordered **UUIDv7**, and every model carries `createdAt` / `updatedAt`.

> **`Company` is the Organization.** `HrProfile.companyId` links a recruiter to their
> organization, and `Job.companyId` marks the organization that owns each posting.

```mermaid
erDiagram
    User ||--o| CandidateProfile : "1:1"
    User ||--o| HrProfile : "1:1"
    User ||--o{ Job : "posts (postedById)"
    User ||--o{ ApplicationStatusEvent : "changes"

    HrProfile }o--|| Company : "recruits for (companyId)"
    Company ||--o{ Job : "owns (companyId)"

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
        string firstName
        string lastName
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

**Key constraints & indexes:** unique `(jobId, candidateProfileId)` prevents duplicate
applications; unique `(jobId, skillId)` and `(candidateProfileId, skillId)` on the join tables;
composite indexes power the primary browse query (`status, deletedAt, createdAt`) and the HR
applicant board (`jobId, status`).

---

## 🧰 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| **Frontend framework** | React 19 · Vite 8 · TypeScript 5 |
| **Styling / UI** | Tailwind CSS 4 · Radix UI primitives · `class-variance-authority` · Lucide icons · Framer Motion · `sonner` · `cmdk` |
| **State & data** | Redux Toolkit · RTK Query (single API slice, tag-based cache invalidation) · Axios |
| **Routing** | React Router 7 (lazy, code-split routes) |
| **Forms & validation** | React Hook Form · Zod · `@hookform/resolvers` |
| **Frontend testing** | Vitest · Testing Library · jsdom |
| **Backend runtime** | Node.js 20+ · Express 5 · TypeScript 5 |
| **ORM & database** | Prisma 7 (`prisma-client` generator) · PostgreSQL 17 · `@prisma/adapter-pg` · `pg` |
| **Auth & security** | JSON Web Tokens · bcrypt · Helmet · CORS · `express-rate-limit` · cookie-parser |
| **Validation** | Zod (request `body` / `params` / `query` schemas via a `validate` middleware) |
| **Caching / infra** | Redis 7 (client provisioned) · compression · morgan logging |
| **Backend testing** | Jest · Supertest · ts-jest |
| **Tooling** | ESLint · Prettier · Husky · lint-staged · tsx · nodemon · `@faker-js/faker` |
| **Local containers** | Docker · Docker Compose · nginx (SPA serving) |
| **Cloud hosting** | Vercel (frontend) · Render (backend) · Neon (Postgres) · Upstash (Redis) |

---

## 📁 Project Structure

```
talentflow/
├── frontend/                     # React + Vite SPA  → deploy: Vercel
├── backend/                      # Express + Prisma API  → deploy: Render
├── docker-compose.yml            # LOCAL dev orchestration (4 services + migrate init)
├── run-local.sh                  # `npm run dev` orchestration
├── docs/                         # API.md · ARCHITECTURE.md
├── .env.example                  # Optional root Compose overrides
└── package.json                  # Root: Husky + lint-staged + workspace scripts
```

<details>
<summary><strong>Frontend tree</strong> (<code>frontend/src</code>)</summary>

```
frontend/src/
├── app/                  # App root & provider wiring
├── components/           # Shared UI (ui/, navigation/, sidebar/, feedback/…)
├── config/               # env.ts (typed build-time env)
├── constants/            # routes, roles, etc.
├── features/             # Feature slices: auth, jobs, applications,
│                         #   dashboard, hr, profile, settings, landing
├── hooks/                # Reusable hooks (e.g. useModuleSearch)
├── layouts/              # AuthLayout, CandidateLayout, HRLayout, AppShell
├── routes/               # route-config.tsx + Guest/Protected/Role routes
├── services/             # api/ (RTK Query base), auth/, storage/
└── store/ · reducers/    # Redux Toolkit store & slices
```
</details>

<details>
<summary><strong>Backend tree</strong> (<code>backend/src</code>)</summary>

```
backend/src/
├── app.ts · server.ts    # App factory & HTTP bootstrap (+ /health)
├── config/               # env.ts (validated env), logger
├── constants/            # Route path & auth constants
├── auth/                 # authenticate & authorize middleware, token/password services
├── middlewares/          # validate (Zod), rate-limiter, error-handler, not-found
├── modules/              # Feature modules (routes/controller/service/repository/schemas):
│                         #   auth, jobs, applications, candidate-profile, dashboard
├── routes/               # v1 router aggregation
├── common/ · errors/     # Shared schemas, pagination & typed errors
├── database/ · utils/    # Prisma client & helpers
└── generated/prisma/     # Generated Prisma client (committed output dir)
backend/prisma/
├── schema.prisma         # Data model
└── seed.ts               # Deterministic Faker seed (+ documented demo accounts)
```
</details>

---

## 🔐 Environment Variables

Secrets are **never** committed. Each package ships a `.env.example` — copy it to `.env` and
fill in real values. The backend validates its env at startup via `src/config/env.ts` (Zod) and
**fails fast** on missing/invalid values.

### Backend (`backend/.env`)

| Variable | Description | Dev example | Production example |
| -------- | ----------- | ----------- | ------------------ |
| `NODE_ENV` | Runtime mode: `development` / `test` / `production` | `development` | `production` |
| `PORT` | Port Express listens on (Render injects this automatically) | `4000` | `4000` (or platform-provided) |
| `CORS_ORIGIN` | Comma-separated allowed browser origins. **This is the value the backend actually reads.** | `http://localhost:5173` | `https://talentflow.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection string (Prisma) | `postgresql://talentflow:talentflow@localhost:5432/talentflow?schema=public` | `postgresql://USER:PASS@ep-xxxx-pooler.REGION.aws.neon.tech/talentflow?sslmode=require` |
| `REDIS_URL` | Redis connection string (optional — app boots without it) | `redis://localhost:6379` | `rediss://default:PASS@xxxx.upstash.io:6379` |
| `JWT_SECRET` | Secret used to sign/verify JWTs — **min 16 chars** (`openssl rand -hex 32`) | `replace-with-a-long-random-secret` | *(strong random secret)* |
| `JWT_EXPIRES_IN` | Access-token lifetime (`jsonwebtoken` format) | `1d` | `1d` |
| `RATE_LIMIT_WINDOW_MS` | Global rate-limit window (ms) | `900000` | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window per client (global) | `100` | `100` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Auth-endpoint rate-limit window (ms) | `900000` | `900000` |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts (login/register) per window | `10` | `10` |

> ℹ️ **`FRONTEND_URL` note.** Some deployment runbooks reference a `FRONTEND_URL` variable. The
> backend does **not** currently read a separate `FRONTEND_URL`; it uses **`CORS_ORIGIN`** for
> the allow-list. On Render, set `CORS_ORIGIN` to your Vercel URL (and mirror `FRONTEND_URL` to
> the same value if your tooling expects it).

### Frontend (`frontend/.env`)

Only variables prefixed with `VITE_` are exposed to the client bundle, and they are baked in at
**build time** (so a production rebuild is required to change them).

| Variable | Description | Dev example | Production example |
| -------- | ----------- | ----------- | ------------------ |
| `VITE_API_BASE_URL` | Base URL of the versioned backend API | `http://localhost:4000/api/v1` | `https://talentflow-api.onrender.com/api/v1` |
| `VITE_APP_NAME` | Application display name | `TalentFlow` | `TalentFlow` |

---

## 💻 Local Setup

Run the frontend and backend directly on your machine (best for active development).
Requires **Node.js ≥ 20** (`.nvmrc` → `20`) and a running **PostgreSQL** (Redis optional). The
quickest way to get the datastores is Docker:

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

## 🐳 Docker Setup

> **Local development only.** Docker/Compose is **not** used for production — the cloud
> deployment uses Vercel / Render / Neon / Upstash (see [below](#-production-deployment)).

The **entire local stack** starts with a single command — no extra configuration required:

```bash
docker compose up --build
```

This starts four things (see `docker-compose.yml`):

1. **postgres** (`postgres:17-alpine`) and **redis** (`redis:7-alpine`) with health checks and
   named volumes (`postgres_data`, `redis_data`).
2. **migrate** — a **one-shot init service** that runs
   `npx prisma migrate deploy && npm run prisma:seed` against the container database, then
   exits. The backend waits for it to complete successfully before booting, so the DB is
   migrated **and seeded** automatically on first `up`.
3. **backend** (multi-stage Node image) once the datastores are healthy and `migrate` has
   finished. Exposes `/health`.
4. **frontend** (multi-stage build → **nginx** serving the SPA) once the backend is up.

| Service | URL / Port |
| ------- | ---------- |
| Frontend (nginx SPA) | http://localhost:8080 |
| Backend API | http://localhost:4000 |
| API base | http://localhost:4000/api/v1 |
| Health check | http://localhost:4000/health |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## 🚀 Production Deployment

Production is a **managed, cloud-native** setup. Deploy the two packages independently and point
them at managed data stores.

### 1. Database Setup (Neon)

1. Create a Neon project and a database (e.g. `talentflow`).
2. Copy the **pooled** connection string; it becomes `DATABASE_URL` on the backend:

   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/talentflow?sslmode=require
   ```

3. Apply the schema with **`prisma migrate deploy`** (see [Prisma Migrations](#prisma-migrations)).

### 2. Redis Setup (Upstash) — optional

1. Create an Upstash Redis database.
2. Use the TLS (`rediss://`) URL as `REDIS_URL`:

   ```
   rediss://default:PASSWORD@xxxx.upstash.io:6379
   ```

Redis is **optional**: the backend boots without it (the client is provisioned for future
caching but not required to serve requests).

### 3. Backend Deployment (Render)

Create a **Web Service** from the `backend/` directory.

| Setting | Value |
| ------- | ----- |
| **Build command** | `npm ci && npx prisma generate && npm run build` |
| **Start command** | `npm run start` |
| **Release / pre-deploy command** | `npx prisma migrate deploy` |
| **Health check path** | `/health` |

Set these environment variables on the service:

| Variable | Value |
| -------- | ----- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(Neon pooled connection string)* |
| `REDIS_URL` | *(Upstash `rediss://` URL — optional)* |
| `JWT_SECRET` | *(strong random secret, ≥ 16 chars)* |
| `JWT_EXPIRES_IN` | `1d` |
| `CORS_ORIGIN` | *(your Vercel frontend URL, e.g. `https://talentflow.vercel.app`)* |
| `FRONTEND_URL` | *(same as `CORS_ORIGIN`; see the env-var note — the backend reads `CORS_ORIGIN`)* |
| `AUTH_RATE_LIMIT_WINDOW_MS` / `AUTH_RATE_LIMIT_MAX` | *(optional overrides)* |

> `PORT` is provided by Render automatically — no need to set it.

### 4. Frontend Deployment (Vercel)

Import the repository into Vercel with the **root directory set to `frontend/`**.

| Setting | Value |
| ------- | ----- |
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Output directory** | `dist` |
| **Install command** | `npm ci` |

Set the build-time environment variable:

| Variable | Value |
| -------- | ----- |
| `VITE_API_BASE_URL` | *(your Render backend URL + `/api/v1`, e.g. `https://talentflow-api.onrender.com/api/v1`)* |
| `VITE_APP_NAME` | `TalentFlow` |

> Because `VITE_*` variables are inlined at build time, changing the API URL requires a
> **redeploy** of the frontend.

### Prisma Migrations

| Environment | Command | Notes |
| ----------- | ------- | ----- |
| **Local / development** | `npm --prefix backend run prisma:migrate` (`prisma migrate dev`) | Creates and applies new migrations. |
| **Production (Neon/Render)** | `npx prisma migrate deploy` (`npm --prefix backend run prisma:deploy`) | Applies existing migrations only. **Never run `migrate dev` against production.** |

### Seeding Database

The deterministic seed can be run against any database by pointing `DATABASE_URL` at it:

```bash
npm --prefix backend run prisma:seed
```

Use this to load the [demo accounts and dataset](#-test-credentials). In production, seed only
if you intend to populate demo/reference data.

---

## 🧪 Testing

| Package | Command | Stack |
| ------- | ------- | ----- |
| **Frontend** | `npm --prefix frontend test` | Vitest · Testing Library · jsdom |
| **Frontend (watch)** | `npm --prefix frontend run test:watch` | |
| **Frontend (coverage)** | `npm --prefix frontend run test:coverage` | `@vitest/coverage-v8` |
| **Backend** | `npm --prefix backend test` | Jest · Supertest (`--runInBand`, `NODE_ENV=test`) |
| **Backend (watch)** | `npm --prefix backend run test:watch` | |

---

## 🐳 Docker Commands

```bash
docker compose up --build          # build images and start the full local stack
docker compose up --build -d       # ...in the background (detached)
docker compose up -d postgres redis   # only the datastores (for local dev)
docker compose logs -f backend     # tail a service's logs
docker compose down                # stop and remove containers
docker compose down -v             # ...and delete volumes (wipes the database)
```

---

## 📜 Available Scripts

### Root (`package.json`)

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Orchestrated dev start (`run-local.sh`) |
| `npm run dev:frontend` / `dev:backend` | Start a single package in dev |
| `npm run install:all` | Install root + frontend + backend deps and Git hooks |
| `npm run lint` | Lint both packages |
| `npm run format` | Prettier-format the whole repo |

### Backend (`backend/package.json`)

| Script | Description |
| ------ | ----------- |
| `dev` | Start the API with nodemon |
| `build` | Compile TypeScript (`tsc` + `tsc-alias`) → `dist/` |
| `start` | Run the compiled server (`node dist/server.js`) |
| `test` / `test:watch` | Jest (+ Supertest), `NODE_ENV=test`, `--runInBand` |
| `lint` / `lint:fix` | ESLint |
| `format` | Prettier over `src/**/*.ts` |
| `typecheck` | `tsc --noEmit` |
| `prisma:generate` | Generate the Prisma client |
| `prisma:migrate` | `prisma migrate dev` (local) |
| `prisma:deploy` | `prisma migrate deploy` (production) |
| `prisma:reset` | `prisma migrate reset` |
| `prisma:studio` | Launch Prisma Studio |
| `prisma:validate` / `prisma:format` | Validate / format the schema |
| `prisma:seed` | Run the deterministic seed (`tsx prisma/seed.ts`) |

### Frontend (`frontend/package.json`)

| Script | Description |
| ------ | ----------- |
| `dev` | Vite dev server |
| `build` | Type-check + production build (`tsc -b && vite build`) → `dist/` |
| `preview` | Preview the production build |
| `test` / `test:watch` / `test:coverage` | Vitest |
| `lint` / `lint:fix` | ESLint |
| `format` | Prettier over `src/**/*.{ts,tsx,css}` |
| `typecheck` | `tsc -b --noEmit` |

---

## 🩺 Health Endpoint

The backend exposes an **unversioned** health endpoint, used by Docker/Render/load balancers:

`GET /health` verifies process liveness **and** dependency connectivity — a `SELECT 1`
against Postgres and a `PING` against Redis (when `REDIS_URL` is configured; otherwise reported
as `disabled`). It returns **200** when the database is reachable and **503** when it is not, so
Render/uptime probes can react to a real outage.

```
GET /health  →  200 OK   (503 when the database is unreachable)
```

```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2026-01-01T00:00:00.000Z",
  "checks": { "database": "up", "redis": "disabled" }
}
```

`GET /version` returns build/runtime metadata for deployment traceability:

```json
{
  "version": "0.1.0",
  "environment": "production",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "commit": "a1b2c3d"
}
```

The `commit` is resolved from `COMMIT_SHA` / `GIT_COMMIT` / `RENDER_GIT_COMMIT` (or `"unknown"`).

---

## 📡 API Overview

All endpoints are versioned under **`/api/v1`**. Authenticated routes require a JWT bearer token
(`Authorization: Bearer <token>`); the **Auth** column shows the required role.

Base URL (local): `http://localhost:4000/api/v1` · Health: `GET /health` (unversioned)

### Auth — `/auth`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/auth/register` | Public | Register a **Candidate**, or an **HR** account (`role: 'HR'` + `organizationName`) |
| `POST` | `/auth/login` | Public | Authenticate and receive an access token |
| `GET` | `/auth/me` | Authenticated | Fetch the current authenticated user (includes `organizationName`) |

### Candidate Profile — `/profile`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `GET` | `/profile` | Candidate | Get the signed-in candidate's profile |
| `PATCH` | `/profile` | Candidate | Update the signed-in candidate's profile |

### Jobs — `/jobs`

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/jobs` | HR | Create a job posting (stamped with the HR user's organization) |
| `GET` | `/jobs` | Authenticated | Browse live jobs (filter + paginate) |
| `GET` | `/jobs/:id` | Authenticated | Job details (non-live jobs visible to the owner only) |
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
| `GET` | `/applications/hr-applicants` | HR | Applicants across all of the HR user's jobs |
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

The seed (`backend/prisma/seed.ts`) provisions these well-known demo accounts (passwords are
bcrypt-hashed). Use them to explore both portals and the two demo organizations.

| Role | Email | Password | Organization |
| ---- | ----- | -------- | ------------ |
| **Candidate** | `candidate1@example.com` | `Candidate@123` | — |
| **Candidate** | `candidate2@example.com` | `Candidate@123` | — |
| **HR** | `hr1@skypoint.com` | `Hr@123456` | SkyPoint Technologies |
| **HR** | `hr2@vertexlabs.com` | `Hr@123456` | Vertex Labs |

The seed also generates a large, realistic, **fully deterministic** dataset around these
accounts (~50 companies, ~300 skills, ~100 HR users, ~500 candidates, ~500 jobs, and ~3,000
applications, each with a status-event audit trail) so every screen has meaningful content and
filters/pagination/search are exercised at scale.

---

## ⚠️ Known Limitations

- **Redis is used only for the health probe today** — the client dependency and `REDIS_URL` are
  in place and `/health` pings it, but request-path caching/session use is a future hook; the app
  boots and runs fully without Redis.
- **Resume upload is a URL only** — `resumeUrl` fields exist on `CandidateProfile` and
  `Application`, but no file-upload/storage pipeline is implemented.
- **Notifications / email** are not implemented.
- **No CI/CD pipeline** is included in the repository.

---

## 🚀 Future Improvements

- [ ] Redis-backed caching for browse/list endpoints and distributed rate limiting.
- [ ] File-based resume upload & storage (S3-compatible).
- [ ] Email / in-app notifications for application status changes.
- [ ] Company Pages and richer employer branding (schema already supports it).
- [ ] Candidate ↔ job match scoring (join tables already carry `isRequired` / `proficiency`).
- [ ] OpenAPI/Swagger spec generated from the Zod schemas.
- [ ] CI/CD pipeline with automated tests, image builds, and deployments.

---

## 🖼️ Screenshots

> Replace the placeholder paths below with real captures (e.g. under `docs/screenshots/`).

| | |
| --- | --- |
| ![Landing page](docs/screenshots/landing.png)<br/>**Landing page** | ![Candidate dashboard](docs/screenshots/candidate-dashboard.png)<br/>**Candidate dashboard (Career Hub)** |
| ![Browse jobs](docs/screenshots/browse-jobs.png)<br/>**Browse jobs** | ![Job details](docs/screenshots/job-details.png)<br/>**Job details** |
| ![HR dashboard](docs/screenshots/hr-dashboard.png)<br/>**HR dashboard (Hiring Hub)** | ![Applicants](docs/screenshots/applicants.png)<br/>**Applicants board** |
| ![Create job](docs/screenshots/create-job.png)<br/>**Create / edit job** | ![Settings](docs/screenshots/settings.png)<br/>**Settings** |

---

## 📄 License

Released under the [MIT License](LICENSE).

<div align="center">
<sub>Built with ❤️ — TalentFlow</sub>
</div>
