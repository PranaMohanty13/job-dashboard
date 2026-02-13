# Infrastructure and Delivery Design

## Architectural Intent

Guarantee reproducible local and CI execution where `make test` is the primary verification command and requires no host dependencies beyond Docker/Compose/Make/Bash.

## Container Topology

- `db` (PostgreSQL)
- `backend` (Django + gunicorn)
- `frontend` (built static app served by nginx)
- `playwright` (test runner image/service for E2E)

## Docker Design

### Backend Dockerfile

- Multi-stage optional but not required for first iteration.
- Installs Python deps, copies app, runs migrations during startup or entrypoint script.
- Uses gunicorn for production-like runtime.

### Frontend Dockerfile

- Build stage compiles Vite assets.
- Runtime stage serves static build through nginx.
- API base URL configured by env/build arg.

### Playwright Runner

- Uses official Playwright container base image for browser stability.
- Executes tests against running compose services.

## Compose Orchestration Strategy

- Private network shared by services.
- Service health checks:
  - Postgres readiness
  - Backend health endpoint
  - Frontend ready endpoint
- `depends_on` with health conditions to reduce flakiness.
- Named volumes for Postgres persistence (cleaned by `make clean`).

## Makefile Contract

- `make build`: docker compose build
- `make up`: start stack in detached mode
- `make test`:
  - bring stack up predictably
  - ensure migrations applied
  - run Playwright tests
  - return non-zero on failure
- `make stop`: stop running services
- `make clean`: stop + remove volumes/networks for clean slate

## Environment Configuration

- `.env.example` checked in for required variables.
- Distinct env files for backend/frontend if needed.
- No secrets hardcoded in images or compose files.

## Observability Readiness

- Structured logs to stdout for backend.
- Correlation-friendly request fields (method/path/status/duration).
- Compose logs usable for quick debugging during evaluation.

## Scaling Readiness

- Backend container can be horizontally scaled independently in future orchestrators.
- Postgres is externalizable to managed service with same env contract.
- Frontend static serving can move to CDN without changing app logic.

## Risks and Mitigations

- Risk: flaky startup race conditions.
  - Mitigation: health checks + wait-for logic.
- Risk: E2E browser env mismatch.
  - Mitigation: run tests inside Playwright container.
- Risk: migration drift.
  - Mitigation: migration command in startup/test lifecycle.

## Alignment to Evaluation Criteria

- Setup/deployment ease: one-command lifecycle via Makefile.
- Repeatability: all dependencies containerized.
- Attention to detail: health checks, clean targets, deterministic startup.
