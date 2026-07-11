<div align="center">

# 🧭 TalentFlow

**A modern job portal connecting HR teams and candidates.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

</div>

> **Status:** 🏗️ Scaffolding complete — tooling, configuration, and infrastructure
> are ready. Application features are **not implemented yet**.

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Local Development Setup](#-local-development-setup)
- [Docker Setup](#-docker-setup)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Architecture](#-architecture)
- [Future Features](#-future-features)
- [Screenshots](#-screenshots)
- [Seed Credentials](#-seed-credentials)
- [API Documentation](#-api-documentation)

---

## 🎯 Project Overview

**TalentFlow** is a full-stack job portal built around two user roles:

- **HR** — post and manage job listings, review applications, and manage candidates.
- **Candidate** — browse jobs, build a profile, and apply to openings.

This repository is a monorepo containing a **React SPA frontend** and an
**Express + Prisma backend**, fully containerised with Docker.

> ℹ️ The application logic (authentication, APIs, database models, routing, and UI)
> will be implemented in subsequent phases. This repository currently provides a
> clean, production-ready development environment.

---

## 🧰 Tech Stack

### Frontend

| Concern         | Technology                                             |
| --------------- | ------------------------------------------------------ |
| Framework       | React + Vite + TypeScript                              |
| Styling         | Tailwind CSS                                           |
| State / Data    | Redux Toolkit + RTK Query                              |
| Routing         | React Router                                           |
| HTTP client     | Axios                                                  |
| Forms           | React Hook Form + Zod + `@hookform/resolvers`          |
| Testing         | Vitest + Testing Library                               |
| Quality         | ESLint + Prettier + Husky + lint-staged                |

### Backend

| Concern         | Technology                                             |
| --------------- | ------------------------------------------------------ |
| Runtime         | Node.js + Express + TypeScript                         |
| ORM / Database  | Prisma + PostgreSQL                                    |
| Auth (later)    | JWT + bcrypt                                           |
| Validation      | Zod                                                    |
| Security / Infra| Helmet, CORS, Morgan, Compression, Cookie Parser, Rate Limit |
| Caching         | Redis client                                           |
| Config          | dotenv                                                 |
| Testing         | Jest + Supertest                                       |
| Dev tooling     | tsx + nodemon                                          |
| Quality         | ESLint + Prettier + Husky + lint-staged                |

### Infrastructure

- **PostgreSQL** (primary datastore) · **Redis** (cache/session store)
- **Docker** + **Docker Compose** for local and production parity

---

## 🗂️ Repository Structure

```
talentflow/
├── frontend/            # React + Vite SPA
│   ├── src/             # App entry, components (added later)
│   ├── Dockerfile       # Multi-stage build → nginx
│   ├── nginx.conf       # SPA routing + asset caching
│   └── .env.example
├── backend/             # Express + TypeScript API
│   ├── src/             # app.ts, server.ts, config/
│   ├── prisma/          # schema.prisma, seed.ts
│   ├── Dockerfile       # Multi-stage build → Node runtime
│   └── .env.example
├── docker/              # Container docs & shared assets
├── docs/                # Additional documentation
├── docker-compose.yml   # Orchestrates all four services
├── .husky/              # Git hooks (pre-commit → lint-staged)
├── .env.example         # Optional Compose overrides
└── package.json         # Root: Husky + lint-staged orchestration
```

> Detailed application folder structure (feature modules, routes, components)
> will be introduced as features are built.

---

## 💻 Local Development Setup

Run the frontend and backend directly on your machine (recommended for active
development). You'll need **Node.js ≥ 20** and a running **PostgreSQL** instance
(and optionally **Redis**). The easiest way to get Postgres/Redis is:

```bash
docker compose up -d postgres redis
```

### 1. Clone & install

```bash
git clone <repo-url> talentflow
cd talentflow

# Install root tooling (Husky, lint-staged, Prettier) + Git hooks
npm install

# Install workspace dependencies
npm --prefix backend install
npm --prefix frontend install
```

> 💡 Shortcut: `npm run install:all` installs root, backend, and frontend in one go.

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Set up the database

```bash
cd backend
npm run prisma:generate     # generate the Prisma client
npm run prisma:migrate      # create & apply migrations (once models exist)
npm run prisma:seed         # optional: seed data
```

### 4. Start the dev servers

```bash
# Terminal 1 — backend (http://localhost:4000)
npm --prefix backend run dev

# Terminal 2 — frontend (http://localhost:5173)
npm --prefix frontend run dev
```

| Service   | URL                            |
| --------- | ------------------------------ |
| Frontend  | http://localhost:5173          |
| Backend   | http://localhost:4000          |
| Health    | http://localhost:4000/health   |

---

## 🐳 Docker Setup

The **entire stack** (frontend, backend, PostgreSQL, Redis) starts with a single
command — **no additional configuration required**:

```bash
docker compose up --build
```

| Service   | URL / Port                     |
| --------- | ------------------------------ |
| Frontend  | http://localhost:8080          |
| Backend   | http://localhost:4000          |
| Postgres  | localhost:5432                 |
| Redis     | localhost:6379                 |

Common commands:

```bash
docker compose up --build          # build images and start everything
docker compose up --build -d       # ...in the background
docker compose logs -f backend     # tail a service's logs
docker compose down                # stop and remove containers
docker compose down -v             # ...and delete volumes (wipes the DB)
```

- PostgreSQL data persists in the named volume **`postgres_data`**.
- Services communicate over the **`talentflow`** bridge network using their
  service names (`postgres`, `redis`, `backend`).
- See [`docker/README.md`](docker/README.md) for networking details.

---

## 🔐 Environment Variables

Secrets are **never** committed. Each package ships a `.env.example` template —
copy it to `.env` and fill in real values.

### Backend (`backend/.env`)

| Variable               | Description                                  | Default (example)                     |
| ---------------------- | -------------------------------------------- | ------------------------------------- |
| `NODE_ENV`             | Runtime environment                          | `development`                         |
| `PORT`                 | API port                                     | `4000`                                |
| `CORS_ORIGIN`          | Allowed origin(s), comma-separated           | `http://localhost:5173`               |
| `DATABASE_URL`         | PostgreSQL connection string                 | `postgresql://…@localhost:5432/…`     |
| `REDIS_URL`            | Redis connection string                      | `redis://localhost:6379`              |
| `JWT_SECRET`           | JWT signing secret (implemented later)       | _generate a strong secret_            |
| `JWT_EXPIRES_IN`       | Token lifetime                               | `1d`                                  |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window (ms)                        | `900000`                              |
| `RATE_LIMIT_MAX`       | Max requests per window                      | `100`                                 |

### Frontend (`frontend/.env`)

| Variable            | Description                        | Default (example)             |
| ------------------- | ---------------------------------- | ----------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL               | `http://localhost:4000/api`   |
| `VITE_APP_NAME`     | Application display name           | `TalentFlow`                  |

### Compose overrides (root `.env`, optional)

Docker Compose has sensible defaults, so a root `.env` is **not** required.
Override defaults by copying [`.env.example`](.env.example) to `.env`.

---

## 📜 Available Scripts

### Root

| Script                  | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `npm run install:all`   | Install root + frontend + backend dependencies  |
| `npm run dev:frontend`  | Start the frontend dev server                   |
| `npm run dev:backend`   | Start the backend dev server                    |
| `npm run lint`          | Lint both packages                              |
| `npm run format`        | Prettier-format the whole repo                  |

### Frontend (`npm --prefix frontend run <script>`)

| Script       | Description                              |
| ------------ | ---------------------------------------- |
| `dev`        | Start Vite dev server (HMR)              |
| `build`      | Type-check and build for production      |
| `preview`    | Preview the production build             |
| `test`       | Run Vitest test suite                    |
| `lint`       | Run ESLint                               |
| `lint:fix`   | Run ESLint with autofix                  |
| `format`     | Format `src` with Prettier               |

### Backend (`npm --prefix backend run <script>`)

| Script             | Description                                    |
| ------------------ | ---------------------------------------------- |
| `dev`              | Start the API with hot reload (nodemon + tsx)  |
| `build`            | Compile TypeScript → `dist/`                   |
| `start`            | Run the compiled server                        |
| `test`             | Run Jest + Supertest suite                     |
| `lint`             | Run ESLint                                     |
| `lint:fix`         | Run ESLint with autofix                        |
| `format`           | Format `src` with Prettier                     |
| `prisma:generate`  | Generate the Prisma client                     |
| `prisma:migrate`   | Create & apply a dev migration                 |
| `prisma:studio`    | Open Prisma Studio                             |
| `prisma:seed`      | Run the seed script                            |

---

## 🏛️ Architecture

> _Placeholder — a detailed architecture diagram and description will be added
> as the application is built._

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Frontend   │  HTTP  │   Backend    │  SQL   │  PostgreSQL  │
│  React SPA   │ ─────▶ │  Express API │ ─────▶ │              │
│  (nginx)     │        │  (Prisma)    │        └──────────────┘
└──────────────┘        │              │        ┌──────────────┐
                        │              │ ─────▶ │    Redis     │
                        └──────────────┘        └──────────────┘
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the (evolving) details.

---

## 🚀 Future Features

- [ ] Authentication & authorization (JWT, HR / Candidate roles)
- [ ] HR: create, edit, and close job postings
- [ ] Candidate: profile management & résumé upload
- [ ] Job search, filtering, and pagination
- [ ] Application workflow (apply, track status, HR review)
- [ ] Notifications (email / in-app)
- [ ] Redis-backed caching & rate limiting
- [ ] Admin dashboard & analytics
- [ ] CI/CD pipeline & automated deployments

---

## 🖼️ Screenshots

> _Placeholder — UI screenshots will be added once the frontend is implemented._

| Landing | HR Dashboard | Candidate Portal |
| ------- | ------------ | ---------------- |
| _TBD_   | _TBD_        | _TBD_            |

---

## 🔑 Seed Credentials

> _Placeholder — default HR and Candidate accounts will be provided here once the
> authentication system and seed script are implemented._

| Role      | Email | Password |
| --------- | ----- | -------- |
| HR        | _TBD_ | _TBD_    |
| Candidate | _TBD_ | _TBD_    |

---

## 📡 API Documentation

> _Placeholder — REST endpoint reference (and/or OpenAPI/Swagger spec) will be
> published here as endpoints are built._

Base URL: `http://localhost:4000/api`

| Method | Endpoint  | Description               | Status      |
| ------ | --------- | ------------------------- | ----------- |
| `GET`  | `/health` | Service health check      | ✅ Available |
| `GET`  | `/api`    | API root placeholder      | ✅ Available |

See [`docs/API.md`](docs/API.md) for the full (evolving) reference.

---

<div align="center">
<sub>Built with ❤️ — TalentFlow</sub>
</div>
