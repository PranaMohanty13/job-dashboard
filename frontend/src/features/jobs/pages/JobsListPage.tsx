import { useState } from "react";
import type { JobStatusType, JobsSortBy } from "../../../shared/types/job";
import { useJobsQuery } from "../hooks/useJobsQuery";
import { useUpdateJobStatus } from "../hooks/useUpdateJobStatus";
import { useDeleteJob } from "../hooks/useDeleteJob";
import { JobForm } from "../components/JobForm";
import { FiltersBar } from "../components/FiltersBar";
import { JobList } from "../components/JobList";
import { Pagination } from "../components/Pagination";

const PAGE_SIZE = 10;

export function JobsListPage() {
  const [statusFilter, setStatusFilter] = useState<JobStatusType | "">("");
  const [sortBy, setSortBy] = useState<JobsSortBy>("-created_at");
  const [offset, setOffset] = useState(0);

  const queryParams = {
    ...(statusFilter && { status: statusFilter }),
    sort: sortBy,
    limit: PAGE_SIZE,
    offset,
  };

  const { data, isLoading, isError } = useJobsQuery(queryParams);
  const updateStatus = useUpdateJobStatus();
  const deleteJob = useDeleteJob();

  function handleStatusFilterChange(status: JobStatusType | "") {
    setStatusFilter(status);
    setOffset(0);
  }

  function handleSortChange(sort: JobsSortBy) {
    setSortBy(sort);
    setOffset(0);
  }

  function handleStatusChange(jobId: number, newStatus: JobStatusType) {
    updateStatus.mutate({ jobId, statusType: newStatus });
  }

  function handleDelete(jobId: number) {
    deleteJob.mutate(jobId);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-100">Job Dashboard</h1>

      <JobForm />

      <FiltersBar
        statusFilter={statusFilter}
        sortBy={sortBy}
        onStatusFilterChange={handleStatusFilterChange}
        onSortChange={handleSortChange}
      />

      {isLoading && (
        <p className="py-8 text-center text-sm text-slate-500">Loading jobs…</p>
      )}

      {isError && (
        <p className="py-8 text-center text-sm text-red-400">
          Failed to load jobs. Please try again.
        </p>
      )}

      {data && (
        <>
          <JobList
            jobs={data.results}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            isUpdating={updateStatus.isPending}
            isDeleting={deleteJob.isPending}
          />
          <Pagination
            offset={offset}
            limit={PAGE_SIZE}
            total={data.count}
            onPageChange={setOffset}
          />
        </>
      )}
    </div>
  );
}
