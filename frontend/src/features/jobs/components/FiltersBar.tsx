import {
  JOB_STATUS_OPTIONS,
  JOB_SORT_OPTIONS,
} from "../../../shared/types/job";
import type { JobStatusType, JobsSortBy } from "../../../shared/types/job";

const VALID_STATUSES = new Set<string>(JOB_STATUS_OPTIONS);
const VALID_SORTS = new Set<string>(JOB_SORT_OPTIONS.map((o) => o.value));

function isStatusFilter(value: string): value is JobStatusType | "" {
  return value === "" || VALID_STATUSES.has(value);
}

function isSortOption(value: string): value is JobsSortBy {
  return VALID_SORTS.has(value);
}

interface FiltersBarProps {
  statusFilter: JobStatusType | "";
  sortBy: JobsSortBy;
  onStatusFilterChange: (status: JobStatusType | "") => void;
  onSortChange: (sort: JobsSortBy) => void;
}

const SORT_LABELS: Record<JobsSortBy, string> = {
  created_at: "Created (oldest first)",
  "-created_at": "Created (newest first)",
  name: "Name A → Z",
  "-name": "Name Z → A",
};

export function FiltersBar({
  statusFilter,
  sortBy,
  onStatusFilterChange,
  onSortChange,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Status filter */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="status-filter"
          className="text-sm font-medium text-slate-300"
        >
          Status
        </label>
        <select
          id="status-filter"
          data-testid="status-filter"
          value={statusFilter}
          onChange={(e) => {
            const value = e.target.value;
            if (isStatusFilter(value)) {
              onStatusFilterChange(value);
            }
          }}
          className="rounded-md border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All</option>
          {JOB_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-select"
          className="text-sm font-medium text-slate-300"
        >
          Sort
        </label>
        <select
          id="sort-select"
          data-testid="sort-select"
          value={sortBy}
          onChange={(e) => {
            const value = e.target.value;
            if (isSortOption(value)) {
              onSortChange(value);
            }
          }}
          className="rounded-md border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {JOB_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {SORT_LABELS[opt.value]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
