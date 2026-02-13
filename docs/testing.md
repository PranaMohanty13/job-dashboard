# Testing Strategy

## Goals

- Ensure `make test` is reliable and repeatable from a clean environment.
- Validate core user workflows and key domain invariants.
- Integrate stretch coverage for confidence and engineering maturity.

## Test Pyramid

### E2E (Playwright) — Required Gate

Primary evaluator-facing verification.

- Scenario 1: Create job and verify initial `PENDING` status.
- Scenario 2: Update status and verify latest status reflects change.
- Scenario 3 (recommended): Delete job and verify list removal.

### Backend Unit/Integration Tests — Stretch (Integrated)

- Model tests:
  - Job timestamps and defaults
  - status enum constraints
- Service tests:
  - create job + initial status transaction
  - append status updates current denormalized fields
- API tests:
  - endpoint responses, validation errors, pagination/filter behavior

### Frontend Unit Tests — Stretch (Integrated)

- Job form validation and submit behavior
- Job list rendering for loading/empty/error states
- Status update and delete action handlers (mocked API)

## E2E Reliability Principles

- Use deterministic selectors (`data-testid`) for actions/assertions.
- Avoid arbitrary sleeps; wait on UI state or network completion.
- Use unique test data identifiers to prevent collisions.
- Keep tests isolated and idempotent.

## Execution Model

- Tests execute inside Docker (Playwright service) to avoid host browser dependency.
- `make test` is the canonical entrypoint.
- Fail-fast semantics: any E2E failure fails the command.

## Suggested File Layout

```text
backend/app/jobs/tests/
  test_models.py
  test_services.py
  test_api.py

frontend/src/features/jobs/__tests__/
  JobForm.test.tsx
  JobList.test.tsx

tests/e2e/
  job-dashboard.spec.ts
```

## Coverage Scope by Phase

- Phase 1: API contract tests start (backend foundation includes API layer).
- Phase 2: frontend component tests start.
- Phase 4: complete E2E suite and reliability hardening.

## Alignment to Evaluation Criteria

- Correctness: critical flows validated end-to-end.
- Reliability: deterministic selectors and containerized browser runtime.
- Quality: layered tests support maintainability and refactoring.
