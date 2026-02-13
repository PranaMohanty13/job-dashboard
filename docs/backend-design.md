# Backend Design (Django + PostgreSQL)

## Architectural Intent

Build a modular backend that treats status updates as immutable events (`JobStatus`) while exposing efficient current-state reads for dashboards.

## Proposed Module Structure

```text
backend/
  app/
    config/              # settings, urls, wsgi/asgi
    jobs/
      models.py          # Job, JobStatus
      enums.py           # JobStatusType
      services.py        # transactional domain workflows
      selectors.py       # read/query logic
      serializers.py     # request/response contracts
      views.py           # API endpoints
      urls.py
      tests/
        test_models.py
        test_services.py
        test_api.py
```

## Domain Model

### Job

- `id`: BigAutoField
- `name`: varchar (indexed for sort/search readiness)
- `created_at`: DateTime (auto)
- `updated_at`: DateTime (auto)
- `current_status_type`: denormalized latest status (enum string)
- `current_status_timestamp`: latest status timestamp

### JobStatus

- `id`: BigAutoField
- `job_id`: FK with cascade delete
- `status_type`: enum (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`)
- `timestamp`: DateTime (indexed)

## Why Denormalize Current Status

`GET /api/jobs/` is the hottest read path. For large datasets, computing latest status via correlated subqueries on every row can become expensive. Denormalizing `current_status_*` on `Job` gives fast list/filter reads while preserving full audit history in `JobStatus`.

## Transaction and Consistency Rules

- Job creation and initial status creation happen in one atomic transaction.
- Status updates append a new `JobStatus` row and update `Job.current_status_*` in the same transaction.
- Deletion of `Job` cascades to `JobStatus`.

## API Design

- `GET /api/jobs/`
  - paginated list
  - returns fields needed by dashboard by default
- `POST /api/jobs/`
  - validates `name`
  - creates job + initial `PENDING`
- `PATCH /api/jobs/<id>/`
  - required `status_type` for event append
  - optional name update can be supported without violating spec
- `DELETE /api/jobs/<id>/`
  - hard delete
- Stretch endpoints:
  - `GET /api/jobs/<id>/`
  - `GET /api/jobs/<id>/statuses/`

## Query & Index Strategy

- `Job`
  - index on `current_status_type`
  - index on `created_at`
  - optional index on `name` for sort/search
- `JobStatus`
  - composite index `(job_id, timestamp DESC)` for history retrieval
  - index on `status_type` for analytics/filter evolution

## Pagination Strategy

- Default `limit/offset` for implementation speed and reviewer readability.
- Upper bound on page size (e.g., 100) to avoid memory-heavy responses.
- Option to migrate to cursor pagination if write volume grows.

## Validation & Error Handling

- Serializer-level validation for required fields and enum values.
- Return consistent error shape for 4xx/5xx to simplify frontend handling.
- Log structured request metadata for production debugging.

## Security & Config Baseline

- Environment-driven settings (DB URL, secrets, debug flag, allowed hosts).
- CORS allowlist for frontend origin in development and dockerized environment.
- No auth layer unless explicitly required by future scope.

## Extensibility Hooks

- Service layer isolates domain transitions from transport layer.
- Selector/query layer isolates read optimizations.
- Event model enables future workflows (retry, cancellation, SLA analytics).

## Alignment to Evaluation Criteria

- Correctness: strict endpoint semantics and transactional status events.
- Maintainability/modularity: clear layering (`services`, `selectors`, `serializers`, `views`).
- Performance: denormalized current status, indexes, pagination.
- Error handling: normalized API error contract.
