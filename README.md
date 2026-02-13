# Job Management Dashboard

A full-stack job management dashboard built as a take-home project for a Full-Stack Engineer position. The application lets users create computational jobs, transition them through status states (Pending → Running → Completed / Failed), view the full status history timeline, and delete jobs — all through a clean, responsive UI backed by a RESTful Django API and PostgreSQL.

**Tech stack:**

- **Backend:** Django 5.x, Django REST Framework, PostgreSQL 16, Gunicorn
- **Frontend:** React 18, TypeScript, Vite, TanStack Query (React Query), Tailwind CSS
- **Infrastructure:** Docker, Docker Compose, Nginx, Makefile
- **Testing:** Playwright (E2E), pytest (backend), Vitest + React Testing Library (frontend)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [AI Usage & My Contributions](#ai-usage--my-contributions)
3. [What's Implemented](#whats-implemented)
4. [Architecture & Design Decisions](#architecture--design-decisions)
5. [API Reference](#api-reference)
6. [Testing Strategy](#testing-strategy)
7. [Performance Considerations](#performance-considerations)
8. [Time Spent](#time-spent)

---

## Getting Started

### Prerequisites

You only need these installed on your machine:

- `make`
- `docker`
- `docker compose` (v2)
- `bash`

That's it for running the app and evaluator path. Core runtime and E2E execution are fully containerized (no local Python/PostgreSQL required).

### Quick start

```bash
# Build all images
make build

# Start the full stack (Postgres + Django + React/Nginx)
make up

# Run E2E tests (builds, starts stack, runs Playwright, tears down)
make test

# Stop all services
make stop

# Clean everything (containers + volumes + networks)
make clean
```

### Access points

| Service  | URL                             |
| -------- | ------------------------------- |
| Frontend | <http://localhost:3000>         |
| Backend  | <http://localhost:8000/api/>    |
| Health   | <http://localhost:8000/health/> |

### Environment configuration

The frontend port is configurable via environment variable:

```bash
FRONTEND_PORT=8080 make up
```

Default is `3000`. A `.env.example` file is included for reference.

### Windows note

The `Makefile` uses bash-style shell logic. On Windows/PowerShell, use Docker Compose directly:

```powershell
docker compose up --build -d
docker compose run --rm playwright
docker compose down -v --remove-orphans
```

---

## AI Usage & My Contributions

I used GitHub Copilot throughout this project with a combined workflow across Claude Opus 4.6, Codex 5.3, and Gemini 3 Pro. Claude Opus 4.6 and Codex 5.3 were primarily used for coding implementation, debugging, and code-review iterations, while Gemini 3 Pro was used mainly for consultation, planning, and architecture tradeoff discussions.

I also created a set of Markdown reference files in `docs/` and a strict `AGENTS.md` operating guide so each chat model had a clearly defined role, constraints, and step-by-step execution format. That structure helped keep implementation aligned with requirements, reduced drift, and made each change reviewable.

### My role vs. AI's role — the honest breakdown

**Everything architectural was my decision.** I decided on the services/selectors/views layered pattern for the backend. I chose to denormalize `current_status_type` onto the `Job` model instead of computing it via subqueries. I picked TanStack Query for server state management. I designed the folder structure, the API contract, the testing pyramid, and the Docker topology. AI didn't make any of these calls — I did, based on my experience with what scales and what reviewers look for.

**Planning and phasing were mine.** Before writing a single line of code, I collaborated with AI to create a full set of planning documents in `docs/` — requirements decomposition, backend design, frontend design, infrastructure plan, testing strategy, evaluation criteria mapping, and scalability considerations. These documents drove the entire build. AI was given these as context and told to implement against them, not to invent its own approach.

**AI was my implementation accelerator.** Once I had the architecture and plan locked in, I used AI to generate the boilerplate — Django models, serializers, React components, Docker configurations. Think of it like having a very fast junior engineer who can type out what I describe, but needs me to review every line and catch the things it gets wrong.

**Debugging and hardening were mostly me.** This is where the real engineering happened, and where AI's limitations showed up. Here are the specific things I caught and fixed:

### What AI got wrong and how I fixed it

1. **E2E test delete assertion was flaky.** AI's initial Playwright test didn't handle the browser confirmation dialog that fires on delete. The test would hang or fail intermittently. I identified that `window.confirm()` was being called and told AI to add `page.once("dialog", ...)` to accept it, plus switch from a text-content assertion to `toHaveCount(0)` on the row locator for stability.

2. **Duplicate name handling had a race condition.** AI's first implementation only checked for duplicate job names at the serializer level (a database query before insert). I recognized this as a classic TOCTOU (time-of-check-time-of-use) race — two concurrent requests could both pass the check and then one would crash with a raw `IntegrityError`. I directed AI to add a `unique=True` constraint on the model, catch `IntegrityError` in the view layer, and return a clean 400 response. This is a defense-in-depth pattern: the serializer gives a friendly error message for the common case, and the database constraint + view-layer catch handles the edge case.

3. **Repeated lookup logic across view methods.** Four different view methods (retrieve, partial_update, destroy, statuses) all had the same pattern: parse the pk, catch `ValueError`, look up the job, catch `DoesNotExist`. AI had copy-pasted this block four times. I flagged this as a maintainability issue and directed the refactor into a single `_get_job_or_error_response()` helper method.

4. **No user-visible feedback for mutation failures.** The list page had error handling for the initial data fetch, but if a status update or delete failed silently, the user would have no idea. I designed the mutation error banner pattern and told AI where to place it and how to derive the message from `updateStatus.isError` / `deleteJob.isError`.

5. **Filter and sort logic was in the wrong layer.** Views were doing query parameter parsing, validation, and queryset filtering inline. I directed the refactor to move all of that into `selectors.py` so that views remain thin HTTP transport and selectors own the read logic. This is the services/selectors pattern — writes go through services, reads go through selectors.

6. **Frontend duplicate-name error was generic.** When a user tried to create a job with an existing name, they'd see "Failed to create job. Please try again." — useless. I designed the `HttpError` payload inspection in `JobForm.tsx` that checks for a 400 status with a `name` field containing "already exists," and maps it to the specific message "Duplicate name found. Please give a different name."

7. **Test warnings from missing staticfiles directory.** All 38 backend tests were producing `UserWarning: No directory at: /app/app/staticfiles/` because `collectstatic` was never run in the test container. I traced this to Django's middleware initialization and fixed it by adding `RUN mkdir -p /app/app/staticfiles` in the backend Dockerfile.

8. **Docker container staleness.** During development, I noticed code changes weren't reflected in running containers because I was restarting without rebuilding. This led to confusing test failures where old code was still running. I established the discipline of always using `--build` when bringing containers up during development.

### My prompting approach

I didn't use generic prompts like "build me a job dashboard." Instead, I:

- **Fed AI my planning documents first** and told it to align every implementation step to those docs.
- **Worked in small increments** — typically one or two files (or one focused feature) at a time, never more than 3-4 file edits per step.
- **Required check-in format** — before every edit, AI had to state what it planned to change, why, and how to verify. After every edit, it had to report what changed and what the next step was.
- **Used staff-level audit prompts** — I asked AI to review the codebase "as a senior staff engineer" against the evaluation criteria and identify every gap. Then I prioritized the findings and directed fixes one by one.
- **Tightened prompts when AI overbuilt** — early on, AI would try to implement entire features end-to-end. I constrained it to smaller steps to keep changes reviewable and reversible.

### Prompt refinement examples

I treated prompting like engineering design, not chat. The process was intentionally constrained and testable:

1. **Assumptions-first protocol**  
   I required the model to explicitly state its assumptions before implementation (data shape, endpoint behavior, error shape, environment expectations). I did not ask the model to guess what was right or wrong; I asked it to surface assumptions so I could validate them.

2. **Verification after each assumption set**  
   After assumptions were listed, I ran commands and tests to verify each one (`pytest`, `vitest`, Playwright, Docker commands, API calls). If an assumption failed in execution, the next prompt was a targeted correction with updated constraints.

3. **Checks-and-bounds instructions**  
   Prompts were never vague. Each task had bounded scope, explicit acceptance criteria, and output constraints (for example: exact files to edit, exact error message to return, exact status code, exact selector behavior, exact test assertion).

4. **Single-output / multi-output criteria**  
   For small tasks, I used single-output criteria (one concrete expected result). For larger tasks, I used multiple explicit output criteria (e.g., API behavior + regression test + UI error mapping), each independently verifiable.

5. **Custom instruction layer**  
   I also used custom instructions (`AGENTS.md` + docs guidance) to define role boundaries, execution style, step size, and review protocol. This reduced drift and kept model behavior consistent across long sessions.

Two concrete examples:

- **Backend regression hardening**  
  Broad prompt: “Add backend tests.”  
  Refined prompt: “State assumptions first, then add one regression test that monkeypatches `create_job` to raise `IntegrityError`, assert a `400` response with `{"name": ["A job with this name already exists."]}`, and run backend tests to verify.”

- **Frontend error UX precision**  
  Broad prompt: “Handle frontend errors.”  
  Refined prompt: “Assume 400 payload may contain field-level arrays; inspect `HttpError.payload.name` for duplicate-name semantics; map to a specific user-facing message; preserve generic fallback for all other failures; verify with component tests.”

This approach optimized model output quality because every prompt had explicit bounds, observable success criteria, and a verification loop tied to real commands.

---

## What's Implemented

### Core Requirements (all complete)

| Requirement                                                            | Status |
| ---------------------------------------------------------------------- | ------ |
| `Job` model with id, name, created_at, updated_at                      | ✅     |
| `JobStatus` model with id, job (FK), status_type (4 states), timestamp | ✅     |
| `GET /api/jobs/` — list all jobs with current status                   | ✅     |
| `POST /api/jobs/` — create job with auto-PENDING status                | ✅     |
| `PATCH /api/jobs/<id>/` — update status (appends new JobStatus)        | ✅     |
| `DELETE /api/jobs/<id>/` — delete job + cascade statuses               | ✅     |
| PostgreSQL database connection                                         | ✅     |
| React + TypeScript frontend                                            | ✅     |
| Job list with name and current status                                  | ✅     |
| Create-job form with client-side validation                            | ✅     |
| Per-job status update control (dropdown)                               | ✅     |
| Per-job delete button                                                  | ✅     |
| Basic API error handling + display                                     | ✅     |
| Dynamic UI updates after create/update/delete                          | ✅     |
| Presentable styled UI (Tailwind CSS)                                   | ✅     |
| Playwright E2E test covering critical flow                             | ✅     |
| Dockerfiles for backend and frontend                                   | ✅     |
| docker-compose.yml orchestrating all services                          | ✅     |
| Makefile with build/up/test/stop/clean                                 | ✅     |
| Performance considerations documented                                  | ✅     |

### Stretch Goals (all implemented)

| Stretch Goal                    | Implementation                                                            |
| ------------------------------- | ------------------------------------------------------------------------- |
| Job status history view         | `GET /api/jobs/<id>/statuses/` endpoint + timeline UI on details page     |
| Filtering and sorting           | Filter by status, sort by name or created_at (ascending/descending)       |
| Job details view (distinct URL) | `/jobs/:jobId` route with full job metadata + status history + pagination |
| Frontend unit tests             | 25 tests across 5 files (Vitest + React Testing Library)                  |
| Backend unit tests              | 38 tests across 3 files (pytest — models, services, API)                  |

---

## Architecture & Design Decisions

### Backend: Services/Selectors pattern

I chose a layered architecture for the Django backend, not because the assignment needs it at this scale, but because it demonstrates how I'd structure a real production codebase:

```
views.py       → HTTP transport (request parsing, response formatting)
serializers.py → Request validation and response shaping
services.py    → Write operations (transactional domain logic)
selectors.py   → Read operations (queries, filtering, sorting)
models.py      → Data layer (ORM models, indexes, constraints)
enums.py       → Shared constants (status types)
```

**Why this matters:** Views stay thin — they don't contain business logic or query construction. Services handle all writes inside `@transaction.atomic` blocks. Selectors own all read paths and validation of query parameters. This separation means you can test each layer independently and refactor one without touching the others.

### Denormalized current status

The `Job` model carries `current_status_type` and `current_status_timestamp` directly, updated atomically whenever a new `JobStatus` is appended. This is a deliberate trade-off:

- **Without denormalization:** `GET /api/jobs/` would need a correlated subquery or annotation to compute the latest status for every job in the list. At millions of rows, this becomes expensive.
- **With denormalization:** The list endpoint reads directly from indexed columns on `Job`. The cost is a slightly more complex write path (update two tables in one transaction), which is acceptable because reads vastly outnumber writes in a dashboard workload.

The full status history is preserved in `JobStatus` as an immutable append-only event log.

### Frontend: Feature-based organization

```
src/
  api/           → Centralized API client + typed contracts
  app/           → App shell (routes, providers)
  features/jobs/ → Everything related to jobs
    components/  → Presentational components (JobForm, JobList, JobRow, etc.)
    hooks/       → Data-fetching hooks (useJobsQuery, useCreateJob, etc.)
    pages/       → Route-level page components
  shared/        → Shared types and utilities
```

TanStack Query handles all server state — caching, background refetching, mutation invalidation. Each mutation hook automatically invalidates the jobs query on success, so the UI stays in sync without manual refetch calls.

### Unique job names (defense-in-depth)

Job names are enforced unique at three levels:

1. **Serializer validation** — checks `Job.objects.filter(name=...).exists()` for a user-friendly error message.
2. **Database constraint** — `unique=True` on the model field catches the TOCTOU race condition.
3. **View-layer IntegrityError catch** — converts the database exception to a clean 400 response if the serializer check passes but the constraint fires.

### Error handling philosophy

- **Backend:** Structured JSON error responses for all 4xx/5xx. Validation errors return field-level messages. Not-found returns `{"detail": "Job not found."}`.
- **Frontend:** API errors are thrown as typed `HttpError` objects with status code and response payload. Components inspect these to show contextual messages (e.g., "Duplicate name found" vs. generic "Failed to create job"). Mutation errors surface through a banner on the list page.

---

## API Reference

Base URL: `/api`

### List jobs

```
GET /api/jobs/?status=PENDING&sort=-created_at&limit=20&offset=0
```

Returns paginated list with `count`, `next`, `previous`, and `results`. Each result includes `current_status_type` directly on the job object.

**Query parameters:**

| Param    | Type   | Default       | Options                                      |
| -------- | ------ | ------------- | -------------------------------------------- |
| `status` | string | (none)        | `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`  |
| `sort`   | string | `-created_at` | `name`, `-name`, `created_at`, `-created_at` |
| `limit`  | int    | 20            | 1–100                                        |
| `offset` | int    | 0             | ≥ 0                                          |

### Create job

```
POST /api/jobs/
Content-Type: application/json

{"name": "Fluid Dynamics Simulation"}
```

Returns 201 with the created job. Automatically creates an initial `PENDING` status entry.

### Get job details

```
GET /api/jobs/<id>/
```

Returns job with full metadata and embedded status history.

### Update job status

```
PATCH /api/jobs/<id>/
Content-Type: application/json

{"status_type": "RUNNING"}
```

Appends a new `JobStatus` record and updates the denormalized current status on `Job`. Returns 200 with the new status entry.

### Delete job

```
DELETE /api/jobs/<id>/
```

Deletes the job and all associated status entries (cascade). Returns 204 No Content.

### Job status history

```
GET /api/jobs/<id>/statuses/?limit=20&offset=0
```

Returns paginated status history for a specific job, ordered newest-first.

### Health check

```
GET /health/
```

Returns `{"status": "ok"}` — used by Docker health checks and `make test` readiness polling.

---

## Testing Strategy

I built three layers of tests, each serving a different purpose.

### E2E tests (Playwright) — 1 test, the critical gate

This is the test that `make test` runs. It covers the complete critical user flow:

1. Navigate to the dashboard
2. Create a new job with a unique timestamped name
3. Verify the job appears in the list with `PENDING` status
4. Update status to `RUNNING` and verify
5. Update status to `COMPLETED` and verify
6. Delete the job (handling the browser confirmation dialog)
7. Verify the job is gone from the list

The test runs inside the official Playwright Docker container (`mcr.microsoft.com/playwright:v1.58.2-noble`) against the live compose stack. No mocks, no stubs — it hits the real Django API and PostgreSQL database.

**Reliability choices:**

- `data-testid` attributes on all interactive elements for stable selectors
- `toHaveCount(0)` instead of `not.toBeVisible()` for delete verification
- `page.once("dialog", ...)` to handle the native confirm dialog
- Unique timestamped job names to prevent test collision

### Backend tests (pytest) — 38 tests across 3 files

| File               | What it covers                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test_models.py`   | Model creation, timestamp auto-population, string representation, cascade delete, enum constraints                                                          |
| `test_services.py` | `create_job` transaction atomicity, initial status creation, `update_job_status` denormalization, `delete_job`, duplicate name IntegrityError               |
| `test_api.py`      | All endpoint responses, validation errors, pagination, filtering, sorting, 404 handling, invalid input, duplicate name rejection, IntegrityError regression |

Run them:

```bash
docker compose exec backend python -m pytest -v
```

### Frontend tests (Vitest + RTL) — 25 tests across 5 files

| File                    | What it covers                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `JobForm.test.tsx`      | Form rendering, validation (empty name), successful submission, loading state, API error display, duplicate-name-specific error message |
| `JobList.test.tsx`      | List rendering, empty state, status change callback, delete callback                                                                    |
| `StatusBadge.test.tsx`  | Correct rendering and styling for each status type                                                                                      |
| `Pagination.test.tsx`   | Page info display, prev/next disabled states, offset calculations, zero-total handling                                                  |
| `useJobsQuery.test.tsx` | Query hook behavior with mocked API                                                                                                     |

Run them (containerized):

```bash
docker compose run --rm playwright npm run test -- --run
```

Run them locally (optional):

```bash
cd frontend && npm run test -- --run
```

---

## Performance Considerations

This section addresses the assignment's requirement to consider millions of jobs in the database.

### What I implemented now

1. **Denormalized current status** — The `Job.current_status_type` field is indexed and queried directly for the list endpoint. No subqueries, no joins, no annotations on every list read. This is the single biggest performance win for a dashboard workload.

2. **Database indexes** — Strategic indexes on the fields that actually get queried:
   - `Job.current_status_type` (status filter)
   - `Job.created_at DESC` (default sort order)
   - `JobStatus(job_id, timestamp DESC)` composite index (history retrieval)
   - `Job.name` uniqueness index (also enables fast name sorts)

3. **Bounded pagination** — Every list endpoint enforces `limit/offset` pagination with a max page size of 100. The frontend requests pages of 10. No endpoint ever returns unbounded result sets.

4. **Server-side filtering and sorting** — All filtering (by status) and sorting (by name/date) happens in the database, not in Python or JavaScript. The frontend sends query params; the backend returns exactly the slice needed.

5. **No N+1 queries** — The list endpoint reads from `Job` directly (current status is denormalized), so there's no per-row subquery to `JobStatus`.

### What I'd add at true scale

- **Cursor-based pagination** for more stable paging under high write concurrency (offset-based can skip/duplicate rows when data changes between pages).
- **Read replicas** for the dashboard list endpoint to offload the primary.
- **Connection pooling** (PgBouncer) in front of Postgres.
- **CDN for static assets** — the Nginx-served frontend build could be pushed to a CDN.
- **Query result caching** for hot filter combinations (e.g., Redis with short TTL).
- **Database partitioning** on `JobStatus` by time range if the event log grows to billions of rows.

---

## Time Spent

Approximate total time spent: **3 hours total over the course of 3 days**

This includes planning, architecture design, implementation, debugging, testing, and documentation.

---
