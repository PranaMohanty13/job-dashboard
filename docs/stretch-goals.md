# Stretch Goals Integration Plan

## Principle

Stretch goals are integrated into core architecture phases rather than deferred as optional afterthoughts.

## Stretch Goal Matrix

### 1) Job Status History View

- Backend:
  - add history endpoint (`GET /api/jobs/<id>/statuses/`)
  - indexed status timeline query by `job_id, timestamp`
- Frontend:
  - details page timeline component
- Phase coverage:
  - Backend foundation (Phase 1), Frontend core (Phase 2), Testing (Phase 4)

### 2) Filtering and Sorting

- Backend:
  - query params for `status`, `sort=name|created_at`, `order=asc|desc`
  - paginated responses with stable ordering
- Frontend:
  - filter/sort controls bound to query state
- Phase coverage:
  - Backend foundation (Phase 1), Frontend core (Phase 2), Testing (Phase 4)

### 3) Job Details View (Distinct URL)

- Backend:
  - `GET /api/jobs/<id>/`
- Frontend:
  - route `/jobs/:id`
  - details panel with metadata + latest status + history
- Phase coverage:
  - Backend foundation (Phase 1), Frontend core (Phase 2), Testing (Phase 4)

### 4) Frontend Unit Tests

- Scope:
  - core components and hooks for jobs workflows
- Phase coverage:
  - Frontend core design in Phase 2, execution in Phase 4

### 5) Backend Unit Tests

- Scope:
  - model/service/API tests focused on invariants and transitions
- Phase coverage:
  - backend foundation in Phase 1, execution in Phase 4

## Why This Demonstrates Senior-Level Maturity

- Avoids architectural dead-ends by planning extensibility early.
- Ensures stretch features reuse core abstractions (service layer, typed client, routing).
- Couples feature delivery with testability and operational reproducibility.
- Balances scope with reviewer priorities (`make test` reliability first).

## Non-Goals

- No speculative features outside assignment scope.
- No unnecessary complexity in auth/multi-tenant concerns unless requested.
