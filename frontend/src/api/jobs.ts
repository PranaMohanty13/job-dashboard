import { apiRequest } from "./client";
import type {
  CreateJobRequest,
  JobDto,
  JobStatusDto,
  JobsListQueryParams,
  PaginatedResponse,
  UpdateJobStatusRequest,
} from "./contracts";

function toQueryString(params: JobsListQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }
  if (typeof params.offset === "number") {
    searchParams.set("offset", String(params.offset));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function listJobs(params: JobsListQueryParams = {}) {
  return apiRequest<PaginatedResponse<JobDto>>(
    `/jobs/${toQueryString(params)}`,
  );
}

export function createJob(payload: CreateJobRequest) {
  return apiRequest<JobDto>("/jobs/", {
    method: "POST",
    body: payload,
  });
}

export function getJob(jobId: number) {
  return apiRequest<JobDto>(`/jobs/${jobId}/`);
}

export function updateJobStatus(
  jobId: number,
  payload: UpdateJobStatusRequest,
) {
  return apiRequest<JobDto>(`/jobs/${jobId}/`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteJob(jobId: number): Promise<void> {
  await apiRequest<null>(`/jobs/${jobId}/`, {
    method: "DELETE",
  });
}

export function listJobStatuses(
  jobId: number,
  params: Pick<JobsListQueryParams, "limit" | "offset"> = {},
) {
  return apiRequest<PaginatedResponse<JobStatusDto>>(
    `/jobs/${jobId}/statuses/${toQueryString(params)}`,
  );
}
