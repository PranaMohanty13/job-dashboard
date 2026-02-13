import type { Job, JobStatusType } from "../../../shared/types/job";
import { JobRow } from "./JobRow";

interface JobListProps {
  jobs: Job[];
  onStatusChange: (jobId: number, newStatus: JobStatusType) => void;
  onDelete: (jobId: number) => void;
  isUpdatingJobId?: number | null;
  isDeletingJobId?: number | null;
}

export function JobList({
  jobs,
  onStatusChange,
  onDelete,
  isUpdatingJobId = null,
  isDeletingJobId = null,
}: JobListProps) {
  if (jobs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No jobs found. Create one above to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {jobs.map((job) => (
        <JobRow
          key={job.id}
          job={job}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          isUpdating={isUpdatingJobId === job.id}
          isDeleting={isDeletingJobId === job.id}
        />
      ))}
    </ul>
  );
}
