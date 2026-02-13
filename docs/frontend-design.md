# Frontend Design (React + TypeScript)

## Architectural Intent

Build a robust, typed dashboard UI with minimal complexity, clear async states, and deterministic testability.

## Technology Choices

- React + TypeScript (Vite)
- React Router for page-level navigation
- Server state manager (React Query) for cache/invalidation
- Lightweight styling system (Tailwind or scoped CSS) for presentable UI

## App Structure

```text
frontend/src/
  app/
    routes.tsx
    providers.tsx
  api/
    client.ts
    jobs.ts
  features/jobs/
    components/
      JobList.tsx
      JobRow.tsx
      JobForm.tsx
      StatusSelector.tsx
      FiltersBar.tsx
      SortControl.tsx
    pages/
      JobsListPage.tsx
      JobDetailsPage.tsx
    hooks/
      useJobsQuery.ts
      useCreateJob.ts
      useUpdateJobStatus.ts
      useDeleteJob.ts
      useJobHistory.ts
  shared/
    ui/
    types/
    utils/
```

## State Management Strategy

- Server state in React Query:
  - list fetching
  - mutation success invalidation/refetch
  - retry policy and error surfaces
- Local component state only for transient UI (form input, filter dropdown values).

## UX Flows (Core)

- Jobs list loads with loading/empty/error states.
- Create job form validates non-empty name before submit.
- Status change control per row sends PATCH and refreshes affected data.
- Delete action removes item and updates list.

## Stretch Goals Integrated

- Filter by current status at list level.
- Sort by name and creation date.
- Details route: `/jobs/:id`.
- Job details page includes status timeline/history.

## API Contract Expectations

- Strongly typed request/response DTOs.
- Centralized API client error normalization.
- Query params for pagination, filtering, sorting.

## Performance Readiness

- Paginated rendering (never render unbounded dataset).
- Stable list keys and minimal re-renders.
- Avoid deep prop drilling via feature hooks and co-located logic.
- Optional virtualization if page size increases in future.

## Accessibility and Usability Baseline

- Semantic form controls and labels.
- Keyboard-accessible actions and select controls.
- Clear status badges and consistent action placement.

## Testing Readiness

- Deterministic selectors (`data-testid`) for key interactive elements.
- Route-level and component-level boundaries make RTL tests straightforward.
- API errors are visible and assertable in E2E/unit tests.

## Alignment to Evaluation Criteria

- Type safety: fully typed DTOs and component props.
- Readability/modularity: feature-based folder organization.
- Error handling: explicit async UI states.
- Professional quality: route-driven extensibility and coherent UX.
