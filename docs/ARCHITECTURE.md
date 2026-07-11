# Architecture

> **Placeholder** — this document will describe TalentFlow's architecture in
> detail as the application is implemented.

## Overview

TalentFlow is a monorepo with a decoupled frontend and backend:

- **Frontend** — a React (Vite) single-page application, served in production by
  nginx. Talks to the backend over HTTP/JSON.
- **Backend** — an Express (TypeScript) REST API using Prisma to access
  PostgreSQL, with Redis available for caching/sessions.

```
Browser ──▶ Frontend (nginx / Vite dev) ──▶ Backend (Express) ──▶ PostgreSQL
                                                   │
                                                   └──────────────▶ Redis
```

## To be documented

- [ ] High-level component diagram
- [ ] Request lifecycle & middleware pipeline
- [ ] Authentication & authorization flow (JWT, roles)
- [ ] Data model / ER diagram
- [ ] Caching strategy (Redis)
- [ ] Error-handling & logging conventions
- [ ] Deployment topology
