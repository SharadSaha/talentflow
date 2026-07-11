# API Reference

> **Placeholder** — the full REST API reference will be documented here (and/or
> published as an OpenAPI/Swagger spec) as endpoints are implemented.

Base URL: `http://localhost:4000/api`

## Conventions (planned)

- JSON request/response bodies.
- Bearer-token (JWT) authentication for protected routes.
- Standard error shape: `{ "error": "<message>" }`.

## Available endpoints

| Method | Endpoint  | Auth | Description          |
| ------ | --------- | ---- | -------------------- |
| `GET`  | `/health` | —    | Service health check |
| `GET`  | `/api`    | —    | API root placeholder |

## Planned endpoints

- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/login`
- [ ] `POST /api/auth/logout`
- [ ] `GET  /api/jobs`
- [ ] `POST /api/jobs` _(HR)_
- [ ] `POST /api/applications` _(Candidate)_
- [ ] ...
