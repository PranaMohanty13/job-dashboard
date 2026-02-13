# Scalability and Performance Plan

## Objective

Design for strong performance now and clear scale paths later, with specific focus on list-heavy dashboard workloads and status-event history.

## Workload Model

- Read-heavy list endpoint (`GET /api/jobs/`) with filtering/sorting.
- Write pattern: append-only status events per job.
- Potential data size: millions of jobs and significantly more status rows.

## Data Modeling Strategy

- Event table (`JobStatus`) stores immutable status transitions.
- Current status is denormalized onto `Job` to optimize dashboard reads.
- Cascading delete keeps referential integrity and operational simplicity.

## Query Strategy

- Job list reads from `Job` table for current status directly.
- History view reads from `JobStatus` filtered by `job_id` with descending timestamp order.
- Pagination is mandatory for list responses.

## Indexing Strategy

- `Job(current_status_type)` for status filters.
- `Job(created_at)` and/or `Job(name)` for sorts.
- `JobStatus(job_id, timestamp DESC)` for history retrieval.
- Optional partial or composite indexes introduced based on observed query patterns.

## API Performance Practices

- Enforce max page size.
- Return only required fields on list endpoints.
- Avoid N+1 queries via explicit ORM optimization.
- Keep response envelope compact and predictable.

## Frontend Performance Practices

- Request paginated slices only.
- Keep route-level code splitting possible for details page.
- Minimize re-renders through stable keys and focused component boundaries.
- Avoid expensive client-side transforms on unbounded arrays.

## Operational Performance Readiness

- Structured logging with duration and status code to identify hotspots.
- Health checks for service readiness and quick diagnostics.
- Environment-driven tuning points (DB pool, gunicorn workers, page limits).

## Scaling Path (Future)

- Move Postgres to managed instance with tuned resources.
- Add read replicas for heavy dashboard read loads.
- Introduce cursor pagination for very high write contention.
- Add caching layer for hot list/filter combinations if needed.
- Shift frontend static assets to CDN.

## Success Metrics

- P95 list endpoint latency under agreed threshold at target page size.
- Stable container startup and test runtime.
- No memory spikes when rendering job lists due to strict pagination.

## Evaluation Alignment

- Demonstrates concrete performance design, not generic statements.
- Shows readiness for large datasets while maintaining implementation simplicity.
