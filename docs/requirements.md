# Job Management Dashboard Requirements

## Source of Truth

- Assignment specification from `job_dashboard_infor.md`.
- This document decomposes scope into implementation capabilities and reviewer-facing outcomes.

## Core Functional Requirements

### Backend (Django + PostgreSQL)

- Single Django project with one application domain for jobs.
- `Job` model fields:
  - `id` (PK)
  - `name` (string)
  - `created_at` (auto set on create)
  - `updated_at` (auto set on update)
- `JobStatus` model fields:
  - `id` (PK)
  - `job` (FK to `Job`)
  - `status_type` (choice with at least 4 states)
  - `timestamp` (status event time)
- Required REST endpoints:
  - `GET /api/jobs/` list jobs including **current/latest** status
  - `POST /api/jobs/` create job and automatically create initial status (`PENDING`)
  - `PATCH /api/jobs/<id>/` append a new status event for that job
  - `DELETE /api/jobs/<id>/` delete job and all associated statuses
- PostgreSQL connection and migration-based schema lifecycle.

### Frontend (React + TypeScript)

- Job list view with job name + current status.
- Create-job form with non-empty client validation.
- Per-job status update control that calls backend and reflects updates immediately.
- Per-job delete action with immediate UI refresh.
- Basic API failure messaging for fetch and mutations.
- Presentable, clean, professional UI.

### Testing

- At least one Playwright E2E covering critical flow:
  - create + verify initial status, and/or
  - status update + verify result.

### Deployment and Setup

- Dockerfiles for backend and frontend.
- `docker-compose.yml` orchestrating backend + Postgres + frontend.
- `Makefile` with:
  - `make build`
  - `make up`
  - `make test`
  - `make stop`
  - `make clean`

### Performance Considerations

- Assume potential scale of millions of jobs.
- Must include performance strategy in `README.md`.

## Stretch Goals (Integrated, Not Deferred)

- Job status history view.
- Filtering and sorting.
- Dedicated job details route.
- Frontend unit tests.
- Backend unit tests.

## Non-Functional & Evaluation Constraints

- Evaluators run in Linux/Mac with only:
  - `make`, `docker`, `docker compose v2`, `bash`.
- They run `make test` first from repo root.
- If `make test` fails, evaluation stops.
- Strong emphasis on correctness, readability, modularity, error handling, TypeScript safety, test reliability, deployment simplicity, and professionalism.

## Capability Decomposition

1. Domain model and status-event lifecycle.
2. API contract and mutation semantics.
3. Frontend state + routing + UX interaction patterns.
4. Containerized reproducible runtime.
5. Deterministic E2E + unit testing strategy.
6. Performance and scaling-readiness primitives.
7. Reviewer-oriented documentation and rubric mapping.

## Master Implementation Plan (Phase → Sub-Phase → Step → Commit Unit)

### Phase 1 — Backend Foundation

Scaffold Django project, implement domain models, service layer, and full API layer in one phase so the backend is fully testable via curl/Postman before frontend work begins.

- Sub-phase 1.1 Project bootstrap
  - Step: scaffold Django project/app and settings split.
  - Commit unit: `chore(backend): bootstrap django project and jobs app`
- Sub-phase 1.2 Domain model
  - Step: implement `Job` + `JobStatus`, migrations, enums.
  - Commit unit: `feat(backend): add job and job_status models`
- Sub-phase 1.3 Data access performance
  - Step: add indexes and lifecycle constraints.
  - Commit unit: `perf(db): add indexes for current-status lookups`
- Sub-phase 1.4 Service layer
  - Step: add transaction-safe status transition services.
  - Commit unit: `feat(backend): add job status transition service`
- Sub-phase 1.5 DRF contract
  - Step: serializers, viewsets, routes.
  - Commit unit: `feat(api): add drf jobs endpoints`
- Sub-phase 1.6 CRUD/status semantics
  - Step: POST/PATCH/DELETE behavior per spec.
  - Commit unit: `feat(api): implement status-event mutation semantics`
- Sub-phase 1.7 Pagination/filter/sorting
  - Step: pagination + query params for filtering/sorting.
  - Commit unit: `feat(api): add paginated list with filters and sorting`
- Sub-phase 1.8 Error contract
  - Step: standardized validation/error responses.
  - Commit unit: `chore(api): normalize error response envelope`

### Phase 2 — Frontend Core

Build the React UI against the stable API contract from Phase 1.

- Sub-phase 2.1 App shell
  - Step: routing, providers, and typed API client.
  - Commit unit: `chore(frontend): scaffold app shell and api client`
- Sub-phase 2.2 Jobs list workflow
  - Step: list/create/update/delete flows with optimistic refresh.
  - Commit unit: `feat(frontend): implement jobs list CRUD interactions`
- Sub-phase 2.3 Stretch integrated UI
  - Step: details route + history + filter/sort controls.
  - Commit unit: `feat(frontend): add job details history and list controls`
- Sub-phase 2.4 UX resilience
  - Step: loading, empty, and error states.
  - Commit unit: `feat(frontend): add robust async state handling`

### Phase 3 — Infrastructure

Harden Docker setup for production-like runtime and reliable `make test`.

- Sub-phase 3.1 Containerization
  - Step: production backend/frontend Dockerfiles (gunicorn, nginx).
  - Commit unit: `build(docker): add production service dockerfiles`
- Sub-phase 3.2 Compose orchestration
  - Step: health checks, depends_on conditions, Playwright service.
  - Commit unit: `build(compose): add health checks and test runner service`
- Sub-phase 3.3 Make ergonomics
  - Step: wire build/up/test/stop/clean to full E2E lifecycle.
  - Commit unit: `build(make): wire makefile to e2e test lifecycle`

### Phase 4 — Testing

Implement all test layers with `make test` as the canonical gate.

- Sub-phase 4.1 E2E baseline
  - Step: Playwright critical flow tests.
  - Commit unit: `test(e2e): add playwright critical path coverage`
- Sub-phase 4.2 Backend unit coverage
  - Step: model/service/API tests.
  - Commit unit: `test(backend): add unit and api tests`
- Sub-phase 4.3 Frontend unit coverage
  - Step: component and interaction tests.
  - Commit unit: `test(frontend): add rtl tests for core components`

### Phase 5 — Polish and Reviewer Readiness

Final hardening, documentation, and professionalism touches.

- Sub-phase 5.1 Observability and ops readiness
  - Step: structured logging and env docs.
  - Commit unit: `chore(obs): add structured logging and env guidance`
- Sub-phase 5.2 Final docs and rubric map
  - Step: README + docs completion + AI prompt writeup.
  - Commit unit: `docs: finalize reviewer-focused documentation`

## Recommended Branch Strategy

- `feature/phase-1-backend-foundation`
- `feature/phase-2-frontend-core`
- `feature/phase-3-infrastructure`
- `feature/phase-4-testing`
- `feature/phase-5-polish`

## Definition of Done (Global)

- `make test` passes from clean environment using only Docker/Compose/Make/Bash.
- Core requirements fully implemented and verifiable.
- Stretch goals integrated in architecture and test strategy.
- Docs clearly explain architecture, trade-offs, and scaling considerations.
