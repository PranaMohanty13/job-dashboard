# Evaluation Criteria Mapping

## Purpose

Map each reviewer criterion to concrete implementation artifacts and validation signals.

## Build/Test Gate

- Criterion: evaluator runs `make test` first; if it fails, review ends.
- Evidence expected:
  - working `Makefile` with deterministic `test` target
  - dockerized Playwright execution
  - compose-managed backend/db/frontend startup

## Correctness

- Criterion: app meets all core requirements.
- Evidence expected:
  - API endpoints implemented exactly as specified
  - frontend supports list/create/update/delete workflows
  - dynamic UI updates and validation

## Code Quality

- Readability:
  - clear naming, small focused modules, consistent formatting
- Maintainability:
  - layered backend (services/selectors/serializers/views)
  - feature-based frontend organization
- Modularity:
  - API client abstraction; backend domain service boundary
- Error handling:
  - normalized API errors and user-visible UI messages
- Type safety:
  - typed DTOs and strict TS setup

## Testing Quality

- Criterion: reliable E2E on critical path.
- Evidence expected:
  - Playwright tests for create/update (and delete recommended)
  - deterministic selectors and no timing flake patterns
- Bonus quality:
  - backend + frontend unit tests for regression safety

## Setup & Deployment

- Criterion: easy startup via Docker/Compose/Make.
- Evidence expected:
  - backend/frontend Dockerfiles
  - compose stack with Postgres
  - health checks and cleanup commands

## Problem Solving

- Criterion: demonstrates thoughtful approach.
- Evidence expected:
  - clear README architecture notes
  - rationale for indexing/pagination/current-status strategy
  - phase/commit planning clarity

## Attention to Detail

- Criterion: professionalism and polish.
- Evidence expected:
  - complete docs
  - consistent naming conventions
  - reproducible local workflow and test stability

## Traceability Table

| Reviewer Dimension         | Primary Artifact               | Secondary Artifact     | Validation                         |
| -------------------------- | ------------------------------ | ---------------------- | ---------------------------------- |
| Build/test repeatability   | Makefile                       | docker-compose.yml     | `make test` passes from clean host |
| Backend correctness        | API views/serializers/services | backend tests          | CRUD + status semantics verified   |
| Frontend correctness       | jobs pages/components          | Playwright tests       | user flows pass                    |
| Performance readiness      | DB indexes + pagination        | scalability doc/README | bounded list queries               |
| Modularity/maintainability | layered folders                | docs/backend-design.md | low coupling, clear boundaries     |
| Type safety                | TS config + typed API client   | frontend tests         | compile/test confidence            |
| Professionalism            | docs set + README              | prompt writeup         | reviewer-friendly handoff          |

## Final Reviewer Checklist

- `make build`, `make up`, `make test`, `make stop`, `make clean` all function as documented.
- Core requirements implemented and manually verifiable.
- E2E stable and meaningful.
- Stretch goals integrated with architecture and tests.
- Performance and scaling strategy documented with concrete decisions.
