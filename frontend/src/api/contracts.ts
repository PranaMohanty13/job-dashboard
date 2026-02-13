/**
 * API request/response contracts.
 *
 * Domain types (Job, JobStatus, etc.) live in `shared/types/job.ts`.
 * This file re-exports them for convenience and defines API-specific
 * request shapes that are not relevant to the UI layer.
 */

export type {
  Job as JobDto,
  JobStatus as JobStatusDto,
  JobStatusType,
  JobsSortBy,
  PaginatedResponse,
} from "../shared/types/job";

import type { JobStatusType, JobsSortBy } from "../shared/types/job";

export interface CreateJobRequest {
  name: string;
}

export interface UpdateJobStatusRequest {
  status_type: JobStatusType;
}

export interface JobsListQueryParams {
  status?: JobStatusType;
  sort?: JobsSortBy;
  limit?: number;
  offset?: number;
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
