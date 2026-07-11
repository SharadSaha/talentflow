# Docker

Containerisation assets for TalentFlow.

## Layout

| File / Location             | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `../docker-compose.yml`     | Orchestrates all four services (root of repo).              |
| `../frontend/Dockerfile`    | Multi-stage build → nginx serving the React SPA.            |
| `../frontend/nginx.conf`    | nginx site config (SPA fallback, asset caching, `/healthz`).|
| `../backend/Dockerfile`     | Multi-stage build → compiled Express server on Node 22.     |
| `../.env.example`           | Optional Compose overrides (copy to root `.env`).           |

> This folder is reserved for additional container assets as the project grows
> (e.g. Postgres init scripts, extra service definitions, CI build helpers).

## Services

| Service    | Image / Build     | Host port | Container port | Notes                        |
| ---------- | ----------------- | --------- | -------------- | ---------------------------- |
| `frontend` | `./frontend`      | `8080`    | `80`           | nginx static server          |
| `backend`  | `./backend`       | `4000`    | `4000`         | Express API, `/health`       |
| `postgres` | `postgres:17`     | `5432`    | `5432`         | named volume `postgres_data` |
| `redis`    | `redis:7`         | `6379`    | `6379`         | named volume `redis_data`    |

All services share the `talentflow` bridge network and reference each other by
service name (`postgres`, `redis`, `backend`).

## Usage

```bash
# From the repo root — build and start everything:
docker compose up --build

# Detached:
docker compose up --build -d

# Tear down (keep data):
docker compose down

# Tear down and delete volumes (wipes the database):
docker compose down -v
```

## Networking notes

- The **browser** talks to the backend via the host-published port
  (`http://localhost:4000/api`), which is why `VITE_API_BASE_URL` uses
  `localhost`, not the `backend` service name.
- **Container-to-container** traffic (backend → postgres/redis) uses the
  service names on the shared network, e.g. `postgresql://…@postgres:5432/…`.
