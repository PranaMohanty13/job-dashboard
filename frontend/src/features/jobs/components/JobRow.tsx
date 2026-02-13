import { Link } from "react-router-dom";
import type { Job, JobStatusType } from "../../../shared/types/job";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";

interface JobRowProps {
  job: Job;
  onStatusChange: (jobId: number, newStatus: JobStatusType) => void;
  onDelete: (jobId: number) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function JobRow({
  job,
  onStatusChange,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: JobRowProps) {
  return (
    <li
      data-testid={`job-row-${job.id}`}
      className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 shadow-sm transition hover:border-slate-600 hover:shadow-md"
    >
      <Link
        to={`/jobs/${job.id}`}
        className="min-w-0 flex-1 truncate font-medium text-slate-100 hover:text-blue-400 hover:underline"
        data-testid={`job-link-${job.id}`}
      >
        {job.name}
      </Link>

      <StatusBadge status={job.current_status_type} />

      <StatusSelector
        jobId={job.id}
        currentStatus={job.current_status_type}
        disabled={isUpdating}
        onStatusChange={onStatusChange}
      />

      <button
        type="button"
        data-testid={`delete-job-${job.id}`}
        onClick={() => onDelete(job.id)}
        disabled={isDeleting}
        className="rounded-md border border-red-800 bg-red-950 px-3 py-1 text-sm font-medium text-red-300 hover:bg-red-900 disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}
