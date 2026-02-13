export type JobStatusType = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export const JOB_STATUS_OPTIONS: JobStatusType[] = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
];

export type JobsSortBy = "name" | "-name" | "created_at" | "-created_at";

export const JOB_SORT_OPTIONS: { label: string; value: JobsSortBy }[] = [
  { label: "Newest", value: "-created_at" },
  { label: "Oldest", value: "created_at" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Name (Z-A)", value: "-name" },
];

export interface Job {
  id: number;
  name: string;
  current_status_type: JobStatusType;
  current_status_timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface JobStatus {
  id: number;
  status_type: JobStatusType;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
